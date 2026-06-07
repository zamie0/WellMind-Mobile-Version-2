import { motion } from 'framer-motion';
import { ArrowLeft, UserPlus, Star, Briefcase, Flower, Waves, Leaf, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { useCommunityStore } from '@/stores/communityStore';
import { toast } from 'sonner';

const mentors: {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  bio: string;
  icon: React.ElementType;
  accent: string;
  accentBg: string;
}[] = [
  {
    id: 'sarah',
    name: 'Sarah Chen',
    specialty: 'Anxiety & Stress',
    experience: '8 years',
    rating: 4.9,
    bio: 'Licensed counselor passionate about helping young adults.',
    icon: Flower,
    accent: '#7c6fa0',
    accentBg: 'rgba(124,111,160,0.1)',
  },
  {
    id: 'marcus',
    name: 'Marcus Johnson',
    specialty: 'Career & Burnout',
    experience: '12 years',
    rating: 4.8,
    bio: 'Helps professionals find balance and meaning.',
    icon: Waves,
    accent: '#39a89b',
    accentBg: 'rgba(57,168,155,0.1)',
  },
  {
    id: 'aisha',
    name: 'Aisha Patel',
    specialty: 'Mindfulness Coach',
    experience: '6 years',
    rating: 5.0,
    bio: 'Guides you through meditation and mindful living.',
    icon: Leaf,
    accent: '#3b82f6',
    accentBg: 'rgba(59,130,246,0.1)',
  },
  {
    id: 'david',
    name: 'David Kim',
    specialty: 'Student Wellness',
    experience: '5 years',
    rating: 4.7,
    bio: 'Former teacher, now mentoring students through challenges.',
    icon: GraduationCap,
    accent: '#e8735a',
    accentBg: 'rgba(232,115,90,0.1)',
  },
];

export default function Mentorship() {
  const navigate = useNavigate();
  const { mentorRequests, toggle } = useCommunityStore();

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
              <UserPlus className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: '#1a2b38' }}>Mentorship</p>
              <p className="text-[11px] font-semibold" style={{ color: '#39a89b' }}>Get guidance from those who've been there</p>
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
            Connect &{'\n'}grow.
          </h2>
          <p className="text-[14px] leading-relaxed" style={{ color: '#5f7585' }}>
            Personalized guidance from experienced wellness mentors.
          </p>
        </motion.div>
      </motion.div>

      {/* ── Cards ───────────────────────────────────────────────── */}
      <main className="px-5 space-y-4 pb-6">
        <section className="space-y-3">
          {mentors.map((m, i) => {
            const requested = mentorRequests.includes(m.id);

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.07, type: 'spring', stiffness: 280, damping: 26 }}
                className="rounded-3xl overflow-hidden"
                style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
              >
                {/* Accent line */}
                <div
                  className="h-0.5 w-full"
                  style={{ background: `linear-gradient(90deg, ${m.accent}, ${m.accent}88)` }}
                />

                <div className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    {/* Icon badge */}
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: m.accentBg }}
                    >
                      <m.icon className="h-5 w-5" style={{ color: m.accent }} strokeWidth={1.75} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <h3 className="font-bold text-sm leading-snug" style={{ color: '#1a2b38' }}>{m.name}</h3>
                        {/* Rating badge */}
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1"
                          style={{ background: 'rgba(251,191,36,0.12)', color: '#d97706' }}
                        >
                          <Star className="h-2.5 w-2.5 fill-current" />
                          {m.rating}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold mb-1" style={{ color: '#39a89b' }}>{m.specialty}</p>
                      <p className="text-[11px] mb-1.5 flex items-center gap-1" style={{ color: '#8fa3b1' }}>
                        <Briefcase className="h-3 w-3" />
                        {m.experience} experience
                      </p>
                      <p className="text-xs leading-relaxed" style={{ color: '#5f7585' }}>{m.bio}</p>
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
                      onClick={() => toast.info(`Opening ${m.name}'s profile`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${m.accent}, ${m.accent}cc)`,
                        boxShadow: `0 3px 10px ${m.accent}33`,
                      }}
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      View Profile
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        toggle('mentorRequests', m.id);
                        toast.success(requested ? 'Request cancelled' : `Request sent to ${m.name}!`);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold"
                      style={
                        requested
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
                      <UserPlus className="h-3.5 w-3.5" />
                      {requested ? 'Pending ✓' : 'Request'}
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