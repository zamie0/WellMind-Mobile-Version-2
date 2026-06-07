import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Phone,
  Heart,
  Siren,
  Globe,
  Wind,
  PenLine,
  Footprints,
  Users,
  Anchor,
} from 'lucide-react';

interface CrisisSupportProps {
  onClose: () => void;
}

const crisisResources: {
  name: string;
  number: string;
  description: string;
  accent: string;
  accentBg: string;
}[] = [
  {
    name: 'Emergency Services (Malaysia)',
    number: '999',
    description: 'Immediate emergency assistance',
    accent: '#ef4444',
    accentBg: 'rgba(239,68,68,0.08)',
  },
  {
    name: 'Befrienders KL & Nationwide',
    number: '03-7627 2929',
    description: '24/7 emotional support and suicide prevention',
    accent: '#3b82f6',
    accentBg: 'rgba(59,130,246,0.1)',
  },
  {
    name: 'Befrienders Penang',
    number: '04-291 0100',
    description: 'Emotional support helpline (Penang)',
    accent: '#39a89b',
    accentBg: 'rgba(57,168,155,0.1)',
  },
  {
    name: 'Befrienders Johor Bahru',
    number: '07-762 7292',
    description: 'Support for Johor region',
    accent: '#7c6fa0',
    accentBg: 'rgba(124,111,160,0.1)',
  },
  {
    name: 'Talian Kasih',
    number: '15999',
    description: 'Social and mental health crisis support',
    accent: '#e8735a',
    accentBg: 'rgba(232,115,90,0.1)',
  },
];

const copingStrategies: {
  title: string;
  description: string;
  icon: React.ElementType;
  accent: string;
  accentBg: string;
}[] = [
  {
    title: 'Ground Yourself',
    description: 'Use the 5-4-3-2-1 technique: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.',
    icon: Anchor,
    accent: '#3b82f6',
    accentBg: 'rgba(59,130,246,0.1)',
  },
  {
    title: 'Breathe Deeply',
    description: 'Take slow, deep breaths. Inhale for 4 counts, hold for 4, exhale for 6. Repeat several times.',
    icon: Wind,
    accent: '#39a89b',
    accentBg: 'rgba(57,168,155,0.1)',
  },
  {
    title: 'Reach Out',
    description: "Call or text someone you trust. You don't have to go through this alone.",
    icon: Users,
    accent: '#7c6fa0',
    accentBg: 'rgba(124,111,160,0.1)',
  },
  {
    title: 'Move Your Body',
    description: 'Take a short walk, stretch, or do some light movement to release tension.',
    icon: Footprints,
    accent: '#d97706',
    accentBg: 'rgba(251,191,36,0.12)',
  },
  {
    title: 'Write It Down',
    description: 'Put your thoughts and feelings on paper. It can help process overwhelming emotions.',
    icon: PenLine,
    accent: '#e8735a',
    accentBg: 'rgba(232,115,90,0.1)',
  },
];

export const CrisisSupport = ({ onClose }: CrisisSupportProps) => {
  const handleCall = (number: string) => {
    const cleanNumber = number.replace(/[^0-9]/g, '');
    if (cleanNumber) window.open(`tel:${cleanNumber}`, '_self');
  };

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
            onClick={onClose}
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
              <Heart className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: '#1a2b38' }}>Crisis Support</p>
              <p className="text-[11px] font-semibold" style={{ color: '#39a89b' }}>
                You're not alone — help is available
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
            We're here{'\n'}with you.
          </h2>
          <p className="text-[14px] leading-relaxed" style={{ color: '#5f7585' }}>
            Reach out — support is just one call away.
          </p>
        </motion.div>
      </motion.div>

      <main className="px-5 space-y-4 pb-6">

        {/* ── Emergency banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, type: 'spring', stiffness: 280, damping: 26 }}
          className="rounded-3xl overflow-hidden"
          style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
        >
          <div
            className="h-0.5 w-full"
            style={{ background: 'linear-gradient(90deg, #ef4444, #ef444488)' }}
          />
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(239,68,68,0.08)' }}
              >
                <Siren className="h-5 w-5" style={{ color: '#ef4444' }} strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#1a2b38' }}>If you're in immediate danger</p>
                <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: '#8fa3b1' }}>
                  Call emergency services or go to the nearest hospital
                </p>
              </div>
            </div>

            <div
              className="h-px w-full mb-3"
              style={{ background: 'linear-gradient(90deg, rgba(239,68,68,0.15), transparent)' }}
            />

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => handleCall('999')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #ef4444, #ef4444cc)',
                boxShadow: '0 3px 10px rgba(239,68,68,0.33)',
              }}
            >
              <Phone className="h-4 w-4" />
              Call 999 — Emergency Services
            </motion.button>
          </div>
        </motion.div>

        {/* ── Crisis hotlines ── */}
        <section className="space-y-3">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest px-1"
            style={{ color: '#8fa3b1' }}
          >
            Crisis Hotlines
          </p>

          {crisisResources.map((resource, i) => (
            <motion.div
              key={resource.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, type: 'spring', stiffness: 280, damping: 26 }}
              className="rounded-3xl overflow-hidden"
              style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
            >
              <div
                className="h-0.5 w-full"
                style={{ background: `linear-gradient(90deg, ${resource.accent}, ${resource.accent}88)` }}
              />
              <div className="p-4">
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: resource.accentBg }}
                  >
                    <Phone className="h-5 w-5" style={{ color: resource.accent }} strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold leading-snug" style={{ color: '#1a2b38' }}>{resource.name}</p>
                    <p className="text-xs font-bold mt-0.5" style={{ color: resource.accent }}>{resource.number}</p>
                    <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: '#8fa3b1' }}>{resource.description}</p>
                  </div>
                </div>

                <div
                  className="h-px w-full mb-3"
                  style={{ background: 'linear-gradient(90deg, rgba(57,168,155,0.15), transparent)' }}
                />

                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleCall(resource.number)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${resource.accent}, ${resource.accent}cc)`,
                      boxShadow: `0 3px 10px ${resource.accent}33`,
                    }}
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Call Now
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* ── Coping strategies ── */}
        <section className="space-y-3">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest px-1"
            style={{ color: '#8fa3b1' }}
          >
            Coping Strategies
          </p>

          {copingStrategies.map((strategy, i) => {
            const Icon = strategy.icon;
            return (
              <motion.div
                key={strategy.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + i * 0.07, type: 'spring', stiffness: 280, damping: 26 }}
                className="rounded-3xl overflow-hidden"
                style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
              >
                <div
                  className="h-0.5 w-full"
                  style={{ background: `linear-gradient(90deg, ${strategy.accent}, ${strategy.accent}88)` }}
                />
                <div className="p-4 flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: strategy.accentBg }}
                  >
                    <Icon className="h-5 w-5" style={{ color: strategy.accent }} strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold leading-snug" style={{ color: '#1a2b38' }}>{strategy.title}</p>
                    <p className="text-[11px] mt-1 leading-relaxed" style={{ color: '#5f7585' }}>{strategy.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* ── Footer note ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, type: 'spring', stiffness: 280, damping: 26 }}
          className="rounded-3xl overflow-hidden"
          style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
        >
          <div
            className="h-0.5 w-full"
            style={{ background: 'linear-gradient(90deg, #39a89b, #6bab9e)' }}
          />
          <div className="p-4 flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(57,168,155,0.1)' }}
            >
              <Heart className="h-4 w-4" style={{ color: '#39a89b' }} strokeWidth={1.75} />
            </div>
            <p className="text-xs leading-relaxed pt-1" style={{ color: '#5f7585' }}>
              Remember — reaching out is a sign of strength, not weakness. You deserve support and care. 💚
            </p>
          </div>
        </motion.div>

      </main>
    </div>
  );
};

export default CrisisSupport;