import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Calendar, Users, Wind, Heart, Moon, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { useCommunityStore } from '@/stores/communityStore';
import { toast } from 'sonner';

const programs: {
  id: string;
  title: string;
  duration: string;
  participants: number;
  desc: string;
  reward: string;
  icon: React.ElementType;
  accent: string;
  accentBg: string;
}[] = [
  {
    id: '7day-calm',
    title: '7-Day Calm Challenge',
    duration: '7 days',
    participants: 1245,
    desc: 'Daily breathing & mindfulness for one week.',
    reward: '70 Calm Coins',
    icon: Wind,
    accent: '#3b82f6',
    accentBg: 'rgba(59,130,246,0.1)',
  },
  {
    id: '21-gratitude',
    title: '21 Days of Gratitude',
    duration: '21 days',
    participants: 893,
    desc: 'Build a gratitude habit that lasts.',
    reward: '210 Calm Coins',
    icon: Heart,
    accent: '#d97706',
    accentBg: 'rgba(251,191,36,0.12)',
  },
  {
    id: 'sleep-reset',
    title: 'Sleep Reset Program',
    duration: '14 days',
    participants: 567,
    desc: 'Reset your sleep cycle with guided practices.',
    reward: '140 Calm Coins',
    icon: Moon,
    accent: '#7c6fa0',
    accentBg: 'rgba(124,111,160,0.1)',
  },
  {
    id: 'mood-master',
    title: 'Mood Mastery',
    duration: '30 days',
    participants: 432,
    desc: 'Track and understand your emotional patterns.',
    reward: '300 Calm Coins',
    icon: Target,
    accent: '#e8735a',
    accentBg: 'rgba(232,115,90,0.1)',
  },
];

export default function Programs() {
  const navigate = useNavigate();
  const { enrolledPrograms, toggle } = useCommunityStore();
  const enrolledCount = enrolledPrograms.length;

  return (
    <div
      className="min-h-screen pb-28"
      style={{ background: 'linear-gradient(180deg, #f0f7f5 0%, #f7faf9 60%, #ffffff 100%)' }}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
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
              style={{ background: 'linear-gradient(135deg, #39a89b, #6bab9e)', boxShadow: '0 2px 8px rgba(57,168,155,0.3)' }}
            >
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: '#1a2b38' }}>Programs & Challenges</p>
              <p className="text-[11px] font-semibold" style={{ color: '#39a89b' }}>Build healthy habits together</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero banner ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden px-5 pt-8 pb-6"
      >
        <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(57,168,155,0.13) 0%, transparent 70%)' }} />
        <div className="pointer-events-none absolute top-8 -left-12 w-48 h-48 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(107,171,158,0.08) 0%, transparent 70%)' }} />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h2
            className="text-[1.75rem] font-bold leading-tight mb-1.5"
            style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}
          >
            Challenge &{'\n'}grow.
          </h2>
          <p className="text-[14px] leading-relaxed" style={{ color: '#5f7585' }}>
            Structured programs to build lasting mental wellness habits.
          </p>
        </motion.div>
      </motion.div>

      <main className="px-5 space-y-4 pb-6">

        {/* ── Enrolled summary banner ── */}
        {enrolledCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{ background: 'rgba(217,119,6,0.07)', border: '0.5px solid rgba(217,119,6,0.2)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(217,119,6,0.12)' }}
            >
              <Trophy className="h-5 w-5" style={{ color: '#d97706' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#1a2b38' }}>
                Active in {enrolledCount} {enrolledCount === 1 ? 'challenge' : 'challenges'}
              </p>
              <p className="text-[11px]" style={{ color: '#8fa3b1' }}>Keep going — you're building great habits!</p>
            </div>
          </motion.div>
        )}

        {/* ── Program cards ── */}
        <section className="space-y-3">
          {programs.map((p, i) => {
            const Icon = p.icon;
            const enrolled = enrolledPrograms.includes(p.id);

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.07, type: 'spring', stiffness: 280, damping: 26 }}
                className="rounded-3xl overflow-hidden"
                style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
              >
                {/* Accent line */}
                <div
                  className="h-0.5 w-full"
                  style={{ background: `linear-gradient(90deg, ${p.accent}, ${p.accent}88)` }}
                />

                <div className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    {/* Icon badge */}
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: p.accentBg }}
                    >
                      <Icon className="h-5 w-5" style={{ color: p.accent }} strokeWidth={1.75} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <h3 className="font-bold text-sm leading-snug" style={{ color: '#1a2b38' }}>{p.title}</h3>
                        {enrolled && (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: 'rgba(57,168,155,0.1)', color: '#39a89b' }}
                          >
                            Enrolled
                          </span>
                        )}
                      </div>

                      {/* Meta row */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="flex items-center gap-1 text-[11px]" style={{ color: '#8fa3b1' }}>
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          {p.duration}
                        </span>
                        <span className="flex items-center gap-1 text-[11px]" style={{ color: '#8fa3b1' }}>
                          <Users className="h-3 w-3 flex-shrink-0" />
                          {p.participants.toLocaleString()} joined
                        </span>
                      </div>

                      <p className="text-xs leading-relaxed mb-3" style={{ color: '#5f7585' }}>{p.desc}</p>

                      {/* Reward pill */}
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: p.accentBg, color: p.accent }}
                      >
                        🪙 {p.reward}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar (enrolled) */}
                  {enrolled && (
                    <div className="mb-4 space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span style={{ color: '#8fa3b1' }}>Your progress</span>
                        <span className="font-semibold" style={{ color: '#1a2b38' }}>Day 1</span>
                      </div>
                      {/* Custom progress bar */}
                      <div
                        className="w-full h-2 rounded-full overflow-hidden"
                        style={{ background: p.accentBg }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: '5%',
                            background: `linear-gradient(90deg, ${p.accent}, ${p.accent}cc)`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  <div
                    className="h-px w-full mb-3"
                    style={{ background: `linear-gradient(90deg, ${p.accent}26, transparent)` }}
                  />

                  {/* Action */}
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      toggle('enrolledPrograms', p.id);
                      toast.success(enrolled ? `Left ${p.title}` : `Enrolled in ${p.title}!`);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold"
                    style={
                      enrolled
                        ? {
                            background: 'rgba(57,168,155,0.1)',
                            color: '#39a89b',
                            border: '1.5px solid rgba(57,168,155,0.25)',
                          }
                        : {
                            background: `linear-gradient(135deg, ${p.accent}, ${p.accent}cc)`,
                            color: 'white',
                            boxShadow: `0 3px 10px ${p.accent}33`,
                          }
                    }
                  >
                    <Trophy className="h-3.5 w-3.5" />
                    {enrolled ? '✓ Enrolled — Leave Challenge' : 'Join Challenge'}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}