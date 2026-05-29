import { useMemo } from 'react';
import { useWellMindStore } from '@/stores/wellmindStore';
import type { Emotion } from '@/types/wellmind';
import { buildDeepInsights } from './buildDeepInsights';
import { buildTrendHighlights } from './buildTrendHighlights';
import { computeMoodStressIndex, filterMoodEntriesByPeriod } from './periodUtils';
import type { HealthInsightPeriod, InsightAnalyticsInput } from './types';
import type { HealthSnapshot } from '../Smartwatch/types';

const emotionLabels: Record<Emotion, string> = {
  happy: 'Happy',
  neutral: 'Okay',
  sad: 'Sad',
  anxious: 'Anxious',
  stressed: 'Stressed',
  exhausted: 'Exhausted',
  numb: 'Numb',
};

interface UseInsightAnalyticsOptions {
  period: HealthInsightPeriod;
  periodHealth: HealthSnapshot | null;
  healthLinked: boolean;
}

export const useInsightAnalytics = ({ period, periodHealth, healthLinked }: UseInsightAnalyticsOptions) => {
  const moodEntries = useWellMindStore((state) => state.moodEntries);
  const currentStreak = useWellMindStore((state) => state.currentStreak);
  const weeklyPlan = useWellMindStore((state) => state.weeklyPlan);
  const moodPrediction = useWellMindStore((state) => state.moodPrediction);
  const calmCoins = useWellMindStore((state) => state.calmCoins);
  const badges = useWellMindStore((state) => state.badges);

  const analyticsInput = useMemo((): InsightAnalyticsInput => {
    const rangedEntries = filterMoodEntriesByPeriod(moodEntries, period);

    const moodCounts = rangedEntries.reduce(
      (acc, entry) => {
        acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
        return acc;
      },
      {} as Record<Emotion, number>
    );

    const top = Object.entries(moodCounts).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0];
    const dominantMood = top ? (top[0] as Emotion) : null;

    const positiveDays =
      rangedEntries.length > 0
        ? Math.round((rangedEntries.filter((e) => e.emotion === 'happy').length / rangedEntries.length) * 100)
        : 0;

    const planCompletion =
      weeklyPlan?.tasks.length ?
        Math.round((weeklyPlan.tasks.filter((t) => t.completed).length / weeklyPlan.tasks.length) * 100)
      : 0;

    const health = healthLinked ? periodHealth : null;

    return {
      period,
      moodStressIndex: computeMoodStressIndex(rangedEntries),
      checkInCount: rangedEntries.length,
      positiveDaysPercent: positiveDays,
      dominantMoodLabel: dominantMood ? emotionLabels[dominantMood] : null,
      planCompletion,
      currentStreak,
      calmCoins,
      badgeCount: badges.length,
      predictedMoodLabel: moodPrediction ? emotionLabels[moodPrediction.predictedMood] : null,
      predictionConfidence: moodPrediction?.confidence ?? null,
      healthSteps: health?.steps ?? null,
      healthSleepHours: health?.sleepHours ?? null,
      healthRecovery: health?.recovery ?? null,
      healthStressLevel: health?.stressLevel ?? null,
      healthRestingHr: health?.restingHr ?? null,
      healthSpo2: health?.spo2 ?? null,
    };
  }, [
    period,
    moodEntries,
    weeklyPlan,
    currentStreak,
    calmCoins,
    badges.length,
    moodPrediction,
    periodHealth,
    healthLinked,
  ]);

  const trendHighlights = useMemo(() => buildTrendHighlights(analyticsInput), [analyticsInput]);
  const deepInsights = useMemo(() => buildDeepInsights(analyticsInput), [analyticsInput]);

  return { trendHighlights, deepInsights, analyticsInput };
};
