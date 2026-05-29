import type { MoodEntry } from '@/types/wellmind';
import type { HealthInsightPeriod } from './types';

export const periodToDays = (period: HealthInsightPeriod): number => {
  switch (period) {
    case 'week':
      return 7;
    case 'month':
      return 30;
    default:
      return 1;
  }
};

export const periodLabel = (period: HealthInsightPeriod): string => {
  switch (period) {
    case 'week':
      return 'this week';
    case 'month':
      return 'this month';
    default:
      return 'today';
  }
};

export const filterMoodEntriesByPeriod = (entries: MoodEntry[], period: HealthInsightPeriod): MoodEntry[] => {
  const days = periodToDays(period);
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return entries.filter((entry) => new Date(entry.timestamp).getTime() >= cutoff);
};

export const computeMoodStressIndex = (entries: MoodEntry[]): number => {
  if (!entries.length) return 0;
  const stressSignals = entries.filter((entry) =>
    ['anxious', 'stressed', 'exhausted', 'sad'].includes(entry.emotion)
  ).length;
  return Math.round((stressSignals / entries.length) * 100);
};
