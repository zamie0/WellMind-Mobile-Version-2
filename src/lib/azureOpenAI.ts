export type AzureChatRole = 'system' | 'user' | 'assistant';

export interface AzureChatMessage {
    role: AzureChatRole;
    content: string;
}

interface AzureChatOptions {
    temperature?: number;
    maxTokens?: number;
}

const getAzureOpenAIConfig = () => {
    const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT?.replace(/\/+$/, '');
    const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini';
    const apiVersion = import.meta.env.VITE_AZURE_OPENAI_API_VERSION || '2025-01-01-preview';
    const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;

    if (!endpoint || !deployment || !apiKey) {
        throw new Error('Azure OpenAI is not configured.');
    }

    return {
        apiKey,
        url: `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
    };
};

export const getAzureChatCompletion = async (
    messages: AzureChatMessage[],
    options: AzureChatOptions = {}
) => {
    const { apiKey, url } = getAzureOpenAIConfig();

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': apiKey,
        },
        body: JSON.stringify({
            messages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? 250,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Azure OpenAI request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
};

import { preprocessText } from '@/lib/mindbuddy/preprocessingService';
import { classifySemantics } from '@/lib/mindbuddy/semanticClassifier';
import { detectContradictionSignals, detectProtectiveFactors, detectSafetyFlags, getSafeSlangMatches } from '@/lib/mindbuddy/safetyRuleEngine';
import { appendTrendRecord, getTrendSnapshot } from '@/lib/mindbuddy/emotionTrendEngine';
import { computeRiskAssessment } from '@/lib/mindbuddy/riskScoringEngine';
import { applyEscalationCooldown } from '@/lib/mindbuddy/escalationManager';
import { buildAnalyticsSnapshot, logExplainableDecision } from '@/lib/mindbuddy/explainableLogger';
import type { AnalyticsSnapshot, DetectionDecision, EmotionSignal, IntentLabel, RiskDimensions } from '@/lib/mindbuddy/types';

export type EmotionLabel = 'happy' | 'calm' | 'stress' | 'anxious' | 'depress' | 'severe' | 'crisis' | 'neutral';
export type { DetectionDecision, EmotionSignal, IntentLabel };

const ALLOWED_EMOTIONS: EmotionLabel[] = ['happy', 'calm', 'stress', 'anxious', 'depress', 'severe', 'crisis', 'neutral'];

const LONELINESS_PATTERNS = [
    'lonely',
    'alone',
    'no friends',
    'friendless',
    'left out',
    'excluded',
    'no one wants to be my friend',
    'no one wants to be my friends',
    'no one wanna be my friend',
    'no one wanna be my friends',
    'nobody wants to be my friend',
    'nobody wants to be my friends',
];

const detectLonelinessSignal = (text: string, contextText: string) => {
    const combined = `${text} ${contextText}`;
    return LONELINESS_PATTERNS.some((pattern) => combined.includes(pattern));
};

const scoreToDecision = (riskScore: number): DetectionDecision => {
    if (riskScore <= 30) return 'normal_support';
    if (riskScore <= 60) return 'peer_support_suggestion';
    return 'crisis_escalation';
};

const mapToEmotionLabel = (
    decision: DetectionDecision,
    riskScore: number,
    intent: IntentLabel,
    emotion: EmotionSignal,
    confidence: number,
    selfHarmIntent: number,
    directSelfHarmDetected: boolean,
    harmToOthersDetected: boolean,
    lonelinessDetected: boolean
): EmotionLabel => {
    // 1. Crisis: direct self-harm with high confidence (not harm-to-others alone)
    if (directSelfHarmDetected && (decision === 'crisis_escalation' || riskScore >= 70 || selfHarmIntent >= 0.7)) {
        return 'crisis';
    }

    // 2. Explicit crisis escalation (self-harm semantic signal; not violence toward others)
    if (
        decision === 'crisis_escalation' &&
        confidence >= 0.8 &&
        selfHarmIntent >= 0.7 &&
        !harmToOthersDetected
    ) {
        return 'crisis';
    }

    // 3. Severe: only when risk is genuinely high AND NOT clearly a specific lesser emotion
    //    Threshold raised to 60 to avoid false positives on moderate stress/anxiety
    if (directSelfHarmDetected) return 'severe';
    if (harmToOthersDetected && riskScore >= 55) return 'severe';
    if (intent === 'depression_risk' && riskScore >= 50) return 'severe';
    if (riskScore >= 60) return 'severe';

    // 4. Specific emotional labels take priority over raw risk score
    if (intent === 'anxiety' || emotion === 'anxiety') return 'anxious';
    if (intent === 'academic_stress' || emotion === 'stress') return 'stress';
    if (intent === 'emotional_distress' || emotion === 'sadness' || emotion === 'hopelessness') return 'depress';
    if (intent === 'depression_risk') return 'depress';
    if (lonelinessDetected) return 'depress';

    // 5. Moderate risk without specific signal → stress
    if (riskScore >= 35) return 'stress';

    // 6. Positive / calm
    if (emotion === 'positive') return 'happy';
    if (emotion === 'neutral') return 'calm';
    return 'neutral';
};

export interface EmotionResult {
    label: EmotionLabel;
    confidence: number;
    intent?: IntentLabel;
    emotion?: EmotionSignal;
    emotionalConfidence?: number;
    safetyRisk?: number;
    selfHarmDetected?: boolean;
    crisisLevel?: DetectionDecision;
    riskScore?: number;
    decision?: DetectionDecision;
    reason?: string[];
    riskDimensions?: RiskDimensions;
    dominantRiskType?: keyof RiskDimensions;
    trendEscalation?: 'low' | 'medium' | 'high';
    sarcasmConfidence?: number;
    figurativeLanguageScore?: number;
    humorContextDetection?: number;
    protectiveFactorScore?: number;
    figurativeSlangDetected?: boolean;
    humorDetected?: boolean;
    directSelfHarmDetected?: boolean;
    harmToOthersDetected?: boolean;
    hopelessnessDetected?: boolean;
    escalatingDistressDetected?: boolean;
    harmfulActionDetected?: boolean;
    selfReferenceDetected?: boolean;
    passiveIdeationDetected?: boolean;
    selfHarmBehaviorDetected?: boolean;
    safetyIntentCategories?: string[];
    timestamp?: string;
    analyticsSnapshot?: AnalyticsSnapshot;
}

export const detectEmotion = async (
    userInput: string,
    conversationContext: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<EmotionResult> => {
    const trimmed = userInput.trim().slice(0, 500);
    const timestamp = new Date().toISOString();

    if (!trimmed) {
        return {
            label: 'neutral',
            confidence: 1.0,
            emotionalConfidence: 1.0,
            intent: 'casual_chat',
            emotion: 'neutral',
            safetyRisk: 0,
            selfHarmDetected: false,
            crisisLevel: 'normal_support',
            riskScore: 0,
            decision: 'normal_support',
            reason: ['empty input'],
            timestamp,
        };
    }

    const preprocessed = preprocessText(trimmed);
    const contextText = preprocessText(
        conversationContext
            .slice(-10)
            .map((m) => m.content)
            .join(' ')
    );

    const contextMessages: AzureChatMessage[] = conversationContext
        .slice(-6)
        .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: preprocessText(m.content) }));

    const semantic = await classifySemantics(preprocessed, contextMessages, (messages) =>
        getAzureChatCompletion(messages, { temperature: 0, maxTokens: 180 })
    );

    const safeSlangMatches = getSafeSlangMatches(preprocessed);
    const lonelinessDetected = detectLonelinessSignal(preprocessed, contextText);
    const protective = detectProtectiveFactors(preprocessed, contextText);
    const contradiction = detectContradictionSignals(preprocessed, contextText);
    const safetyFlags = detectSafetyFlags(preprocessed, contextText);
    const trendSnapshot = getTrendSnapshot();

    const riskAssessment = computeRiskAssessment(semantic, protective, contradiction, safetyFlags, trendSnapshot);
    const confidence = Math.max(semantic.intent_confidence, semantic.emotion_confidence);

    let requestedDecision = scoreToDecision(riskAssessment.overall_risk);
    const reasons: string[] = [...semantic.reason, ...riskAssessment.reasons];

    if (safeSlangMatches.length > 0) {
        reasons.push(`safe slang context detected: ${safeSlangMatches.join(', ')}`);
    }

    if (lonelinessDetected) {
        reasons.push('loneliness / social rejection context detected');
        if (requestedDecision === 'normal_support') {
            requestedDecision = 'peer_support_suggestion';
        }
    }

    reasons.push(...safetyFlags.reasons);

    if (requestedDecision === 'crisis_escalation' && (confidence < 0.8 || semantic.self_harm_intent < 0.7)) {
        if (safetyFlags.direct_self_harm_detected) {
            requestedDecision = 'peer_support_suggestion';
            reasons.push('direct self-harm detected so escalation remains high concern despite lower confidence');
        } else {
            requestedDecision = 'peer_support_suggestion';
            reasons.push('crisis escalation prevented due to low self-harm confidence');
        }
    }

    if (safetyFlags.direct_self_harm_detected && riskAssessment.overall_risk >= 70) {
        requestedDecision = 'crisis_escalation';
        reasons.push('crisis priority layer applied after all adjustments');
    }

    const escalationOutcome = applyEscalationCooldown(requestedDecision, riskAssessment.overall_risk, {
        cooldownMs: 10 * 60 * 1000,
        escalationDeltaThreshold: 25,
    });

    reasons.push(...escalationOutcome.reasons);

    const finalDecision = escalationOutcome.finalDecision;
    let finalLabel = mapToEmotionLabel(
        finalDecision,
        riskAssessment.overall_risk,
        semantic.intent,
        semantic.emotion,
        confidence,
        semantic.self_harm_intent,
        safetyFlags.direct_self_harm_detected,
        safetyFlags.harm_to_others_detected,
        lonelinessDetected
    );
    
    if (
        safetyFlags.direct_self_harm_detected &&
        (finalLabel === 'calm' || finalLabel === 'neutral' || finalLabel === 'happy')
    ) {
        finalLabel = riskAssessment.overall_risk >= 70 ? 'crisis' : 'severe';
        reasons.push('safety override: blocked low-arousal label for direct self-harm content');
    }

    appendTrendRecord({
        timestamp,
        emotion: semantic.emotion,
        overallRisk: riskAssessment.overall_risk,
        hopelessness: semantic.hopelessness_level,
        anxiety: Math.max(semantic.stress_level, semantic.emotion === 'anxiety' ? 0.7 : 0),
    });

    const analyticsSnapshot = buildAnalyticsSnapshot();

    logExplainableDecision({
        timestamp,
        intent: semantic.intent,
        emotion: semantic.emotion,
        confidence,
        decision: finalDecision,
        riskAssessment,
        reasons,
        preventionReason: escalationOutcome.preventedByCooldown ? 'cooldown prevented duplicate escalation' : undefined,
    });

    return {
        label: ALLOWED_EMOTIONS.includes(finalLabel) ? finalLabel : 'neutral',
        confidence,
        intent: semantic.intent,
        emotion: semantic.emotion,
        riskScore: riskAssessment.overall_risk,
        decision: finalDecision,
        reason: reasons,
        riskDimensions: riskAssessment.dimensions,
        dominantRiskType: riskAssessment.dominant_risk_type,
        trendEscalation: analyticsSnapshot.trendSnapshot.trend_escalation,
        sarcasmConfidence: contradiction.sarcasm_confidence,
        figurativeLanguageScore: contradiction.figurative_language_score,
        humorContextDetection: contradiction.humor_context_detection,
        protectiveFactorScore: protective.protective_factor_score,
        emotionalConfidence: semantic.emotion_confidence,
        safetyRisk: riskAssessment.overall_risk,
        selfHarmDetected: safetyFlags.direct_self_harm_detected,
        crisisLevel: finalDecision,
        figurativeSlangDetected: safetyFlags.figurative_slang_detected,
        humorDetected: safetyFlags.humor_detected,
        directSelfHarmDetected: safetyFlags.direct_self_harm_detected,
        harmToOthersDetected: safetyFlags.harm_to_others_detected,
        hopelessnessDetected: safetyFlags.hopelessness_detected,
        escalatingDistressDetected: safetyFlags.escalating_distress_detected,
        harmfulActionDetected: safetyFlags.harmful_action_detected,
        selfReferenceDetected: safetyFlags.self_reference_detected,
        passiveIdeationDetected: safetyFlags.passive_ideation_detected,
        selfHarmBehaviorDetected: safetyFlags.self_harm_behavior_detected,
        safetyIntentCategories: safetyFlags.safety_intent_categories,
        timestamp,
        analyticsSnapshot,
    };
};
