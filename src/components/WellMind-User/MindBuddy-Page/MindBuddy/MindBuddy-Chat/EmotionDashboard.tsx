import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, Sparkles, TrendingUp, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMindBuddyChatStore } from '@/stores/mindBuddyChatStore';
import type { MindBuddyMessage } from '@/stores/mindBuddyChatStore';
import type { EmotionLabel } from '@/lib/azureOpenAI';

const emotionMeta: Record<EmotionLabel, { emoji: string; label: string; bg: string; text: string; bar: string; glow: string }> = {
  happy:   { emoji: '😄', label: 'Happy',      bg: 'bg-honey-light',    text: 'text-honey',       bar: 'bg-honey',       glow: 'shadow-honey/30' },
  calm:    { emoji: '😌', label: 'Calm',        bg: 'bg-sky-light',      text: 'text-sky',         bar: 'bg-sky',         glow: 'shadow-sky/30' },
  stress:  { emoji: '😤', label: 'Stressed',    bg: 'bg-coral-light',    text: 'text-coral',       bar: 'bg-coral',       glow: 'shadow-coral/30' },
  anxious: { emoji: '😰', label: 'Anxious',     bg: 'bg-lavender-light', text: 'text-lavender',    bar: 'bg-lavender',    glow: 'shadow-lavender/30' },
  depress: { emoji: '😔', label: 'Low',         bg: 'bg-muted',          text: 'text-muted-foreground', bar: 'bg-slate-400', glow: 'shadow-slate/20' },
  severe:  { emoji: '⚠️', label: 'Overwhelmed', bg: 'bg-coral-light',    text: 'text-coral',       bar: 'bg-coral',       glow: 'shadow-coral/30' },
  crisis:  { emoji: '🚨', label: 'In Crisis',   bg: 'bg-destructive/10', text: 'text-destructive', bar: 'bg-destructive', glow: 'shadow-destructive/30' },
  neutral: { emoji: '😐', label: 'Neutral',     bg: 'bg-muted',          text: 'text-muted-foreground', bar: 'bg-slate-300', glow: 'shadow-slate/20' },
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
  return `${meta.emoji} ${meta.label} has been most common lately. MindBuddy is here for you 💚`;
}

export const EmotionDashboard = () => {
  const navigate = useNavigate();
  const messages = useMindBuddyChatStore((s) => s.messages);
  const lastEmotion = useMindBuddyChatStore((s) => s.lastEmotion);

  const emotionMessages = messages.filter((m) => m.sender === 'user' && m.emotion);
  const counts: Record<string, number> = {};
  for (const m of emotionMessages) {
    if (m.emotion) counts[m.emotion] = (counts[m.emotion] ?? 0) + 1;
  }
  const total = emotionMessages.length;
  const timeline: MindBuddyMessage[] = [...emotionMessages].reverse().slice(0, 10);
  const todayEmotion: EmotionLabel = lastEmotion ?? 'neutral';
  const todayMeta = emotionMeta[todayEmotion];
  const insight = getInsight(counts, total);

  const sortedEmotions = (Object.entries(emotionMeta) as [EmotionLabel, typeof emotionMeta[EmotionLabel]][])
    .filter(([key]) => counts[key] > 0)
    .sort((a, b) => (counts[b[0]] ?? 0) - (counts[a[0]] ?? 0));

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: 'env(safe-area-inset-top)' }}>

      {/* Header */}
      <header className="gradient-sage px-5 pt-safe-top pb-10 rounded-b-[2.5rem]">
        <div className="pt-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mb-2 -ml-2 text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-foreground">My Emotions</h1>
            <p className="text-muted-foreground">AI-tracked from your MindBuddy chats</p>
          </motion.div>
        </div>

        {/* Floating mood card inside header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-5 bg-card rounded-2xl p-4 shadow-card flex items-center gap-4"
        >
          <div className={`w-14 h-14 rounded-2xl ${todayMeta.bg} flex items-center justify-center text-3xl shadow-sm`}>
            {todayMeta.emoji}
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-0.5">Last detected mood</p>
            <p className={`text-xl font-bold ${todayMeta.text}`}>{todayMeta.label}</p>
          </div>
          <div className={`px-3 py-1.5 rounded-xl ${todayMeta.bg}`}>
            <Brain className={`h-5 w-5 ${todayMeta.text}`} />
          </div>
        </motion.div>
      </header>

      <div className="px-5 py-6 space-y-5 pb-10">

        {/* Insight Banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-2xl p-4 shadow-soft flex items-start gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-sage-light flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="h-4 w-4 text-sage" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">MindBuddy Insight</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{insight}</p>
          </div>
        </motion.div>

        {/* Stats row */}
        {total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="bg-card rounded-2xl p-4 shadow-soft text-center">
              <p className="text-2xl font-bold text-foreground">{total}</p>
              <p className="text-xs text-muted-foreground mt-1">Messages tracked</p>
            </div>
            <div className="bg-card rounded-2xl p-4 shadow-soft text-center">
              <p className="text-2xl font-bold text-foreground">{sortedEmotions.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Emotions detected</p>
            </div>
          </motion.div>
        )}

        {/* Emotion Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card rounded-2xl p-5 shadow-soft"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-lavender-light flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-lavender" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Emotion Breakdown</h2>
          </div>

          {total === 0 ? (
            <div className="text-center py-6">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-sm text-muted-foreground">No data yet.</p>
              <p className="text-xs text-muted-foreground">Start chatting to see your patterns!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedEmotions.map(([key, meta], i) => {
                const count = counts[key] ?? 0;
                const pct = Math.round((count / total) * 100);
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${meta.bg} ${meta.text}`}>
                          {meta.emoji} {meta.label}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{pct}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${meta.bar}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 + i * 0.05 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Recent Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-5 shadow-soft"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-honey-light flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-honey" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Recent Messages</h2>
          </div>

          {timeline.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-3xl mb-2">🌱</p>
              <p className="text-sm text-muted-foreground">No messages yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {timeline.map((m, i) => {
                const meta = emotionMeta[m.emotion!];
                const confidence = m.emotionConfidence ?? null;
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.04 }}
                    className="flex items-start gap-3 bg-muted/40 rounded-xl p-3"
                  >
                    {/* Emotion pill + confidence */}
                    <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${meta.bg} ${meta.text}`}>
                        {meta.emoji} {meta.label}
                      </span>
                      {confidence !== null && (
                        <span className="text-[10px] text-muted-foreground">
                          {Math.round(confidence * 100)}%
                        </span>
                      )}
                    </div>

                    {/* Vertical divider */}
                    <div className="w-px self-stretch bg-border shrink-0" />

                    {/* Message */}
                    <p className="text-xs text-muted-foreground line-clamp-2 flex-1 leading-relaxed">
                      {m.content}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
};

export default EmotionDashboard;