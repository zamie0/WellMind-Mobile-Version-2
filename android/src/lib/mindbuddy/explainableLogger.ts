import { getDailyMoodAggregation, getTrendHistory, getTrendSnapshot } from './emotionTrendEngine';
import type { AnalyticsSnapshot, DetectionDecision, EmotionSignal, IntentLabel, RiskAssessment } from './types';

export interface ExplainableDecisionLogInput {
  timestamp: string;
  intent: IntentLabel;
  emotion: EmotionSignal;
  confidence: number;
  decision: DetectionDecision;
  riskAssessment: RiskAssessment;
  reasons: string[];
  preventionReason?: string;
}

export const buildAnalyticsSnapshot = (): AnalyticsSnapshot => {
  const trendSnapshot = getTrendSnapshot();
  const riskTrendHistory = getTrendHistory().slice(-40).map((h) => ({ timestamp: h.timestamp, overall_risk: h.overallRisk }));
  const dailyMoodAggregation = getDailyMoodAggregation();

  const distressCount = riskTrendHistory.filter((r) => r.overall_risk >= 45).length;
  const supportCount = riskTrendHistory.filter((r) => r.overall_risk <= 30).length;
  const total = Math.max(1, riskTrendHistory.length);

  return {
    timestamp: new Date().toISOString(),
    trendSnapshot,
    dailyMoodAggregation,
    riskTrendHistory,
    anonymizedWellnessMetrics: {
      distressRatio: Number((distressCount / total).toFixed(3)),
      supportRatio: Number((supportCount / total).toFixed(3)),
      trendEscalationLevel: trendSnapshot.trend_escalation,
    },
  };
};

export const logExplainableDecision = (input: ExplainableDecisionLogInput) => {
  const payload = {
    timestamp: input.timestamp,
    intent: input.intent,
    emotion: input.emotion,
    confidence: input.confidence,
    decision: input.decision,
    risk_score: input.riskAssessment.overall_risk,
    risk_dimensions: input.riskAssessment.dimensions,
    dominant_risk_type: input.riskAssessment.dominant_risk_type,
    reason: input.reasons,
    prevention_reason: input.preventionReason,
  };

  console.info('[MindBuddyExplainableDecision]', payload);
};
