import type { InsightAnalyticsInput } from './types';
import { periodLabel } from './periodUtils';

export const buildDeepInsights = (input: InsightAnalyticsInput): string[] => {
  const range = periodLabel(input.period);
  const items: string[] = [];

  if (input.dominantMoodLabel) {
    items.push(
      `Dominant mood ${range} is ${input.dominantMoodLabel}, shaping how you perceive stress and recovery.`
    );
  } else {
    items.push(`Log moods ${range} to unlock pattern analysis alongside your wearable data.`);
  }

  items.push(`Weekly plan adherence is ${input.planCompletion}%, anchoring your daily wellness rhythm.`);

  const combinedStress =
    input.healthStressLevel === 'High' || input.moodStressIndex > 60
      ? 'elevated'
      : input.moodStressIndex > 40 || input.healthStressLevel === 'Medium'
        ? 'moderate'
        : 'lower';

  items.push(
    `Combined stress view (${range}): ${combinedStress} — journal stress ${input.moodStressIndex}%` +
      (input.healthStressLevel && input.healthStressLevel !== 'Unknown'
        ? `, wearable signal ${input.healthStressLevel.toLowerCase()}.`
        : '.')
  );

  if (input.healthSpo2 != null && input.healthSpo2 > 0) {
    items.push(`Blood oxygen averaged ${input.healthSpo2}% ${range} — useful for recovery context.`);
  }

  if (input.predictedMoodLabel && input.predictionConfidence != null) {
    items.push(
      `Predicted next mood: ${input.predictedMoodLabel} (${input.predictionConfidence}% confidence) based on recent check-ins.`
    );
  } else {
    items.push('Add more mood check-ins to unlock prediction-driven recommendations.');
  }

  if (input.positiveDaysPercent >= 50 && (input.healthRecovery ?? 0) >= 70) {
    items.push('Positive moods and solid recovery suggest good capacity for focused work blocks.');
  } else if (input.moodStressIndex > 60 && (input.healthSleepHours ?? 0) < 6) {
    items.push('Low sleep plus higher stress moods — consider earlier wind-down and lighter evening load.');
  }

  return items;
};
