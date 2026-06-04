import type { InsightAnalyticsInput } from './types';
import { periodLabel } from './periodUtils';

export const buildTrendHighlights = (input: InsightAnalyticsInput): string[] => {
  const range = periodLabel(input.period);
  const items: string[] = [];

  if (input.healthSteps != null && input.healthSteps > 0) {
    if (input.period === 'day') {
      items.push(`You logged ${input.healthSteps.toLocaleString()} steps today (calendar day from Health Connect).`);
    } else {
      const dailyAvg = Math.round(input.healthSteps / (input.period === 'week' ? 7 : 30));
      items.push(
        `You logged ${input.healthSteps.toLocaleString()} steps ${range} (~${dailyAvg.toLocaleString()}/day average).`
      );
    }
  }

  if (input.healthSleepHours != null && input.healthSleepHours > 0) {
    items.push(
      `Sleep averaged ${input.healthSleepHours.toFixed(1)} hours ${range}${input.healthRecovery != null ? ` with ${input.healthRecovery}% recovery score.` : '.'}`
    );
  }

  if (input.healthStressLevel && input.healthStressLevel !== 'Unknown') {
    items.push(
      `Wearable stress signal is ${input.healthStressLevel.toLowerCase()} ${range}${input.healthRestingHr ? ` (resting HR ~${input.healthRestingHr} bpm).` : '.'}`
    );
  }

  items.push(
    `Mood check-ins ${range}: ${input.checkInCount} logged; stress index ${input.moodStressIndex}% from journal entries.`
  );

  items.push(
    `Streak ${input.currentStreak} day(s) · ${input.calmCoins} Calm Coins · ${input.badgeCount} badge(s) unlocked.`
  );

  if (input.moodStressIndex > 60) {
    items.push('Mood + body signals suggest elevated load — prioritize sleep and short recovery breaks.');
  } else if (input.healthRecovery != null && input.healthRecovery >= 75) {
    items.push('Recovery and mood trends look supportive — maintain your current routine.');
  } else {
    items.push('Trends are stable — keep consistent check-ins to sharpen predictions.');
  }

  return items;
};
