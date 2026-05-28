import type { EmotionSignal, TrendSnapshot } from './types';

interface TrendHistoryRecord {
  timestamp: string;
  emotion: EmotionSignal;
  overallRisk: number;
  hopelessness: number;
  anxiety: number;
}

const STORAGE_KEY = 'mindbuddy_emotion_trend_history_v1';

const emotionSeverity: Record<EmotionSignal, number> = {
  positive: 10,
  neutral: 20,
  stress: 40,
  anger: 45,
  sadness: 50,
  anxiety: 60,
  hopelessness: 80,
};

const toDayKey = (iso: string) => iso.slice(0, 10);

const readHistory = (): TrendHistoryRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TrendHistoryRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeHistory = (records: TrendHistoryRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(-200)));
  } catch {
    // ignore persistence errors
  }
};

export const appendTrendRecord = (record: Omit<TrendHistoryRecord, 'timestamp'> & { timestamp?: string }) => {
  const timestamp = record.timestamp || new Date().toISOString();
  const next: TrendHistoryRecord = { ...record, timestamp };
  const all = readHistory();
  all.push(next);
  writeHistory(all);
  return all;
};

export const getTrendHistory = () => readHistory();

export const getTrendSnapshot = (): TrendSnapshot => {
  const history = readHistory();
  const last = history.slice(-12);
  if (last.length === 0) {
    return {
      rolling_emotional_average: 0,
      repeated_distress_detection: 0,
      emotional_deterioration_score: 0,
      trend_escalation: 'low',
      reasons: ['no trend history yet'],
    };
  }

  const rolling_emotional_average = Math.round(
    last.reduce((sum, item) => sum + emotionSeverity[item.emotion], 0) / last.length
  );

  const distressCount = last.filter((i) => ['sadness', 'anxiety', 'hopelessness'].includes(i.emotion)).length;
  const repeated_distress_detection = Math.min(100, Math.round((distressCount / last.length) * 100));

  const firstHalf = last.slice(0, Math.max(1, Math.floor(last.length / 2)));
  const secondHalf = last.slice(Math.floor(last.length / 2));
  const firstAvg = firstHalf.reduce((s, i) => s + i.overallRisk, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((s, i) => s + i.overallRisk, 0) / secondHalf.length;
  const emotional_deterioration_score = Math.max(0, Math.round(secondAvg - firstAvg));

  const escalationRaw = rolling_emotional_average * 0.35 + repeated_distress_detection * 0.4 + emotional_deterioration_score * 0.8;
  const escalationScore = Math.min(100, Math.round(escalationRaw));

  let trend_escalation: TrendSnapshot['trend_escalation'] = 'low';
  if (escalationScore >= 70) trend_escalation = 'high';
  else if (escalationScore >= 40) trend_escalation = 'medium';

  const reasons: string[] = [];
  if (repeated_distress_detection >= 60) reasons.push('repeated distress pattern detected');
  if (emotional_deterioration_score >= 15) reasons.push('emotional deterioration over recent history');
  if (trend_escalation === 'high') reasons.push('trend escalation is high');

  if (reasons.length === 0) reasons.push('stable emotional trend');

  return {
    rolling_emotional_average,
    repeated_distress_detection,
    emotional_deterioration_score,
    trend_escalation,
    reasons,
  };
};

export const getDailyMoodAggregation = () => {
  const history = readHistory();
  const grouped = new Map<string, TrendHistoryRecord[]>();

  history.forEach((record) => {
    const day = toDayKey(record.timestamp);
    const existing = grouped.get(day) || [];
    existing.push(record);
    grouped.set(day, existing);
  });

  return Array.from(grouped.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14)
    .map(([day, items]) => {
      const averageRisk = Math.round(items.reduce((sum, i) => sum + i.overallRisk, 0) / items.length);
      const emotionCounts = items.reduce<Record<EmotionSignal, number>>((acc, item) => {
        acc[item.emotion] = (acc[item.emotion] || 0) + 1;
        return acc;
      }, { positive: 0, neutral: 0, stress: 0, anger: 0, sadness: 0, anxiety: 0, hopelessness: 0 });

      const dominantEmotion = (Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral') as EmotionSignal;

      return {
        day,
        averageRisk,
        dominantEmotion,
        sampleCount: items.length,
      };
    });
};
