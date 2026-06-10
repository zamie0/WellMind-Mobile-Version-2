import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, Sparkles, TrendingUp, MessageCircle, Heart } from 'lucide-react';
import { useMindBuddyChatStore } from '@/stores/mindBuddyChatStore';
import type { MindBuddyMessage } from '@/stores/mindBuddyChatStore';
import type { EmotionLabel } from '@/lib/azureOpenAI';

const emotionMeta: Record<EmotionLabel, {
  emoji: string; label: string;
  accent: string; accentBg: string; accentText: string;
  barColor: string;
}> = {
  happy:   { emoji: '😄', label: 'Happy',       accent: '#d97706', accentBg: 'rgba(251,191,36,0.12)',  accentText: '#92600a', barColor: '#d97706' },
  calm:    { emoji: '😌', label: 'Calm',         accent: '#39a89b', accentBg: 'rgba(57,168,155,0.12)',  accentText: '#1d6b61', barColor: '#39a89b' },
  stress:  { emoji: '😤', label: 'Stressed',     accent: '#e8735a', accentBg: 'rgba(232,115,90,0.12)',  accentText: '#993c1d', barColor: '#e8735a' },
  anxious: { emoji: '😰', label: 'Anxious',      accent: '#7c6fa0', accentBg: 'rgba(124,111,160,0.12)', accentText: '#4a3a7a', barColor: '#7c6fa0' },
  depress: { emoji: '😔', label: 'Low',          accent: '#8fa3b1', accentBg: 'rgba(143,163,177,0.12)', accentText: '#5f7585', barColor: '#8fa3b1' },
  severe:  { emoji: '⚠️', label: 'Overwhelmed',  accent: '#e8735a', accentBg: 'rgba(232,115,90,0.12)',  accentText: '#993c1d', barColor: '#e8735a' },
  crisis:  { emoji: '🚨', label: 'In Crisis',    accent: '#dc2626', accentBg: 'rgba(220,38,38,0.1)',    accentText: '#991b1b', barColor: '#dc2626' },
  neutral: { emoji: '😐', label: 'Neutral',      accent: '#8fa3b1', accentBg: 'rgba(143,163,177,0.12)', accentText: '#5f7585', barColor: '#8fa3b1' },
};

const POSITIVE_EMOTIONS: EmotionLabel[] = ['happy', 'calm'];
const NEUTRAL_EMOTIONS: EmotionLabel[] = ['neutral'];

function getInsight(counts: Record<string, number>, total: number): string {
  if (total === 0) return 'Start chatting with MindBuddy to track your emotions. Your feelings matter, and noticing them is the first step toward understanding yourself better. 💚';
  
  const topEmotion = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as EmotionLabel | undefined;
  if (!topEmotion) return 'Keep sharing your feelings. Every conversation helps you understand what you're going through. 🌱';
  
  const meta = emotionMeta[topEmotion];
  const secondTop = Object.entries(counts).sort((a, b) => b[1] - a[1])[1]?.[0] as EmotionLabel | undefined;
  const topCount = counts[topEmotion] ?? 0;
  const topPct = Math.round((topCount / total) * 100);
  
  if (topEmotion === 'crisis') {
    return "🚨 I'm concerned about what you've been sharing. Your safety matters most. Please reach out to a professional counselor or crisis support. You don't have to go through this alone.";
  }
  
  if (topEmotion === 'severe') {
    return `⚠️ You've been feeling overwhelmed often (${topPct}% of the time). That's a lot to carry. Consider speaking with a counselor — they can help you work through what's weighing on you. You deserve real support.`;
  }
  
  if (topEmotion === 'depress') {
    return `😔 You've been feeling low lately (${topPct}% of the time)${secondTop ? `, especially when you're also ${emotionMeta[secondTop].label.toLowerCase()}` : ''}. This pattern is worth exploring with someone you trust. Talking about it can help — and MindBuddy is here to listen whenever you need.`;
  }
  
  if (topEmotion === 'anxious') {
    return `😰 Anxiety has been showing up often (${topPct}% of the time). That's your mind trying to protect you, but it can feel overwhelming. Grounding techniques and talking through what worries you can help. What's one thing that helped you feel calmer recently?`;
  }
  
  if (topEmotion === 'stress') {
    return `😤 You've been stressed frequently (${topPct}% of the time). Stress is your body telling you something needs attention — whether it's rest, boundaries, or support. Notice what patterns trigger it. That awareness is powerful.`;
  }
  
  if (POSITIVE_EMOTIONS.includes(topEmotion)) {
    return `${meta.emoji} You've been feeling ${meta.label.toLowerCase()} most often (${topPct}% of the time) — that's wonderful. Notice what helped create those moments. Keep doing those things. 💚`;
  }
  
  if (NEUTRAL_EMOTIONS.includes(topEmotion)) {
    return '😐 Things seem steady for you. That stability is valuable. MindBuddy is here whenever you want to explore deeper feelings or just need someone to listen.';
  }
  
  return `${meta.emoji} ${meta.label} has been most common (${topPct}% of the time). Your emotions are trying to tell you something — whether it's to slow down, ask for help, or celebrate a win. What do you think they're pointing to?`;
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
    <div
      className="min-h-screen pb-28"
      style={{ background: 'linear-gradient(180deg, #f0f7f5 0%, #f7faf9 60%, #ffffff 100%)' }}
    >
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-10 px-5 py-3.5"
        style={{
          background: 'rgba(240,247,245,0.96)',
          backdropFilter: 'blur(12px)',
          borderBottom: '0.5px solid rgba(57,168,155,0.15)',
          paddingTop: 'max(env(safe-area-inset-top), 14px)',
        }}
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" style={{ color: '#5f7585' }} />
          </motion.button>

          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #39a89b, #6bab9e)',
                boxShadow: '0 2px 8px rgba(57,168,155,0.3)',
              }}
            >
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: '#1a2b38' }}>My Emotions</p>
              <p className="text-[11px] font-semibold" style={{ color: '#39a89b' }}>
                Understanding your emotional patterns
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden px-5 pt-8 pb-6"
      >
        <div
          className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(57,168,155,0.13) 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute top-8 -left-12 w-48 h-48 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(107,171,158,0.08) 0%, transparent 70%)' }}
        />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h2
            className="text-[1.75rem] font-bold leading-tight mb-1.5"
            style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}
          >
            Your Emotional{'\n'}Journey.
          </h2>
          <p className="text-[14px] leading-relaxed mb-5" style={{ color: '#5f7585' }}>
            Every feeling tells a story. Noticing your patterns helps you understand yourself better.
          </p>
        </motion.div>

        {/* Last detected mood card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 26 }}
          className="rounded-3xl overflow-hidden"
          style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
        >
          <div
            className="h-0.5 w-full"
            style={{ background: `linear-gradient(90deg, ${todayMeta.accent}, ${todayMeta.accent}88)` }}
          />
          <div className="p-4 flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: todayMeta.accentBg }}
            >
              {todayMeta.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px]" style={{ color: '#8fa3b1' }}>How you're feeling now</p>
              <p className="text-xl font-bold" style={{ color: todayMeta.accent }}>{todayMeta.label}</p>
            </div>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: todayMeta.accentBg }}
            >
              <Brain className="h-5 w-5" style={{ color: todayMeta.accent }} strokeWidth={1.75} />
            </div>
          </div>
        </motion.div>
      </motion.div>

      <main className="px-5 space-y-4 pb-6">

        {/* ── Insight banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 280, damping: 26 }}
          className="rounded-3xl overflow-hidden"
          style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
        >
          <div
            className="h-0.5 w-full"
            style={{ background: 'linear-gradient(90deg, #7c6fa0, #7c6fa088)' }}
          />
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(124,111,160,0.1)' }}
              >
                <Sparkles className="h-4 w-4" style={{ color: '#7c6fa0' }} strokeWidth={1.75} />
              </div>
              <p className="text-sm font-bold" style={{ color: '#1a2b38' }}>What Your Patterns Tell Us</p>
            </div>
            <p className="text-[13px] leading-relaxed" style={{ color: '#5f7585' }}>{insight}</p>
          </div>
        </motion.div>

        {/* ── Stats row ── */}
        {total > 0 && (
          <>
            <p
              className="text-[10px] font-semibold uppercase tracking-widest px-1"
              style={{ color: '#8fa3b1' }}
            >
              Overview
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Times you opened up', value: total, accent: '#39a89b' },
                { label: 'Different feelings explored', value: sortedEmotions.length, accent: '#e8735a' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.06, type: 'spring', stiffness: 280, damping: 26 }}
                  className="rounded-3xl overflow-hidden"
                  style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
                >
                  <div
                    className="h-0.5 w-full"
                    style={{ background: `linear-gradient(90deg, ${stat.accent}, ${stat.accent}88)` }}
                  />
                  <div className="p-4 text-center">
                    <p className="text-3xl font-bold" style={{ color: '#1a2b38' }}>{stat.value}</p>
                    <p className="text-[11px] mt-1" style={{ color: '#8fa3b1' }}>{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* ── Emotion breakdown ── */}
        <section>
          <p
            className="text-[10px] font-semibold uppercase tracking-widest px-1 mb-3"
            style={{ color: '#8fa3b1' }}
          >
            Emotion Breakdown
          </p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, type: 'spring', stiffness: 280, damping: 26 }}
            className="rounded-3xl overflow-hidden"
            style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
          >
            <div
              className="h-0.5 w-full"
              style={{ background: 'linear-gradient(90deg, #3b82f6, #3b82f688)' }}
            />
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(59,130,246,0.1)' }}
                >
                  <TrendingUp className="h-5 w-5" style={{ color: '#3b82f6' }} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#1a2b38' }}>Your Emotion Distribution</p>
                  <p className="text-[11px]" style={{ color: '#8fa3b1' }}>
                    From {total} heartfelt message{total !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div
                className="h-px w-full mb-4"
                style={{ background: 'linear-gradient(90deg, rgba(57,168,155,0.15), transparent)' }}
              />

              {total === 0 ? (
                <div className="text-center py-6">
                  <p className="text-3xl mb-2">💬</p>
                  <p className="text-sm" style={{ color: '#8fa3b1' }}>No data yet.</p>
                  <p className="text-xs mt-1" style={{ color: '#8fa3b1' }}>Start chatting to see your patterns!</p>
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
                        transition={{ delay: 0.32 + i * 0.05 }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                            style={{ background: meta.accentBg, color: meta.accentText }}
                          >
                            {meta.emoji} {meta.label}
                          </span>
                          <span className="text-[11px] font-semibold" style={{ color: '#8fa3b1' }}>{pct}%</span>
                        </div>
                        <div
                          className="h-2 w-full rounded-full overflow-hidden"
                          style={{ background: 'rgba(0,0,0,0.06)' }}
                        >
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: meta.barColor }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.32 + i * 0.05 }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </section>

        {/* ── Recent timeline ── */}
        <section>
          <p
            className="text-[10px] font-semibold uppercase tracking-widest px-1 mb-3"
            style={{ color: '#8fa3b1' }}
          >
            Recent Messages
          </p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 280, damping: 26 }}
            className="rounded-3xl overflow-hidden"
            style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
          >
            <div
              className="h-0.5 w-full"
              style={{ background: 'linear-gradient(90deg, #d97706, #d9770688)' }}
            />
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(217,119,6,0.1)' }}
                >
                  <MessageCircle className="h-5 w-5" style={{ color: '#d97706' }} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#1a2b38' }}>Your Recent Shares</p>
                  <p className="text-[11px]" style={{ color: '#8fa3b1' }}>Latest conversations with MindBuddy</p>
                </div>
              </div>

              <div
                className="h-px w-full mb-4"
                style={{ background: 'linear-gradient(90deg, rgba(57,168,155,0.15), transparent)' }}
              />

              {timeline.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-3xl mb-2">🌱</p>
                  <p className="text-sm" style={{ color: '#8fa3b1' }}>No messages yet.</p>
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
                        transition={{ delay: 0.38 + i * 0.04 }}
                        className="flex items-start gap-3 rounded-2xl p-3"
                        style={{ background: 'rgba(57,168,155,0.04)' }}
                      >
                        {/* Pill + confidence */}
                        <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                            style={{ background: meta.accentBg, color: meta.accentText }}
                          >
                            {meta.emoji} {meta.label}
                          </span>
                          {confidence !== null && (
                            <span className="text-[10px]" style={{ color: '#8fa3b1' }}>
                              {Math.round(confidence * 100)}%
                            </span>
                          )}
                        </div>

                        {/* Divider */}
                        <div
                          className="w-px self-stretch flex-shrink-0"
                          style={{ background: 'rgba(57,168,155,0.2)' }}
                        />

                        {/* Message */}
                        <p
                          className="text-xs leading-relaxed flex-1 line-clamp-2"
                          style={{ color: '#5f7585' }}
                        >
                          {m.content}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </section>

        {/* ── Tip card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 280, damping: 26 }}
          className="rounded-3xl overflow-hidden"
          style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
        >
          <div
            className="h-0.5 w-full"
            style={{ background: 'linear-gradient(90deg, #39a89b, #39a89b88)' }}
          />
          <div className="p-4 flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(57,168,155,0.1)' }}
            >
              <Heart className="h-4 w-4" style={{ color: '#39a89b' }} strokeWidth={1.75} />
            </div>
            <p className="text-xs leading-relaxed pt-1" style={{ color: '#5f7585' }}>
              Self-awareness is powerful. By noticing your emotional patterns, you're building the foundation for real growth and resilience. Keep checking in with yourself — and know that MindBuddy is always here to listen and support you. 💚
            </p>
          </div>
        </motion.div>

      </main>
    </div>
  );
};

export default EmotionDashboard;