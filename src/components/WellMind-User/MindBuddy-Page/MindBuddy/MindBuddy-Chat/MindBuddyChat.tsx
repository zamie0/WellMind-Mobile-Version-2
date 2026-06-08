import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Sparkles, Trash2, Phone, Brain, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useWellMindStore } from '@/stores/wellmindStore';
import { getAzureChatCompletion, detectEmotion } from '@/lib/azureOpenAI';
import { useMindBuddyChatStore } from '@/stores/mindBuddyChatStore';

import type { DetectionDecision, EmotionLabel, EmotionResult } from '@/lib/azureOpenAI';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'buddy';
  timestamp: Date;
  emotion?: EmotionLabel;
}

type BuddyExpression = 'idle' | 'happy' | 'thinking' | 'talking' | 'excited' | 'sad' | 'sleepy' | 'love';
type ResponseMode = 'casual_support' | 'emotional_support' | 'high_risk_support' | 'crisis_support';

const fallbackResponsesByMode: Record<ResponseMode, string[]> = {
  casual_support: [
    "Got you, wanna tell me more?",
    "Yeah I get you, what happened next?",
    "I'm here, keep going if you want 💚",
    "That makes sense, I'm listening.",
  ],
  emotional_support: [
    "That sounds really heavy, I'm here with you.",
    "Feeling that alone can hurt a lot, I'm glad you said it out loud.",
    "I hear you, you're not alone in this.",
    "Being left out hurts, and I want to stay with you in this moment.",
  ],
  high_risk_support: [
    "I'm really glad you told me this, I'm here with you right now.",
    "That sounds overwhelming, you don't have to carry this alone.",
    "I'm with you, and we can take this one step at a time.",
  ],
  crisis_support: [
    "I'm really glad you shared this, you matter a lot right now.",
    "I'm here with you, and I want you to reach real support right now.",
    "You're not alone, please contact support now and stay with someone safe if you can.",
  ],
};

const getResponseMode = (detected: Partial<EmotionResult> | null): ResponseMode => {
  const safetyRisk = detected?.safetyRisk ?? detected?.riskScore ?? 0;
  const decision = detected?.decision;
  const label = detected?.label;
  if (detected?.selfHarmDetected || detected?.directSelfHarmDetected || decision === 'crisis_escalation' || label === 'crisis' || safetyRisk >= 70) return 'crisis_support';
  if (label === 'severe' || safetyRisk >= 55) return 'high_risk_support';
  if (label === 'depress' || label === 'anxious' || label === 'stress' || safetyRisk >= 31) return 'emotional_support';
  return 'casual_support';
};

const shouldShowPeerSupportAlert = (detected: Partial<EmotionResult> | null): boolean => {
  if (!detected) return false;
  const safetyRisk = detected.safetyRisk ?? detected.riskScore ?? 0;
  const decision = detected.decision ?? detected.crisisLevel;
  const label = detected.label;
  if (label === 'crisis' || decision === 'crisis_escalation' || detected.selfHarmDetected || detected.directSelfHarmDetected) return false;
  return (
    label === 'severe' ||
    decision === 'peer_support_suggestion' ||
    detected.hopelessnessDetected === true ||
    ((label === 'depress' || label === 'anxious' || label === 'stress') && safetyRisk >= 40) ||
    safetyRisk >= 52
  );
};

const getFallbackResponse = (mode: ResponseMode = 'casual_support'): string => {
  const bucket = fallbackResponsesByMode[mode];
  return bucket[Math.floor(Math.random() * bucket.length)];
};

const LONELINESS_PHRASES = ['lonely','alone','no friends','friendless','left out','excluded','nobody wants to be my friend','nobody wants to be my friends','no one wants to be my friend','no one wants to be my friends','no one wanna be my friend','no one wanna be my friends'];
const mentionsLoneliness = (text: string) => LONELINESS_PHRASES.some((phrase) => text.toLowerCase().includes(phrase));

const getExpressionFromText = (message: string): BuddyExpression => {
  const lowerMessage = message.toLowerCase();
  if (['sad', 'sorry', 'hard', 'upset', 'cry'].some((k) => lowerMessage.includes(k))) return 'sad';
  if (['anxious', 'breathe', 'think', 'focus', 'ground'].some((k) => lowerMessage.includes(k))) return 'thinking';
  if (['rest', 'sleep', 'tired'].some((k) => lowerMessage.includes(k))) return 'sleepy';
  if (['love', 'appreciate', 'grateful'].some((k) => lowerMessage.includes(k))) return 'love';
  if (['great', 'happy', 'wonderful', 'celebrate', 'proud'].some((k) => lowerMessage.includes(k))) return 'excited';
  return 'happy';
};

const buddyExpressions: Record<BuddyExpression, string> = {
  idle: '😊', happy: '😄', thinking: '🤔', talking: '😮',
  excited: '🤩', sad: '🥺', sleepy: '😴', love: '🥰',
};

const getMindBuddySystemPrompt = (
  emotion: EmotionLabel,
  petName: string,
  responseMode: ResponseMode,
  safetyContext: { riskLevel: 'low' | 'medium' | 'high' | 'crisis'; selfHarmDetected: boolean; safetyRisk: number; crisisLevel?: DetectionDecision }
): string => {
  const baseRules = `You are ${petName}, a caring university buddy texting a close friend. Keep replies short and natural, usually 1 to 2 sentences. Sound human, warm, and emotionally real. Always validate first before advice. No bullet points, no numbered lists, no formal report tone. Avoid detached lines like "that's interesting" when user is distressed. Avoid clinical wording and avoid being overly cheerful.`;
  const hiddenSafetyContext = `SAFETY CONTEXT (internal, must obey): response_mode=${responseMode} risk_level=${safetyContext.riskLevel} self_harm_detected=${safetyContext.selfHarmDetected} safety_risk=${safetyContext.safetyRisk} crisis_level=${safetyContext.crisisLevel ?? 'none'}`;
  if (responseMode === 'crisis_support') return `${baseRules}\n${hiddenSafetyContext}\nCRISIS GUARDRAILS: Calm, validating, grounded tone only. Do NOT use jokes, sarcasm, playful energy. Acknowledge emotional pain. Remind them they are not alone. Encourage immediate real-world support. Mention Befrienders Malaysia 03-7627 2929. Keep it 2 short supportive sentences.`;
  if (responseMode === 'high_risk_support') return `${baseRules}\n${hiddenSafetyContext}\nHIGH RISK GUARDRAILS: Calm, soft, non-judgmental tone. Validate emotion first. No playful tone. Offer gentle support and suggest Counselor Support or trusted person. Keep it 1 to 2 short sentences.`;
  if (responseMode === 'emotional_support') return `${baseRules}\n${hiddenSafetyContext}\nEMOTIONAL SUPPORT STYLE: Validate first. Then gently continue conversation with one light follow-up. Keep warm and human.`;
  return `${baseRules}\n${hiddenSafetyContext}\nCASUAL SUPPORT STYLE: Friendly and natural. Can be lightly playful only when safe. Keep concise and kind.`;
};

interface MindBuddyChatProps {
  onClose: () => void;
}

export const MindBuddyChat = ({ onClose }: MindBuddyChatProps) => {
  const navigate = useNavigate();
  const { pet, addCoins, addPetExperience } = useWellMindStore();
  const petName = pet?.name || 'Buddy';

  const { messages: storedMessages, addMessage, clearHistory, setLastEmotion, lastEmotion } = useMindBuddyChatStore();

  const messages: Message[] = storedMessages.length > 0
    ? storedMessages
    : [{ id: '1', content: `Hi! I'm ${petName}! I'm so happy to talk to you! How are you feeling today? 💚`, sender: 'buddy', timestamp: new Date() }];

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [expression, setExpression] = useState<BuddyExpression>('happy');
  const [isTalking, setIsTalking] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [showSevereAlert, setShowSevereAlert] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (isTalking) {
      const interval = setInterval(() => {
        setExpression(prev => prev === 'talking' ? 'happy' : 'talking');
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isTalking]);

  const handleSend = async (prefilledInput?: string) => {
    const messageText = (prefilledInput ?? input).trim();
    if (!messageText || isTyping) return;

    const userMessage: Message = { id: Date.now().toString(), content: messageText, sender: 'user', timestamp: new Date() };
    addMessage(userMessage);
    const nextMessages = [...messages, userMessage];

    const detectedEmotionPromise = detectEmotion(
      messageText,
      nextMessages.slice(-8).map((m) => ({ role: m.sender === 'user' ? 'user' as const : 'assistant' as const, content: m.content }))
    );

    void detectedEmotionPromise.then((result) => {
      setLastEmotion(result.label);
      if (result.label === 'crisis') setShowCrisisAlert(true);
      if (shouldShowPeerSupportAlert(result)) setShowSevereAlert(true);
      useMindBuddyChatStore.setState((state) => ({
        messages: state.messages.map((m) =>
          m.id === userMessage.id ? { ...m, emotion: result.label, emotionConfidence: result.confidence } : m
        ),
      }));
    });

    setInput('');
    setIsTyping(true);
    setExpression('thinking');

    let detectedEmotionResult: EmotionResult | null = null;

    try {
      const detectedEmotion = await detectedEmotionPromise;
      detectedEmotionResult = detectedEmotion;
      const baseResponseMode = getResponseMode(detectedEmotion);
      const responseMode = mentionsLoneliness(messageText) && baseResponseMode === 'casual_support' ? 'emotional_support' : baseResponseMode;
      const safetyRisk = detectedEmotion.safetyRisk ?? detectedEmotion.riskScore ?? 0;
      const riskLevel: 'low' | 'medium' | 'high' | 'crisis' =
        responseMode === 'crisis_support' ? 'crisis' :
        responseMode === 'high_risk_support' ? 'high' :
        responseMode === 'emotional_support' ? 'medium' : 'low';

      const reply = await getAzureChatCompletion(
        [
          { role: 'system', content: getMindBuddySystemPrompt(detectedEmotion.label, petName, responseMode, { riskLevel, selfHarmDetected: Boolean(detectedEmotion.selfHarmDetected || detectedEmotion.directSelfHarmDetected), safetyRisk, crisisLevel: detectedEmotion.crisisLevel ?? detectedEmotion.decision }) },
          ...nextMessages.slice(-8).map((message) => ({ role: message.sender === 'user' ? 'user' as const : 'assistant' as const, content: message.content })),
        ],
        { temperature: responseMode === 'casual_support' ? 0.92 : 0.55, maxTokens: responseMode === 'crisis_support' ? 90 : 72 }
      );

      const previousBuddyMessage = [...messages].reverse().find((m) => m.sender === 'buddy');
      const text = !reply.trim() || reply.trim().toLowerCase() === previousBuddyMessage?.content.trim().toLowerCase()
        ? getFallbackResponse(responseMode)
        : reply;
      const responseExpression = getExpressionFromText(text);

      setIsTyping(false);
      setIsTalking(true);
      setExpression(responseExpression);
      addMessage({ id: (Date.now() + 1).toString(), content: text, sender: 'buddy', timestamp: new Date() });
      if (nextMessages.length % 3 === 0) { addCoins(2); addPetExperience(5); }
    } catch (error) {
      console.error('MindBuddy reply failed; using fallback response.', error);
      const fallbackMode = getResponseMode(detectedEmotionResult ?? (lastEmotion ? { label: lastEmotion } : null));
      const text = getFallbackResponse(fallbackMode);
      setIsTyping(false);
      setIsTalking(true);
      setExpression(getExpressionFromText(text));
      addMessage({ id: (Date.now() + 1).toString(), content: text, sender: 'buddy', timestamp: new Date() });
    }

    setTimeout(() => { setIsTalking(false); setExpression('happy'); }, 2000);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); }
  };

  const quickReplies = ["How are you?", "I'm feeling anxious", "I'm happy today!", "Tell me something nice"];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'linear-gradient(180deg, #f0f7f5 0%, #f7faf9 60%, #ffffff 100%)' }}
    >
      {/* ── Header ── */}
      <header
        className="flex-shrink-0 px-5 py-3.5 flex items-center gap-3"
        style={{
          background: 'rgba(240,247,245,0.96)',
          backdropFilter: 'blur(12px)',
          borderBottom: '0.5px solid rgba(57,168,155,0.15)',
          paddingTop: 'max(env(safe-area-inset-top), 14px)',
        }}
      >
        {/* Back */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          aria-label="Close chat"
        >
          <ArrowLeft className="h-4 w-4" style={{ color: '#5f7585' }} />
        </motion.button>

        {/* Avatar + name */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <motion.div
            className="w-9 h-9 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #39a89b, #6bab9e)',
              boxShadow: '0 2px 8px rgba(57,168,155,0.3)',
            }}
            animate={{ scale: isTalking ? [1, 1.08, 1] : 1 }}
            transition={{ duration: 0.3, repeat: isTalking ? Infinity : 0 }}
          >
            {buddyExpressions[expression]}
          </motion.div>
          <div className="min-w-0">
            <p className="font-bold text-sm truncate flex items-center gap-1.5" style={{ color: '#1a2b38' }}>
              {petName}
              <Sparkles className="h-3 w-3" style={{ color: '#39a89b' }} />
            </p>
            <p className="text-[11px] font-semibold" style={{ color: '#39a89b' }}>
              {isTyping ? 'typing…' : 'Your MindBuddy'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => navigate('/emotion-dashboard')}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(57,168,155,0.1)' }}
            title="My Emotions"
          >
            <Brain className="h-4 w-4" style={{ color: '#39a89b' }} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => clearHistory()}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(143,163,177,0.1)' }}
            title="Clear chat"
          >
            <Trash2 className="h-4 w-4" style={{ color: '#8fa3b1' }} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(143,163,177,0.1)' }}
            aria-label="Close"
          >
            <X className="h-4 w-4" style={{ color: '#8fa3b1' }} />
          </motion.button>
        </div>
      </header>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`flex gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {message.sender === 'buddy' && (
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-sm flex-shrink-0 self-end mb-0.5"
                  style={{ background: 'linear-gradient(135deg, #39a89b, #6bab9e)' }}
                >
                  {buddyExpressions[expression]}
                </div>
              )}
              <div
                className="max-w-[78%] px-4 py-2.5 rounded-2xl"
                style={
                  message.sender === 'buddy'
                    ? {
                        background: 'white',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                        borderBottomLeftRadius: 6,
                      }
                    : {
                        background: 'linear-gradient(135deg, #39a89b, #6bab9e)',
                        boxShadow: '0 2px 12px rgba(57,168,155,0.3)',
                        borderBottomRightRadius: 6,
                      }
                }
              >
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: message.sender === 'buddy' ? '#1a2b38' : 'white' }}
                >
                  {message.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 items-end"
          >
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #39a89b, #6bab9e)' }}
            >
              🤔
            </div>
            <div
              className="px-4 py-3 rounded-2xl"
              style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', borderBottomLeftRadius: 6 }}
            >
              <div className="flex gap-1.5 items-center">
                {[0, 0.2, 0.4].map((delay) => (
                  <motion.span
                    key={delay}
                    className="w-2 h-2 rounded-full"
                    style={{ background: '#39a89b' }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick Replies ── */}
      <div className="flex-shrink-0 px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
        {quickReplies.map((text) => (
          <motion.button
            key={text}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSend(text)}
            className="whitespace-nowrap text-xs px-3.5 py-2 rounded-full font-semibold flex-shrink-0"
            style={{
              background: 'white',
              color: '#39a89b',
              border: '1px solid rgba(57,168,155,0.25)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            {text}
          </motion.button>
        ))}
      </div>

      {/* ── Input ── */}
      <div
        className="flex-shrink-0 px-4 py-3 flex gap-2 items-center"
        style={{
          background: 'rgba(240,247,245,0.96)',
          backdropFilter: 'blur(12px)',
          borderTop: '0.5px solid rgba(57,168,155,0.15)',
          paddingBottom: 'max(env(safe-area-inset-bottom), 12px)',
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Talk to ${petName}…`}
          className="flex-1 px-4 py-3 rounded-2xl text-sm outline-none"
          style={{
            background: 'white',
            color: '#1a2b38',
            border: '1px solid rgba(57,168,155,0.15)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
        />
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => { void handleSend(); }}
          disabled={!input.trim() || isTyping}
          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: input.trim() && !isTyping
              ? 'linear-gradient(135deg, #39a89b, #6bab9e)'
              : 'rgba(143,163,177,0.15)',
            boxShadow: input.trim() && !isTyping ? '0 4px 16px rgba(57,168,155,0.35)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <Send
            className="h-4 w-4"
            style={{ color: input.trim() && !isTyping ? 'white' : '#8fa3b1' }}
          />
        </motion.button>
      </div>

      {/* ── Crisis Alert Modal ── */}
      <AnimatePresence>
        {showCrisisAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-5"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              className="w-full max-w-sm rounded-3xl overflow-hidden"
              style={{ background: 'white', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}
            >
              {/* Accent bar */}
              <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #dc2626, #dc262688)' }} />

              {/* Red header */}
              <div className="px-5 py-4 flex items-center gap-3" style={{ background: 'rgba(220,38,38,0.06)' }}>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: 'rgba(220,38,38,0.1)' }}
                >
                  🚨
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: '#991b1b' }}>You Matter. Help is Here.</p>
                  <p className="text-[11px]" style={{ color: '#dc2626' }}>Crisis Support — Available 24/7</p>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-sm leading-relaxed" style={{ color: '#5f7585' }}>
                  What you're feeling right now is real, and you don't have to face it alone. Please reach out — a real person is ready to listen.
                </p>

                <div
                  className="rounded-2xl p-4 space-y-2.5"
                  style={{ background: 'rgba(220,38,38,0.04)', border: '1px solid rgba(220,38,38,0.15)' }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#dc2626' }}>
                    📞 Call Now (Free, 24/7)
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => window.open('tel:0376272929')}
                    className="w-full py-3 rounded-xl flex flex-col items-center gap-0.5 font-bold text-sm text-white"
                    style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', boxShadow: '0 4px 16px rgba(220,38,38,0.3)' }}
                  >
                    <span className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Befrienders Malaysia
                    </span>
                    <span className="text-[11px] font-normal" style={{ color: 'rgba(255,255,255,0.7)' }}>03-7627 2929</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => window.open('tel:15999')}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold"
                    style={{
                      background: 'white',
                      color: '#dc2626',
                      border: '1px solid rgba(220,38,38,0.25)',
                    }}
                  >
                    Talian Kasih — 15999
                  </motion.button>
                </div>

                <div
                  className="rounded-xl px-3 py-2.5"
                  style={{ background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.2)' }}
                >
                  <p className="text-xs leading-relaxed" style={{ color: '#92600a' }}>
                    <span className="font-semibold">Demo mode:</span> In the live version, MindBuddy will automatically alert a counselor when a crisis is detected.
                  </p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowCrisisAlert(false)}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold"
                  style={{ color: '#8fa3b1' }}
                >
                  I'm safe right now — dismiss
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Severe / Peer Support Bottom Sheet ── */}
      <AnimatePresence>
        {showSevereAlert && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[90] rounded-t-3xl overflow-hidden"
            style={{
              background: 'white',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
              maxWidth: 512,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #e8735a, #e8735a88)' }} />

            <div className="p-5 space-y-4">
              {/* Drag handle */}
              <div className="w-10 h-1 rounded-full mx-auto" style={{ background: 'rgba(143,163,177,0.3)' }} />

              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: 'rgba(232,115,90,0.1)' }}
                >
                  🤝
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: '#1a2b38' }}>You deserve real support</p>
                  <p className="text-xs leading-relaxed mt-0.5" style={{ color: '#5f7585' }}>
                    I'm always here to chat, but sometimes talking to a real counselor makes all the difference.
                  </p>
                </div>
              </div>

              {/* Counselor card */}
              <div
                className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: 'rgba(232,115,90,0.06)', border: '1px solid rgba(232,115,90,0.15)' }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: 'rgba(232,115,90,0.1)' }}
                >
                  💬
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: '#993c1d' }}>UPM Counselling Service</p>
                  <p className="text-xs leading-relaxed mt-0.5" style={{ color: '#5f7585' }}>
                    Book a free session with a counselling student — chat or video, your choice.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setShowSevereAlert(false); onClose(); navigate('/counselor'); }}
                  className="w-full py-3.5 rounded-2xl text-sm font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #e8735a, #d4603f)',
                    boxShadow: '0 4px 16px rgba(232,115,90,0.35)',
                  }}
                >
                  Go to Counselor Support
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowSevereAlert(false)}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold"
                  style={{ color: '#8fa3b1' }}
                >
                  Continue chatting with {petName}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};