import { motion } from 'framer-motion';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WeeklyPlan } from '@/components/WellMind-User/Home-Page/WeeklyPlan';
import { BottomNav } from '@/components/WellMind-User/BottomNav';

const WellnessPlan = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen pb-24"
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
          {/* Back */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" style={{ color: '#5f7585' }} />
          </motion.button>

          {/* Title */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #39a89b, #6bab9e)',
                boxShadow: '0 2px 8px rgba(57,168,155,0.3)',
              }}
            >
              <CalendarDays className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: '#1a2b38' }}>
                Wellness Plan
              </p>
              <p className="text-[11px] font-semibold" style={{ color: '#39a89b' }}>
                Your personalized 7-day journey
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
        {/* Decorative rings */}
        <div
          className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(57,168,155,0.13) 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute top-8 -left-12 w-48 h-48 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(107,171,158,0.08) 0%, transparent 70%)' }}
        />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
          <h2
            className="text-[1.75rem] font-bold leading-tight mb-1.5"
            style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}
          >
            Your week,{'\n'}planned with care.
          </h2>
          <p className="text-[14px] leading-relaxed" style={{ color: '#5f7585' }}>
            Small daily steps add up to lasting change.
          </p>
        </motion.div>
      </motion.div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <main className="px-5 pb-6">
        <WeeklyPlan />
      </main>

      <BottomNav />
    </div>
  );
};

export default WellnessPlan;