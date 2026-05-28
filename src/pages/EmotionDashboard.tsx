import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMindBuddyChatStore } from '@/stores/mindBuddyChatStore';
import type { MindBuddyMessage } from '@/stores/mindBuddyChatStore';
import type { EmotionLabel } from '@/lib/azureOpenAI';

const emotionMeta: Record<EmotionLabel, { emoji: string; label: string; bg: string; text: string; bar: string }> = {
  happy:   { emoji: '😄', label: 'Happy',       bg: 'bg-yellow-50',  text: 'text-yellow-700', bar: 'bg-yellow-400' },
  calm:    { emoji: '😌', label: 'Calm',         bg: 'bg-blue-50',    text: 'text-blue-600',   bar: 'bg-blue-400' },
  stress:  { emoji: '😤', label: 'Stressed',     bg: 'bg-orange-50',  text: 'text-orange-600', bar: 'bg-orange-400' },
  anxious: { emoji: '😰', label: 'Anxious',      bg: 'bg-purple-50',  text: 'text-purple-600', bar: 'bg-purple-400' },
  depress: { emoji: '😔', label: 'Low',          bg: 'bg-gray-100',   text: 'text-gray-600',   bar: 'bg-gray-400' },
  severe:  { emoji: '⚠️', label: 'Overwhelmed',  bg: 'bg-orange-100', text: 'text-orange-700', bar: 'bg-orange-500' },
  crisis:  { emoji: '🚨', label: 'In Crisis',    bg: 'bg-red-50',     text: 'text-red-700',    bar: 'bg-red-500' },
  neutral: { emoji: '😐', label: 'Neutral',      bg: 'bg-muted',      text: 'text-muted-foreground', bar: 'bg-slate-300' },
};

const POSITIVE_EMOTIONS: EmotionLabel[] = ['happy', 'calm'];
const NEUTRAL_EMOTIONS: EmotionLabel[] = ['neutral'];

function getInsight(counts: Record<string, number>, total: number): string {
  if (total === 0) return 'Start chatting with MindBuddy to track your emotions! 💬';
  const topEmotion = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as EmotionLabel | undefined;
  if (!topEmotion) return 'Keep sharing your feelings! 🌱';
  const meta = emotionMeta[topEmotion];
  if (topEmotion === 'crisis') return '🚨 Please reach out to a professional. You matter!';
  if (topEmotion === 'severe') return "⚠️ You've been under a lot of pressure. Consider talking to a counselor.";
  if (POSITIVE_EMOTIONS.includes(topEmotion)) return `${meta.emoji} You've been feeling ${meta.label.toLowerCase()} most often. Keep it up!`;
  if (NEUTRAL_EMOTIONS.includes(topEmotion)) return '😐 Things seem steady. MindBuddy is here whenever you need to talk.';
  return `${meta.emoji} It looks like ${meta.label.toLowerCase()} has been most common. MindBuddy is here for you 💚`;
}

export const EmotionDashboard = () => {
  const navigate = useNavigate();
  const messages = useMindBuddyChatStore((s) => s.messages);
  const lastEmotion = useMindBuddyChatStore((s) => s.lastEmotion);

  // Only user messages with detected emotion
  const emotionMessages = messages.filter((m) => m.sender === 'user' && m.emotion);

  // Count per emotion
  const counts: Record<string, number> = {};
  for (const m of emotionMessages) {
    if (m.emotion) counts[m.emotion] = (counts[m.emotion] ?? 0) + 1;
  }
  const total = emotionMessages.length;

  // Last 10 messages with emotion for timeline
  const timeline: MindBuddyMessage[] = [...emotionMessages].reverse().slice(0, 10);

  // Today's dominant emotion = lastEmotion or most frequent today
  const todayEmotion: EmotionLabel = lastEmotion ?? 'neutral';
  const todayMeta = emotionMeta[todayEmotion];

  const insight = getInsight(counts, total);

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => navigate('/rewards', { state: { openMindBuddy: true, fromEmotionDashboard: true } })}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="text-2xl">🌈</span>
        <h1 className="text-lg font-semibold text-foreground">My Emotions</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-8">

        {/* Chat Mood Snapshot */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`rounded-2xl p-5 flex items-center gap-4 ${todayMeta.bg}`}
        >
          <span className="text-5xl">{todayMeta.emoji}</span>
          <div>
            <p className={`text-xs font-medium uppercase tracking-wide ${todayMeta.text} opacity-70`}>Last Chat Mood</p>
            <p className={`text-2xl font-bold ${todayMeta.text}`}>{todayMeta.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">AI-detected from your MindBuddy chat</p>
          </div>
        </motion.div>

        {/* Insight Banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="rounded-2xl bg-primary/10 px-4 py-3"
        >
          <p className="text-sm text-foreground leading-relaxed">{insight}</p>
        </motion.div>

        {/* Emotion Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-4 space-y-3"
        >
          <h2 className="text-sm font-semibold text-foreground">Emotion Breakdown</h2>
          {total === 0 ? (
            <p className="text-xs text-muted-foreground">No data yet. Start chatting to see your patterns!</p>
          ) : (
            (Object.entries(emotionMeta) as [EmotionLabel, typeof emotionMeta[EmotionLabel]][])
              .filter(([key]) => counts[key] > 0)
              .sort((a, b) => (counts[b[0]] ?? 0) - (counts[a[0]] ?? 0))
              .map(([key, meta]) => {
                const count = counts[key] ?? 0;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-medium ${meta.text}`}>{meta.emoji} {meta.label}</span>
                      <span className="text-muted-foreground">{count}× ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${meta.bar}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                );
              })
          )}
        </motion.div>

        {/* Recent Emotion Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="rounded-2xl border border-border bg-card p-4 space-y-3"
        >
          <h2 className="text-sm font-semibold text-foreground">Recent Messages</h2>
          {timeline.length === 0 ? (
            <p className="text-xs text-muted-foreground">No messages yet.</p>
          ) : (
            timeline.map((m) => {
                const meta = emotionMeta[m.emotion!];
                const confidence = m.emotionConfidence ?? null;
                return (
                  <div key={m.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${meta.bg} ${meta.text}`}
                      >
                        {meta.emoji} {meta.label}
                      </span>
                      {confidence !== null && (
                        <span className="text-[10px] text-muted-foreground">
                          {Math.round(confidence * 100)}% confident
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{m.content}</p>
                  </div>
                );
              })
          )}
        </motion.div>

      </div>
    </div>
  );
};

export default EmotionDashboard;
