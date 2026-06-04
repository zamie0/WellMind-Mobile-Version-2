import type { HealthInsightPeriod } from '../Smartwatch/types';

export type { HealthInsightPeriod };

export const INSIGHT_PERIOD_LABELS: Record<HealthInsightPeriod, string> = {
  day: 'Day',
  week: 'Week',
  month: 'Month',
};

export interface InsightAnalyticsInput {
  period: HealthInsightPeriod;
  moodStressIndex: number;
  checkInCount: number;
  positiveDaysPercent: number;
  dominantMoodLabel: string | null;
  planCompletion: number;
  currentStreak: number;
  calmCoins: number;
  badgeCount: number;
  predictedMoodLabel: string | null;
  predictionConfidence: number | null;
  healthSteps: number | null;
  healthSleepHours: number | null;
  healthRecovery: number | null;
  healthStressLevel: string | null;
  healthRestingHr: number | null;
  healthSpo2: number | null;
}
