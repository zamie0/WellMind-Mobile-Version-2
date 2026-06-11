export type IntentLabel =
  | 'casual_chat'
  | 'academic_stress'
  | 'emotional_distress'
  | 'anxiety'
  | 'depression_risk'
  | 'self_harm_risk'
  | 'crisis';

export type EmotionSignal =
  | 'sadness'
  | 'stress'
  | 'anger'
  | 'hopelessness'
  | 'anxiety'
  | 'neutral'
  | 'positive';

export type DetectionDecision = 'normal_support' | 'peer_support_suggestion' | 'crisis_escalation';

export interface SemanticDetectionResult {
  intent: IntentLabel;
  intent_confidence: number;
  emotion: EmotionSignal;
  emotion_confidence: number;
  self_harm_intent: number;
  hopelessness_level: number;
  stress_level: number;
  context_escalation: number;
  reason: string[];
}

export interface ProtectiveFactors {
  protective_factor_score: number;
  resilience_detection: number;
  support_system_detection: number;
  future_oriented_detection: number;
  reasons: string[];
}

export interface ContradictionSignals {
  sarcasm_confidence: number;
  figurative_language_score: number;
  humor_context_detection: number;
  figurative_slang_detected: boolean;
  humor_detected: boolean;
  reasons: string[];
}

export type SafetyIntentCategory =
  | 'direct_self_harm'
  | 'harm_to_others'
  | 'passive_hopelessness'
  | 'emotional_distress'
  | 'figurative_stress'
  | 'safe_slang';

export interface SafetyFlags {
  figurative_slang_detected: boolean;
  humor_detected: boolean;
  direct_self_harm_detected: boolean;
  hopelessness_detected: boolean;
  escalating_distress_detected: boolean;
  harmful_action_detected: boolean;
  self_reference_detected: boolean;
  passive_ideation_detected: boolean;
  self_harm_behavior_detected: boolean;
  safety_intent_categories: SafetyIntentCategory[];
  directSelfHarmMatches: string[];
  reasons: string[];
  harm_to_others_detected: boolean;
}

export interface RiskDimensions {
  suicide_risk: number;
  anxiety_risk: number;
  burnout_risk: number;
  loneliness_risk: number;
  academic_stress_risk: number;
}

export interface RiskAssessment {
  dimensions: RiskDimensions;
  overall_risk: number;
  dominant_risk_type: keyof RiskDimensions;
  reasons: string[];
}

export interface TrendSnapshot {
  rolling_emotional_average: number;
  repeated_distress_detection: number;
  emotional_deterioration_score: number;
  trend_escalation: 'low' | 'medium' | 'high';
  reasons: string[];
}

export interface EscalationOutcome {
  finalDecision: DetectionDecision;
  escalationAllowed: boolean;
  preventedByCooldown: boolean;
  reasons: string[];
}

export interface DailyMoodAggregate {
  day: string;
  averageRisk: number;
  dominantEmotion: EmotionSignal;
  sampleCount: number;
}

export interface AnalyticsSnapshot {
  timestamp: string;
  trendSnapshot: TrendSnapshot;
  dailyMoodAggregation: DailyMoodAggregate[];
  riskTrendHistory: Array<{ timestamp: string; overall_risk: number }>;
  anonymizedWellnessMetrics: {
    distressRatio: number;
    supportRatio: number;
    trendEscalationLevel: TrendSnapshot['trend_escalation'];
  };
}
