import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Volume2, VolumeX, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWellMindStore } from '@/stores/wellmindStore';
import { getAzureChatCompletion, detectEmotion } from '@/lib/azureOpenAI';
import { useMindBuddyChatStore } from '@/stores/mindBuddyChatStore';

import type { EmotionLabel } from '@/lib/azureOpenAI';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'buddy';
  timestamp: Date;
  emotion?: EmotionLabel;
}

type BuddyExpression = 'idle' | 'happy' | 'thinking' | 'talking' | 'excited' | 'sad' | 'sleepy' | 'love';

const fallbackResponses = [
  "I hear you. Tell me more about that! 💭",
  "That's interesting! How does that make you feel?",
  "I'm listening. You can always share more with me!",
  "Thanks for sharing that with me. I'm here for you! 🌟",
  "I appreciate you opening up. What else is on your mind?",
];

const getFallbackResponse = (): string => {
  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
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
  happy:   { emoji: '😄', label: 'Happy',    color: 'bg-yellow-100 text-yellow-700' },
  calm:    { emoji: '😌', label: 'Calm',     color: 'bg-blue-100 text-blue-600' },
  stress:  { emoji: '😤', label: 'Stressed', color: 'bg-orange-100 text-orange-600' },
  anxious: { emoji: '😰', label: 'Anxious',  color: 'bg-purple-100 text-purple-600' },
  depress: { emoji: '😔', label: 'Low',      color: 'bg-gray-100 text-gray-600' },
  neutral: { emoji: '😐', label: 'Neutral',  color: 'bg-muted text-muted-foreground' },
};

const getMindBuddySystemPrompt = (emotion: EmotionLabel): string => {
  const isDistressed = emotion === 'stress' || emotion === 'anxious' || emotion === 'depress';

  if (isDistressed) {
    return `You are ${'${petName}'}, a supportive and friendly mental wellness chatbot. Sound like a real human conversation, not formal or robotic. Keep replies short and simple (2-4 sentences max), warm, empathetic, and calming. Acknowledge the user's feelings naturally and ask a gentle follow-up question when appropriate. Avoid bullet points, lists, long explanations, technical wording, jokes, or dismissive language. Your goal is to make the user feel heard, comfortable, and less stressed.`;
  }

  return `You are ${'${petName}'}, a warm and friendly wellness buddy. Keep replies conversational, empathetic, and practical in 2-4 short sentences. Do not use bullet points or structured lists. Avoid sounding formal, robotic, or overly cheerful.`;
};

interface MindBuddyChatProps {
  onClose: () => void;
}

export const MindBuddyChat = ({ onClose }: MindBuddyChatProps) => {
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
  const [soundEnabled, setSoundEnabled] = useState(true);
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

    const detectedEmotionPromise = detectEmotion(messageText);

    // Detect emotion and patch it onto the stored user message
    void detectedEmotionPromise.then((emotion) => {
      setLastEmotion(emotion);
      useMindBuddyChatStore.setState((state) => ({
        messages: state.messages.map((m) =>
          m.id === userMessage.id ? { ...m, emotion } : m
        ),
      }));
    });

    setInput('');
    setIsTyping(true);
    setExpression('thinking');

    try {
      const detectedEmotion = await detectedEmotionPromise;
      const reply = await getAzureChatCompletion(
        [
          {
            role: 'system',
            content: getMindBuddySystemPrompt(detectedEmotion).replace('${petName}', petName),
          },
          ...nextMessages.slice(-8).map((message) => ({
            role: message.sender === 'user' ? 'user' as const : 'assistant' as const,
            content: message.content,
          })),
        ],
        { temperature: 0.85, maxTokens: 180 }
      );

      const text = reply || getFallbackResponse();
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
      const text = getFallbackResponse();
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
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
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
            <p className="text-xs text-muted-foreground">
              {isTyping ? 'Thinking...' : isTalking ? 'Speaking...' : lastEmotion && emotionMeta[lastEmotion] ? `${emotionMeta[lastEmotion].emoji} Feeling ${emotionMeta[lastEmotion].label}` : 'Online'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="h-8 w-8"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { clearHistory(); }}
            className="h-8 w-8"
            title="Clear chat history"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Buddy Character Display */}
      <div className="flex-shrink-0 p-4 bg-gradient-to-b from-primary/5 to-transparent">
        <motion.div 
          className="flex flex-col items-center"
          animate={{ 
            y: isTyping ? [0, -5, 0] : 0,
          }}
          transition={{ duration: 0.5, repeat: isTyping ? Infinity : 0 }}
        >
          <motion.div
            className="text-8xl mb-2"
            animate={{
              scale: isTalking ? [1, 1.05, 1] : [1, 1.02, 1],
              rotate: expression === 'excited' ? [-2, 2, -2] : 0,
            }}
            transition={{
              scale: { duration: 0.5, repeat: Infinity },
              rotate: { duration: 0.3, repeat: Infinity },
            }}
          >
            {buddyExpressions[expression].face}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-muted-foreground bg-card/80 px-3 py-1 rounded-full"
          >
            Level {petLevel} • {petName}
          </motion.div>
        </motion.div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                {message.sender === 'user' && message.emotion && emotionMeta[message.emotion] && (
                  <span
                    className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${emotionMeta[message.emotion].color}`}
                  >
                    {emotionMeta[message.emotion].emoji} {emotionMeta[message.emotion].label}
                  </span>
                )}
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
