import { motion } from 'framer-motion';
import { ArrowLeft, Users, MessageCircle, TrendingUp, Leaf, GraduationCap, Brain, Moon, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { useCommunityStore } from '@/stores/communityStore';
import { toast } from 'sonner';
import type { LucideIcon } from 'lucide-react';

const groups: {
  id: string;
  name: string;
  members: number;
  desc: string;
  icon: LucideIcon;
  accent: string;
  accentBg: string;
}[] = [
  {
    id: 'anxiety',
    name: 'Anxiety Allies',
    members: 1284,
    desc: 'A safe space to share and cope with anxiety together.',
    icon: Leaf,
    accent: '#39a89b',
    accentBg: 'rgba(57,168,155,0.1)',
  },
  {
    id: 'students',
    name: 'Student Wellness',
    members: 892,
    desc: 'For students balancing studies and mental wellness.',
    icon: GraduationCap,
    accent: '#d97706',
    accentBg: 'rgba(251,191,36,0.12)',
  },
  {
    id: 'mindful',
    name: 'Mindful Living',
    members: 2156,
    desc: 'Daily mindfulness practice and meditation group.',
    icon: Brain,
    accent: '#7c6fa0',
    accentBg: 'rgba(124,111,160,0.1)',
  },
  {
    id: 'sleep',
    name: 'Better Sleep Circle',
    members: 643,
    desc: 'Tips and support for restful nights.',
    icon: Moon,
    accent: '#3b82f6',
    accentBg: 'rgba(59,130,246,0.1)',
  },
  {
    id: 'creative',
    name: 'Creative Healing',
    members: 421,
    desc: 'Express feelings through art, writing, and music.',
    icon: Palette,
    accent: '#e8735a',
    accentBg: 'rgba(232,115,90,0.1)',
  },
];

export default function Community() {
  const navigate = useNavigate();
  const { joinedCommunities, toggle } = useCommunityStore();
  const joinedCount = joinedCommunities.length;

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
              style={{
                background: 'linear-gradient(135deg, #39a89b, #6bab9e)',
                boxShadow: '0 2px 8px rgba(57,168,155,0.3)',
              }}
            >
              <Users className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: '#1a2b38' }}>Community</p>
              <p className="text-[11px] font-semibold" style={{ color: '#39a89b' }}>
                Connect with others on the same journey
              </p>
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
            You belong{'\n'}here.
          </h2>
          <p className="text-[14px] leading-relaxed" style={{ color: '#5f7585' }}>
            Find your people — every journey is worth sharing.
          </p>
        </motion.div>
      </motion.div>

      <main className="px-5 space-y-4 pb-6">

        {/* ── Joined stats banner ── */}
        {joinedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{ background: 'rgba(57,168,155,0.07)', border: '0.5px solid rgba(57,168,155,0.2)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(57,168,155,0.12)' }}
            >
              <TrendingUp className="h-5 w-5" style={{ color: '#39a89b' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#1a2b38' }}>
                You've joined {joinedCount} {joinedCount === 1 ? 'group' : 'groups'}
              </p>
              <p className="text-[11px]" style={{ color: '#8fa3b1' }}>Keep engaging with your communities</p>
            </div>
          </motion.div>
        )}

        {/* ── Group cards ── */}
        <section className="space-y-3">
          {groups.map((g, i) => {
            const joined = joinedCommunities.includes(g.id);
            const Icon = g.icon;

            return (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.07, type: 'spring', stiffness: 280, damping: 26 }}
                className="rounded-3xl overflow-hidden"
                style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
              >
                {/* Accent line */}
                <div
                  className="h-0.5 w-full"
                  style={{ background: `linear-gradient(90deg, ${g.accent}, ${g.accent}88)` }}
                />

                <div className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    {/* Icon badge */}
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: g.accentBg }}
                    >
                      <Icon className="w-5 h-5" style={{ color: g.accent }} strokeWidth={1.75} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <h3 className="font-bold text-sm" style={{ color: '#1a2b38' }}>{g.name}</h3>
                        {joined && (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(57,168,155,0.12)', color: '#39a89b' }}
                          >
                            Joined
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mb-1.5">
                        <Users className="h-3 w-3" style={{ color: '#8fa3b1' }} />
                        <p className="text-[11px]" style={{ color: '#8fa3b1' }}>
                          {g.members.toLocaleString()} members
                        </p>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: '#5f7585' }}>{g.desc}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        toggle('joinedCommunities', g.id);
                        toast.success(joined ? `Left ${g.name}` : `Joined ${g.name}!`);
                      }}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={
                        joined
                          ? {
                              background: 'white',
                              border: '1.5px solid rgba(57,168,155,0.25)',
                              color: '#39a89b',
                            }
                          : {
                              background: `linear-gradient(135deg, ${g.accent}, ${g.accent}cc)`,
                              boxShadow: `0 3px 10px ${g.accent}33`,
                              color: 'white',
                            }
                      }
                    >
                      {joined ? 'Leave Group' : 'Join Group'}
                    </motion.button>

                    {joined && (
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => toast.info('Group chat coming soon')}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold"
                        style={{
                          background: 'rgba(57,168,155,0.07)',
                          border: '1.5px solid rgba(57,168,155,0.2)',
                          color: '#39a89b',
                        }}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Chat
                      </motion.button>
                    )}
                  </div>
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