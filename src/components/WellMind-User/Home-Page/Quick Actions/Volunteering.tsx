import { motion } from 'framer-motion';
import { ArrowLeft, HandHeart, MapPin, Clock, Building2, Headphones, Users, PenTool, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { useCommunityStore } from '@/stores/communityStore';
import { toast } from 'sonner';

type OpportunityId = 'listener' | 'workshop' | 'content' | 'outreach';

const opportunities: {
  id: OpportunityId;
  title: string;
  org: string;
  location: string;
  hours: string;
  desc: string;
  icon: React.ElementType;
  accent: string;
  accentBg: string;
}[] = [
  {
    id: 'listener',
    title: 'Counselor Listener',
    org: 'WellMind Foundation',
    location: 'Remote',
    hours: '2 hrs/week',
    desc: 'Provide a compassionate ear for those who need to talk.',
    icon: Headphones,
    accent: '#e8735a',
    accentBg: 'rgba(232,115,90,0.1)',
  },
  {
    id: 'workshop',
    title: 'Workshop Facilitator',
    org: 'Campus Wellness',
    location: 'Hybrid',
    hours: '4 hrs/month',
    desc: 'Help run mindfulness sessions for students.',
    icon: Users,
    accent: '#39a89b',
    accentBg: 'rgba(57,168,155,0.1)',
  },
  {
    id: 'content',
    title: 'Content Creator',
    org: 'Mind Matters',
    location: 'Remote',
    hours: 'Flexible',
    desc: 'Write articles and stories about mental wellness.',
    icon: PenTool,
    accent: '#7c6fa0',
    accentBg: 'rgba(124,111,160,0.1)',
  },
  {
    id: 'outreach',
    title: 'Community Outreach',
    org: 'Hope Network',
    location: 'Local',
    hours: '3 hrs/week',
    desc: 'Connect with underserved communities in your area.',
    icon: Globe,
    accent: '#d97706',
    accentBg: 'rgba(251,191,36,0.12)',
  },
];

export default function Volunteering() {
  const navigate = useNavigate();
  const { volunteerSignups, toggle } = useCommunityStore();
  const signedCount = volunteerSignups.length;

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
              <HandHeart className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: '#1a2b38' }}>Volunteering</p>
              <p className="text-[11px] font-semibold" style={{ color: '#39a89b' }}>Give back to your community</p>
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
            Give &{'\n'}grow.
          </h2>
          <p className="text-[14px] leading-relaxed" style={{ color: '#5f7585' }}>
            Make a difference in mental wellness, one hour at a time.
          </p>
        </motion.div>
      </motion.div>

      <main className="px-5 space-y-4 pb-6">

        {/* ── Signed-up summary banner ── */}
        {signedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{ background: 'rgba(232,115,90,0.07)', border: '0.5px solid rgba(232,115,90,0.2)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(232,115,90,0.12)' }}
            >
              <HandHeart className="h-5 w-5" style={{ color: '#e8735a' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#1a2b38' }}>
                Signed up for {signedCount} {signedCount === 1 ? 'opportunity' : 'opportunities'}
              </p>
              <p className="text-[11px]" style={{ color: '#8fa3b1' }}>Thank you for giving back 💚</p>
            </div>
          </motion.div>
        )}

        {/* ── Opportunity cards ── */}
        <section className="space-y-3">
          {opportunities.map((o, i) => {
            const Icon = o.icon;
            const signed = volunteerSignups.includes(o.id);

            return (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.07, type: 'spring', stiffness: 280, damping: 26 }}
                className="rounded-3xl overflow-hidden"
                style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
              >
                {/* Accent line */}
                <div
                  className="h-0.5 w-full"
                  style={{ background: `linear-gradient(90deg, ${o.accent}, ${o.accent}88)` }}
                />

                <div className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    {/* Icon badge */}
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: o.accentBg }}
                    >
                      <Icon className="h-5 w-5" style={{ color: o.accent }} strokeWidth={1.75} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <h3 className="font-bold text-sm leading-snug" style={{ color: '#1a2b38' }}>{o.title}</h3>
                        {signed && (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: 'rgba(57,168,155,0.1)', color: '#39a89b' }}
                          >
                            Signed Up
                          </span>
                        )}
                      </div>

                      {/* Org */}
                      <p className="flex items-center gap-1 text-[11px] mb-2" style={{ color: '#8fa3b1' }}>
                        <Building2 className="h-3 w-3 flex-shrink-0" />
                        {o.org}
                      </p>

                      <p className="text-xs leading-relaxed mb-3" style={{ color: '#5f7585' }}>{o.desc}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                          style={{ background: o.accentBg, color: o.accent }}
                        >
                          <MapPin className="h-2.5 w-2.5" />
                          {o.location}
                        </span>
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                          style={{ background: 'rgba(143,163,177,0.1)', color: '#8fa3b1' }}
                        >
                          <Clock className="h-2.5 w-2.5" />
                          {o.hours}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div
                    className="h-px w-full mb-3"
                    style={{ background: `linear-gradient(90deg, ${o.accent}26, transparent)` }}
                  />

                  {/* Action */}
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      toggle('volunteerSignups', o.id);
                      toast.success(signed ? `Withdrew from ${o.title}` : `Signed up for ${o.title}!`);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold"
                    style={
                      signed
                        ? {
                            background: 'rgba(57,168,155,0.1)',
                            color: '#39a89b',
                            border: '1.5px solid rgba(57,168,155,0.25)',
                          }
                        : {
                            background: `linear-gradient(135deg, ${o.accent}, ${o.accent}cc)`,
                            color: 'white',
                            boxShadow: `0 3px 10px ${o.accent}33`,
                          }
                    }
                  >
                    <HandHeart className="h-3.5 w-3.5" />
                    {signed ? '✓ Signed Up — Withdraw' : 'Sign Up to Volunteer'}
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