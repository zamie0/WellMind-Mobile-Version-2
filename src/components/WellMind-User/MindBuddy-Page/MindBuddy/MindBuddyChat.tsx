import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Sparkles, Trash2, Phone } from 'lucide-react';
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
  ],
  emotional_support: [
    "That sounds really heavy, I'm here with you.",
    "Yeah, that can feel a lot sometimes, wanna talk it out a bit?",
    "I hear you, you're not alone in this.",
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

  if (detected?.selfHarmDetected || detected?.directSelfHarmDetected || decision === 'crisis_escalation' || label === 'crisis' || safetyRisk >= 70) {
    return 'crisis_support';
  }

  if (label === 'severe' || safetyRisk >= 55) {
    return 'high_risk_support';
  }

  if (label === 'depress' || label === 'anxious' || label === 'stress' || safetyRisk >= 31) {
    return 'emotional_support';
  }

  return 'casual_support';
};

const getFallbackResponse = (mode: ResponseMode = 'casual_support'): string => {
  const bucket = fallbackResponsesByMode[mode];
  return bucket[Math.floor(Math.random() * bucket.length)];
};

const getExpressionFromText = (message: string): BuddyExpression => {
  const lowerMessage = message.toLowerCase();

  if (['sad', 'sorry', 'hard', 'upset', 'cry'].some((keyword) => lowerMessage.includes(keyword))) {
    return 'sad';
  }

  if (['anxious', 'breathe', 'think', 'focus', 'ground'].some((keyword) => lowerMessage.includes(keyword))) {
    return 'thinking';
  }

  if (['rest', 'sleep', 'tired'].some((keyword) => lowerMessage.includes(keyword))) {
    return 'sleepy';
  }

  if (['love', 'appreciate', 'grateful'].some((keyword) => lowerMessage.includes(keyword))) {
    return 'love';
  }

  if (['great', 'happy', 'wonderful', 'celebrate', 'proud'].some((keyword) => lowerMessage.includes(keyword))) {
    return 'excited';
  }

  return 'happy';
};

// Buddy character expressions (Talking Tom style)
const buddyExpressions: Record<BuddyExpression, { face: string; body: string }> = {
  idle: { face: '😊', body: '🧸' },
  happy: { face: '😄', body: '🧸' },
  thinking: { face: '🤔', body: '🧸' },
  talking: { face: '😮', body: '🧸' },
  excited: { face: '🤩', body: '🧸' },
  sad: { face: '🥺', body: '🧸' },
  sleepy: { face: '😴', body: '🧸' },
  love: { face: '🥰', body: '🧸' },
};

const emotionMeta: Record<string, { emoji: string; label: string; color: string }> = {
  happy:    { emoji: '😄', label: 'Happy',       color: 'bg-yellow-100 text-yellow-700' },
  calm:     { emoji: '😌', label: 'Calm',        color: 'bg-blue-100 text-blue-600' },
  stress:   { emoji: '😤', label: 'Stressed',    color: 'bg-orange-100 text-orange-600' },
  anxious:  { emoji: '😰', label: 'Anxious',     color: 'bg-purple-100 text-purple-600' },
  depress:  { emoji: '😔', label: 'Low',         color: 'bg-gray-100 text-gray-600' },
  severe:   { emoji: '⚠️', label: 'Overwhelmed', color: 'bg-orange-100 text-orange-700' },
  crisis:   { emoji: '🚨', label: 'In Crisis',   color: 'bg-red-100 text-red-700' },
  neutral:  { emoji: '😐', label: 'Neutral',     color: 'bg-muted text-muted-foreground' },
};

const getMindBuddySystemPrompt = (
  emotion: EmotionLabel,
  petName: string,
  responseMode: ResponseMode,
  safetyContext: {
    riskLevel: 'low' | 'medium' | 'high' | 'crisis';
    selfHarmDetected: boolean;
    safetyRisk: number;
    crisisLevel?: DetectionDecision;
  }
): string => {
  const baseRules = `You are ${petName}, a caring university buddy texting a close friend.
Keep replies short and natural, usually 1 to 2 sentences.
Sound human, warm, and emotionally real.
Always validate first before advice.
No bullet points, no numbered lists, no formal report tone.
Avoid detached lines like "that's interesting" when user is distressed.
Avoid clinical wording and avoid being overly cheerful.`;

  const hiddenSafetyContext = `SAFETY CONTEXT (internal, must obey):
response_mode=${responseMode}
risk_level=${safetyContext.riskLevel}
self_harm_detected=${safetyContext.selfHarmDetected}
safety_risk=${safetyContext.safetyRisk}
crisis_level=${safetyContext.crisisLevel ?? 'none'}`;

  if (responseMode === 'crisis_support') {
    return `${baseRules}
${hiddenSafetyContext}
CRISIS GUARDRAILS:
- Calm, validating, grounded tone only.
- Do NOT use jokes, sarcasm, playful energy, or excitement.
- Do NOT say "that's interesting" or casual chat openers.
- Start by acknowledging emotional pain.
- Then remind them they are not alone.
- Encourage immediate real-world support now, gently and clearly.
- Mention Befrienders Malaysia 03-7627 2929.
- Keep it 2 short supportive sentences.`;
  }

  if (responseMode === 'high_risk_support') {
    return `${baseRules}
${hiddenSafetyContext}
HIGH RISK GUARDRAILS:
- Calm, soft, non-judgmental tone.
- Validate emotion first.
- No playful, excited, or slang-heavy tone.
- Offer gentle support and suggest Peer Support or trusted person.
- Keep it 1 to 2 short sentences.`;
  }

  if (responseMode === 'emotional_support') {
    return `${baseRules}
${hiddenSafetyContext}
EMOTIONAL SUPPORT STYLE:
- Validate first.
- Then gently continue conversation with one light follow-up.
- Keep warm and human.`;
  }

  if (emotion === 'happy' || emotion === 'calm') {
    return `${baseRules}
${hiddenSafetyContext}
CASUAL SUPPORT STYLE:
- Friendly and natural.
- Can be lightly playful only when safe.
- Keep concise and kind.`;
  }

  return `${baseRules}
${hiddenSafetyContext}
CASUAL SUPPORT STYLE:
- Friendly, warm, easy to continue chatting.`;
};

interface MindBuddyChatProps {
  onClose: () => void;
}

export const MindBuddyChat = ({ onClose }: MindBuddyChatProps) => {
  const navigate = useNavigate();
  const { pet, addCoins, addPetExperience } = useWellMindStore();
  const petName = pet?.name || 'Buddy';
  const petLevel = pet?.level ?? 1;

  const { messages: storedMessages, addMessage, clearHistory, setLastEmotion, lastEmotion } = useMindBuddyChatStore();

  const messages: Message[] = storedMessages.length > 0
    ? storedMessages
    : [
        {
          id: '1',
          content: `Hi! I'm ${petName}! I'm so happy to talk to you! How are you feeling today? 💚`,
          sender: 'buddy',
          timestamp: new Date(),
        },
      ];

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [expression, setExpression] = useState<BuddyExpression>('happy');
  const [isTalking, setIsTalking] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [showSevereAlert, setShowSevereAlert] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Animate talking
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

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    addMessage(userMessage);
    const nextMessages = [...messages, userMessage];

    const detectedEmotionPromise = detectEmotion(
      messageText,
      // Pass last 4 exchanges as conversation context for semantic analysis
      nextMessages.slice(-8).map((m) => ({
        role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: m.content,
      }))
    );

    // Detect emotion and patch it onto the stored user message
    void detectedEmotionPromise.then((result) => {
      setLastEmotion(result.label);
      // Show crisis alert if crisis emotion detected
      if (result.label === 'crisis') {
        setShowCrisisAlert(true);
      }
      // Show severe alert if severe emotion detected (counselor recommended)
      if (result.label === 'severe') {
        setShowSevereAlert(true);
      }
      useMindBuddyChatStore.setState((state) => ({
        messages: state.messages.map((m) =>
          m.id === userMessage.id
            ? { ...m, emotion: result.label, emotionConfidence: result.confidence }
            : m
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
      const responseMode = getResponseMode(detectedEmotion);
      const safetyRisk = detectedEmotion.safetyRisk ?? detectedEmotion.riskScore ?? 0;
      const riskLevel: 'low' | 'medium' | 'high' | 'crisis' =
        responseMode === 'crisis_support' ? 'crisis' :
        responseMode === 'high_risk_support' ? 'high' :
        responseMode === 'emotional_support' ? 'medium' :
        'low';

      const reply = await getAzureChatCompletion(
        [
          {
            role: 'system',
            content: getMindBuddySystemPrompt(detectedEmotion.label, petName, responseMode, {
              riskLevel,
              selfHarmDetected: Boolean(detectedEmotion.selfHarmDetected || detectedEmotion.directSelfHarmDetected),
              safetyRisk,
              crisisLevel: detectedEmotion.crisisLevel ?? detectedEmotion.decision,
            }),
          },
          ...nextMessages.slice(-8).map((message) => ({
            role: message.sender === 'user' ? 'user' as const : 'assistant' as const,
            content: message.content,
          })),
        ],
        { temperature: responseMode === 'casual_support' ? 0.92 : 0.55, maxTokens: responseMode === 'crisis_support' ? 90 : 72 }
      );

      const text = reply || getFallbackResponse(responseMode);
      const responseExpression = getExpressionFromText(text);

      setIsTyping(false);
      setIsTalking(true);
      setExpression(responseExpression);

      const buddyMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: text,
        sender: 'buddy',
        timestamp: new Date(),
      };

      addMessage(buddyMessage);

      if (nextMessages.length % 3 === 0) {
        addCoins(2);
        addPetExperience(5);
      }
    } catch {
      const fallbackMode = getResponseMode(
        detectedEmotionResult ?? (lastEmotion ? { label: lastEmotion } : null)
      );
      const text = getFallbackResponse(fallbackMode);
      setIsTyping(false);
      setIsTalking(true);
      setExpression(getExpressionFromText(text));
      addMessage({
        id: (Date.now() + 1).toString(),
        content: text,
        sender: 'buddy',
        timestamp: new Date(),
      });
    }

    setTimeout(() => {
      setIsTalking(false);
      setExpression('happy');
    }, 2000);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}>
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl"
            animate={{ scale: isTalking ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.3, repeat: isTalking ? Infinity : 0 }}
          >
            {buddyExpressions[expression].face}
          </motion.div>
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              {petName}
              <Sparkles className="w-4 h-4 text-primary" />
            </h3>

          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { clearHistory(); }}
            className="h-8 w-8"
            title="Clear chat history"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <div className="relative h-8 w-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/emotion-dashboard')}
              className="h-8 w-8 text-xl relative overflow-hidden"
              title="My Emotions"
            >
              🌈
              <motion.span
                className="pointer-events-none absolute inset-0 rounded-md"
                style={{
                  background:
                    'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.65) 50%, transparent 70%)',
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }}
              />
            </Button>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>



      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Crisis Alert — Full-screen modal overlay */}
        <AnimatePresence>
          {showCrisisAlert && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-5"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl"
              >
                {/* Red header band */}
                <div className="bg-red-600 px-5 py-4 flex items-center gap-3">
                  <span className="text-3xl">🚨</span>
                  <div>
                    <p className="text-white font-bold text-base">You Matter. Help is Here.</p>
                    <p className="text-red-100 text-xs">Crisis Support — Available 24/7</p>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    What you're feeling right now is real, and you don't have to face it alone. Please reach out — a real person is ready to listen.
                  </p>

                  {/* Primary hotline */}
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">📞 Call Now (Free, 24/7)</p>
                    <Button
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl flex flex-col h-auto py-3"
                      onClick={() => window.open('tel:0376272929')}
                    >
                      <span className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Befrienders Malaysia
                      </span>
                      <span className="text-red-200 text-xs font-normal">03-7627 2929</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-red-300 text-red-700 rounded-xl text-sm"
                      onClick={() => window.open('tel:15999')}
                    >
                      Talian Kasih — 15999
                    </Button>
                  </div>

                  {/* Demo note */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    <p className="text-xs text-amber-700">
                      <span className="font-semibold">Demo mode:</span> In the live version, MindBuddy will automatically alert a counselor when a crisis is detected.
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full text-gray-400 text-xs"
                    onClick={() => setShowCrisisAlert(false)}
                  >
                    I'm safe right now — dismiss
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Severe Alert — Bottom-sheet pop-up for Peer Support reminder */}
        <AnimatePresence>
          {showSevereAlert && (
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[90] bg-white rounded-t-3xl shadow-2xl p-5 space-y-4 max-w-lg mx-auto"
            >
              {/* Drag handle */}
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto" />

              <div className="flex items-start gap-3">
                <span className="text-3xl mt-0.5">🤝</span>
                <div>
                  <h4 className="font-bold text-gray-900 text-base">You deserve real support</h4>
                  <p className="text-gray-500 text-sm mt-0.5">
                    I'm always here to chat, but sometimes talking to a real counselor makes all the difference.
                  </p>
                </div>
              </div>

              {/* Peer Support card */}
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl flex-shrink-0">
                  💬
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-orange-900 text-sm">UPM Counselling Service</p>
                  <p className="text-orange-700 text-xs mt-0.5">Book a free session with a counselling student — chat or video, your choice.</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl"
                  onClick={() => { setShowSevereAlert(false); onClose(); navigate('/counselor'); }}
                >
                  Go to Peer Support
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-gray-400 text-xs"
                  onClick={() => setShowSevereAlert(false)}
                >
                  Continue chatting with {petName}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`flex gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.sender === 'buddy'
                    ? 'bg-primary/10 text-foreground rounded-tl-sm'
                    : 'bg-primary text-primary-foreground rounded-tr-sm'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2"
          >
            <div className="bg-primary/10 p-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                <motion.span 
                  className="w-2 h-2 bg-primary/50 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.span 
                  className="w-2 h-2 bg-primary/50 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.span 
                  className="w-2 h-2 bg-primary/50 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
        {['How are you?', "I'm feeling anxious", "I'm happy today!", 'Tell me something nice'].map((text) => (
          <Button
            key={text}
            variant="outline"
            size="sm"
            onClick={() => handleSend(text)}
            className="whitespace-nowrap text-xs rounded-full"
          >
            {text}
          </Button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-background safe-area-bottom">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Talk to ${petName}...`}
            className="flex-1 px-4 py-3 bg-muted rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Button
            onClick={() => {
              void handleSend();
            }}
            disabled={!input.trim() || isTyping}
            size="icon"
            className="rounded-full h-12 w-12"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
