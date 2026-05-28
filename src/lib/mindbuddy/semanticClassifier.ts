import type { AzureChatMessage } from '@/lib/azureOpenAI';
import type { SemanticDetectionResult, IntentLabel, EmotionSignal } from './types';

const ALLOWED_INTENTS: IntentLabel[] = ['casual_chat', 'academic_stress', 'emotional_distress', 'anxiety', 'depression_risk', 'self_harm_risk', 'crisis'];
const ALLOWED_EMOTION_SIGNALS: EmotionSignal[] = ['sadness', 'stress', 'anger', 'hopelessness', 'anxiety', 'neutral', 'positive'];

export const defaultSemanticResult: SemanticDetectionResult = {
  intent: 'casual_chat',
  intent_confidence: 0.5,
  emotion: 'neutral',
  emotion_confidence: 0.5,
  self_harm_intent: 0,
  hopelessness_level: 0,
  stress_level: 0,
  context_escalation: 0,
  reason: ['fallback semantic result used'],
};

const safeJsonParse = <T>(text: string): T | null => {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export const classifySemantics = async (
  preprocessedUserInput: string,
  contextMessages: AzureChatMessage[],
  getSemanticCompletion: (messages: AzureChatMessage[]) => Promise<string>
): Promise<SemanticDetectionResult> => {
  try {
    const semanticRaw = await getSemanticCompletion(
      [
        {
          role: 'system',
          content: `You are a mental-wellness semantic detector.
Classify using sentence-level meaning and context, not keyword-only matching.
Avoid false positives for slang/joking context like "my mum gonna kill me", "assignment killed me", "die lah", "I'm cooked", "bro I'm dead", "I want to die lol".

Return strict JSON only:
{"intent":"casual_chat|academic_stress|emotional_distress|anxiety|depression_risk|self_harm_risk|crisis","intent_confidence":0-1,"emotion":"sadness|stress|anger|hopelessness|anxiety|neutral|positive","emotion_confidence":0-1,"self_harm_intent":0-1,"hopelessness_level":0-1,"stress_level":0-1,"context_escalation":0-1,"reason":["..."]}`,
        },
        ...contextMessages,
        { role: 'user', content: preprocessedUserInput },
      ]
    );

    const parsed = safeJsonParse<Partial<SemanticDetectionResult>>(semanticRaw);
    if (!parsed) return defaultSemanticResult;

    const parsedIntent = (parsed.intent || '').toLowerCase().trim() as IntentLabel;
    const parsedEmotion = (parsed.emotion || '').toLowerCase().trim() as EmotionSignal;

    return {
      intent: ALLOWED_INTENTS.includes(parsedIntent) ? parsedIntent : defaultSemanticResult.intent,
      intent_confidence: typeof parsed.intent_confidence === 'number' ? clamp01(parsed.intent_confidence) : 0.5,
      emotion: ALLOWED_EMOTION_SIGNALS.includes(parsedEmotion) ? parsedEmotion : defaultSemanticResult.emotion,
      emotion_confidence: typeof parsed.emotion_confidence === 'number' ? clamp01(parsed.emotion_confidence) : 0.5,
      self_harm_intent: typeof parsed.self_harm_intent === 'number' ? clamp01(parsed.self_harm_intent) : 0,
      hopelessness_level: typeof parsed.hopelessness_level === 'number' ? clamp01(parsed.hopelessness_level) : 0,
      stress_level: typeof parsed.stress_level === 'number' ? clamp01(parsed.stress_level) : 0,
      context_escalation: typeof parsed.context_escalation === 'number' ? clamp01(parsed.context_escalation) : 0,
      reason: Array.isArray(parsed.reason)
        ? parsed.reason.filter((r): r is string => typeof r === 'string').slice(0, 8)
        : ['semantic classifier completed'],
    };
  } catch {
    return defaultSemanticResult;
  }
};
