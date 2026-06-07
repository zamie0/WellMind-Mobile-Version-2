import { motion } from 'framer-motion';
import { ArrowLeft, GraduationCap, Bookmark, Play, FileText, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { useCommunityStore } from '@/stores/communityStore';
import { toast } from 'sonner';

type ResourceType = 'article' | 'video' | 'audio';

const resources: {
  id: string;
  title: string;
  type: ResourceType;
  duration: string;
  desc: string;
  accent: string;
  accentBg: string;
}[] = [
  { id: 'anxiety-101',       title: 'Understanding Anxiety',        type: 'article', duration: '5 min read', desc: 'A beginner-friendly guide to anxiety and how it works.',             accent: '#7c6fa0', accentBg: 'rgba(124,111,160,0.1)' },
  { id: 'meditation-basics', title: 'Meditation for Beginners',     type: 'video',   duration: '12 min',     desc: 'Learn the foundations of a daily meditation practice.',              accent: '#39a89b', accentBg: 'rgba(57,168,155,0.1)'  },
  { id: 'sleep-podcast',     title: 'The Science of Sleep',         type: 'audio',   duration: '28 min',     desc: 'Why sleep matters and how to improve yours.',                        accent: '#3b82f6', accentBg: 'rgba(59,130,246,0.1)'  },
  { id: 'stress-guide',      title: 'Stress Management Toolkit',    type: 'article', duration: '8 min read', desc: 'Practical strategies to handle daily stressors.',                    accent: '#d97706', accentBg: 'rgba(251,191,36,0.12)' },
  { id: 'cbt-intro',         title: 'Intro to CBT Techniques',      type: 'video',   duration: '18 min',     desc: 'Cognitive behavioral techniques you can use today.',                 accent: '#39a89b', accentBg: 'rgba(57,168,155,0.1)'  },
  { id: 'mindful-eating',    title: 'Mindful Eating Practice',      type: 'audio',   duration: '15 min',     desc: 'Guided exercise for a more present relationship with food.',         accent: '#e8735a', accentBg: 'rgba(232,115,90,0.1)'  },
];

const iconFor = (t: ResourceType) => t === 'video' ? Play : t === 'audio' ? Headphones : FileText;
const actionLabel = (t: ResourceType) => t === 'article' ? 'Read' : t === 'video' ? 'Watch' : 'Listen';

const typeBadgeStyle = (t: ResourceType): React.CSSProperties => {
  switch (t) {
    case 'article': return { background: 'rgba(124,111,160,0.1)', color: '#7c6fa0' };
    case 'video':   return { background: 'rgba(57,168,155,0.1)',  color: '#39a89b' };
    case 'audio':   return { background: 'rgba(59,130,246,0.1)',  color: '#3b82f6' };
  }
};

export default function Resources() {
  const navigate = useNavigate();
  const { savedResources, toggle } = useCommunityStore();
  const savedCount = savedResources.length;

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
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: '#1a2b38' }}>Resources & Learning</p>
              <p className="text-[11px] font-semibold" style={{ color: '#39a89b' }}>Grow your mental wellness knowledge</p>
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
          <h2 className="text-[1.75rem] font-bold leading-tight mb-1.5" style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}>
            Learn &{'\n'}grow.
          </h2>
          <p className="text-[14px] leading-relaxed" style={{ color: '#5f7585' }}>
            Bite-sized tools to build lasting mental wellness.
          </p>
        </motion.div>
      </motion.div>

      <main className="px-5 space-y-4 pb-6">

        {/* ── Saved summary banner ── */}
        {savedCount > 0 && (
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
              <Bookmark className="h-5 w-5" style={{ color: '#39a89b' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#1a2b38' }}>
                {savedCount} saved {savedCount === 1 ? 'resource' : 'resources'}
              </p>
              <p className="text-[11px]" style={{ color: '#8fa3b1' }}>Ready for you to explore anytime</p>
            </div>
          </motion.div>
        )}

        {/* ── Resource cards ── */}
        <section className="space-y-3">
          {resources.map((r, i) => {
            const Icon = iconFor(r.type);
            const saved = savedResources.includes(r.id);

            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.07, type: 'spring', stiffness: 280, damping: 26 }}
                className="rounded-3xl overflow-hidden"
                style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
              >
                {/* Accent line */}
                <div
                  className="h-0.5 w-full"
                  style={{ background: `linear-gradient(90deg, ${r.accent}, ${r.accent}88)` }}
                />

                <div className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    {/* Icon badge */}
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: r.accentBg }}
                    >
                      <Icon className="h-5 w-5" style={{ color: r.accent }} strokeWidth={1.75} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <h3 className="font-bold text-sm leading-snug" style={{ color: '#1a2b38' }}>{r.title}</h3>
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 capitalize"
                          style={typeBadgeStyle(r.type)}
                        >
                          {r.type}
                        </span>
                      </div>
                      <p className="text-[11px] mb-1.5" style={{ color: '#8fa3b1' }}>{r.duration}</p>
                      <p className="text-xs leading-relaxed" style={{ color: '#5f7585' }}>{r.desc}</p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div
                    className="h-px w-full mb-3"
                    style={{ background: 'linear-gradient(90deg, rgba(57,168,155,0.15), transparent)' }}
                  />

                  {/* Actions */}
                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => toast.info(`Opening: ${r.title}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${r.accent}, ${r.accent}cc)`,
                        boxShadow: `0 3px 10px ${r.accent}33`,
                      }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {actionLabel(r.type)}
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        toggle('savedResources', r.id);
                        toast.success(saved ? 'Removed from saved' : 'Saved!');
                      }}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold"
                      style={
                        saved
                          ? {
                              background: 'rgba(57,168,155,0.1)',
                              color: '#39a89b',
                              border: '1.5px solid rgba(57,168,155,0.25)',
                            }
                          : {
                              background: 'white',
                              color: '#8fa3b1',
                              border: '1.5px solid rgba(143,163,177,0.25)',
                            }
                      }
                    >
                      <Bookmark className="h-3.5 w-3.5" style={{ fill: saved ? 'currentColor' : 'none' }} />
                      {saved ? 'Saved' : 'Save'}
                    </motion.button>
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