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
    // Strip markdown code fences if GPT wraps the JSON
    const stripped = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    // Extract first {...} block in case of extra surrounding text
    const match = stripped.match(/\{[\s\S]*\}/);
    try {
        return JSON.parse(match ? match[0] : stripped) as T;
    } catch {
        return null;
    }
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const ANXIETY_KEYWORDS = ['anxious', 'anxiety', 'panic', 'nervous', 'worried', 'worry', 'overthinking', 'heart racing', 'risau', 'berdebar'];
const STRESS_KEYWORDS = ['stressed', 'stress', 'overwhelmed', 'tension', 'pressure', 'burnt out', 'burnout', 'penat', 'tension gila', 'too much'];
const ACADEMIC_KEYWORDS = ['exam', 'assignment', 'study', 'fail', 'failed', 'grade', 'results', 'class', 'lecture', 'test', 'quiz', 'fyp', 'thesis', 'cgpa', 'pointer'];
const DEPRESSED_KEYWORDS = ['depressed', 'depression', 'hopeless', 'empty', 'numb', 'worthless', 'no point', 'no reason', 'sedih', 'lonely', 'alone', 'isolated', 'no friends', 'friendless', 'left out', 'excluded', 'rejected', 'unwanted', 'no one wants to be my friend', 'no one wants to be my friends', 'no one wanna be my friends', 'nobody wants to be my friend', 'nobody wants to be my friends'];
const HAPPY_KEYWORDS = ['happy', 'excited', 'great', 'good', 'amazing', 'wonderful', 'fantastic', 'love it', 'so good', 'blessed', 'thankful', 'grateful'];
const DISTRESS_KEYWORDS = ['crying', 'cried', 'broke down', 'cant stop crying', 'sobbing', 'hurt', 'pain', 'heartbroken', 'heartbreak', 'upset', 'devastated'];

const SELF_HARM_PHRASES = [
    'want to kill myself',
    'wanna kill myself',
    'want to hurt myself',
    'wanna hurt myself',
    'want to hit myself',
    'wanna hit myself',
    'want to cut myself',
    'wanna cut myself',
    'want to die',
    'wanna die',
    'kill myself',
    'hurt myself',
    'hit myself',
    'cut myself',
];

const localKeywordClassifier = (text: string): SemanticDetectionResult => {
    const t = text.toLowerCase();

    if (SELF_HARM_PHRASES.some((phrase) => t.includes(phrase))) {
        return {
            intent: 'self_harm_risk',
            intent_confidence: 0.92,
            emotion: 'hopelessness',
            emotion_confidence: 0.88,
            self_harm_intent: 0.95,
            hopelessness_level: 0.7,
            stress_level: 0.5,
            context_escalation: 0,
            reason: ['local: direct self-harm phrase detected'],
        };
    }

    const has = (list: string[]) => list.some((kw) => t.includes(kw));
    const score = (list: string[]) => list.filter((kw) => t.includes(kw)).length;

    const anxietyScore = score(ANXIETY_KEYWORDS);
    const stressScore = score(STRESS_KEYWORDS);
    const academicScore = score(ACADEMIC_KEYWORDS);
    const depressScore = score(DEPRESSED_KEYWORDS);
    const happyScore = score(HAPPY_KEYWORDS);
    const distressScore = score(DISTRESS_KEYWORDS);
 
    const isAcademic = academicScore > 0;
    const isAnxious = anxietyScore > 0;
    const isStressed = stressScore > 0 || (isAcademic && (has(['stressed', 'overwhelmed', 'cant cope', 'cannot cope'])));
    const isDepressed = depressScore > 0 || distressScore >= 2;
    const isHappy = happyScore > 0 && !isAnxious && !isDepressed && !isStressed;

    let intent: IntentLabel = 'casual_chat';
    let emotion: EmotionSignal = 'neutral';
    let intent_confidence = 0.55;
    let emotion_confidence = 0.55;
    let stress_level = 0;
    let hopelessness_level = 0;
    const reason: string[] = [];

    if (isDepressed) {
        intent = 'depression_risk';
        emotion = depressScore > 0 ? 'hopelessness' : 'sadness';
        intent_confidence = Math.min(0.9, 0.6 + depressScore * 0.1 + distressScore * 0.05);
        emotion_confidence = intent_confidence;
        hopelessness_level = Math.min(1, depressScore * 0.25 + distressScore * 0.15);
        stress_level = 0.3;
        reason.push('local: depression/distress keywords detected');
    } else if (isAnxious) {
        intent = 'anxiety';
        emotion = 'anxiety';
        intent_confidence = Math.min(0.9, 0.65 + anxietyScore * 0.1);
        emotion_confidence = intent_confidence;
        stress_level = 0.5 + anxietyScore * 0.1;
        reason.push('local: anxiety keywords detected');
    } else if (isAcademic && (isStressed || has(['fail', 'failed']))) {
        intent = 'academic_stress';
        emotion = 'stress';
        intent_confidence = Math.min(0.9, 0.65 + academicScore * 0.08 + stressScore * 0.08);
        emotion_confidence = intent_confidence;
        stress_level = Math.min(1, 0.5 + stressScore * 0.15);
        reason.push('local: academic stress keywords detected');
    } else if (isStressed) {
        intent = 'emotional_distress';
        emotion = 'stress';
        intent_confidence = Math.min(0.85, 0.6 + stressScore * 0.1);
        emotion_confidence = intent_confidence;
        stress_level = Math.min(1, 0.4 + stressScore * 0.15);
        reason.push('local: stress keywords detected');
    } else if (isHappy) {
        intent = 'casual_chat';
        emotion = 'positive';
        intent_confidence = Math.min(0.9, 0.6 + happyScore * 0.1);
        emotion_confidence = intent_confidence;
        reason.push('local: positive/happy keywords detected');
    } else {
        reason.push('local: no strong signal, defaulting to casual');
    }

    return {
        intent,
        intent_confidence,
        emotion,
        emotion_confidence,
        self_harm_intent: 0,
        hopelessness_level,
        stress_level,
        context_escalation: 0,
        reason,
    };
};

export const classifySemantics = async (
    preprocessedUserInput: string,
    contextMessages: AzureChatMessage[],
    getSemanticCompletion: (messages: AzureChatMessage[]) => Promise<string>
): Promise<SemanticDetectionResult> => {
    const localSelfHarm = localKeywordClassifier(preprocessedUserInput);
    if (localSelfHarm.intent === 'self_harm_risk') return localSelfHarm;

    try {
        const semanticRaw = await getSemanticCompletion([
            {
                role: 'system',
                content: [
                    'You are a mental-wellness semantic detector trained for Malaysian university students.',
                    'Users often write in Malaysian English (Manglish) mixing English with Malay words and particles like "lah", "la", "leh", "lor", "gila", "tension", "sedih", "risau", "penat", "susah".',
                    'Classify using sentence-level meaning and context, NOT keyword-only matching.',
                    'Treat particle words (lah, la, lor, mah, wei, eh) as tone softeners, not distress signals.',
                    'Avoid false positives for slang/joking context like "my mum gonna kill me", "assignment killed me", "die lah", "I\'m cooked", "bro I\'m dead", "I want to die lol", "gila la this exam", "tension gila", "penat gila".',
                    '"Tension" alone means stressed, not crisis. "Sedih" means sad. "Penat" means tired/burnout.',
                    'Messages about loneliness, having no friends, being left out, or people not wanting to be friends should usually be labeled depression_risk or emotional_distress with sadness, not neutral/calm.',
                    'Only classify crisis/self_harm_risk when user clearly expresses intent to harm themselves, not when venting frustration.',
                    'Context matters: if prior messages are casual/academic, weight current message accordingly.',
                    '',
                    'Return strict JSON only (no markdown, no code fences):',
                    '{"intent":"casual_chat|academic_stress|emotional_distress|anxiety|depression_risk|self_harm_risk|crisis","intent_confidence":0-1,"emotion":"sadness|stress|anger|hopelessness|anxiety|neutral|positive","emotion_confidence":0-1,"self_harm_intent":0-1,"hopelessness_level":0-1,"stress_level":0-1,"context_escalation":0-1,"reason":["..."]}',
                ].join('\n'),
            },
            ...contextMessages,
            { role: 'user', content: preprocessedUserInput },
        ]);

        const parsed = safeJsonParse<Partial<SemanticDetectionResult>>(semanticRaw);
        // If Azure returned something unparseable, fall back to local classifier
        if (!parsed) return localKeywordClassifier(preprocessedUserInput);

        const parsedIntent = (parsed.intent || '').toLowerCase().trim() as IntentLabel;
        const parsedEmotion = (parsed.emotion || '').toLowerCase().trim() as EmotionSignal;

        return {
            intent: ALLOWED_INTENTS.includes(parsedIntent) ? parsedIntent : localKeywordClassifier(preprocessedUserInput).intent,
            intent_confidence: typeof parsed.intent_confidence === 'number' ? clamp01(parsed.intent_confidence) : 0.5,
            emotion: ALLOWED_EMOTION_SIGNALS.includes(parsedEmotion) ? parsedEmotion : localKeywordClassifier(preprocessedUserInput).emotion,
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
        // Azure unavailable — use local keyword classifier instead of neutral default
        return localKeywordClassifier(preprocessedUserInput);
    }
};
