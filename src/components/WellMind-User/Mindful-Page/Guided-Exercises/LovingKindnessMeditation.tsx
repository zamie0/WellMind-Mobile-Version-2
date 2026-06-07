import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Play, Pause, SkipForward, Check,
  Heart, User, Users, Sprout, Globe, ChevronRight,
} from 'lucide-react';

interface LovingKindnessMeditationProps {
  onClose: () => void;
}

const stages = [
  {
    recipient: 'Yourself',
    icon: User,
    label: 'Self',
    hint: 'Begin by sending warmth to yourself. You deserve love and compassion too.',
    phrases: ['May I be happy', 'May I be healthy', 'May I be safe', 'May I live with ease'],
    accent: '#f472b6',
    bg: '#9d174d',
    duration: 30,
  },
  {
    recipient: 'A loved one',
    icon: Heart,
    label: 'Loved one',
    hint: 'Bring someone dear to mind. Let your warmth flow freely toward them.',
    phrases: ['May you be happy', 'May you be healthy', 'May you be safe', 'May you live with ease'],
    accent: '#fb923c',
    bg: '#9a3412',
    duration: 30,
  },
  {
    recipient: 'A neutral person',
    icon: Users,
    label: 'Neutral',
    hint: 'Think of someone neither close nor distant. They too seek happiness.',
    phrases: ['May you be happy', 'May you be healthy', 'May you be safe', 'May you live with ease'],
    accent: '#facc15',
    bg: '#92400e',
    duration: 30,
  },
  {
    recipient: 'A difficult person',
    icon: Sprout,
    label: 'Difficult',
    hint: 'Picture someone you find challenging. Kindness here is the deepest practice.',
    phrases: ['May you be happy', 'May you be healthy', 'May you be safe', 'May you live with ease'],
    accent: '#34d399',
    bg: '#065f46',
    duration: 30,
  },
  {
    recipient: 'All beings',
    icon: Globe,
    label: 'All beings',
    hint: 'Let your heart expand outward — to every living being, everywhere.',
    phrases: [
      'May all beings be happy',
      'May all beings be healthy',
      'May all beings be safe',
      'May all beings live with ease',
    ],
    accent: '#60a5fa',
    bg: '#1e3a8a',
    duration: 30,
  },
];

const PARTICLE_COUNT = 30;
const PARTICLE_COLORS = ['#f472b6', '#fb923c', '#facc15', '#34d399', '#60a5fa', '#c4b5fd'];
const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  id: i,
  color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
  size: 3 + Math.random() * 4,
  x: 10 + Math.random() * 80,
  y: Math.random() * 30,
  dur: 4 + Math.random() * 5,
  delay: Math.random() * 4,
}));

export const LovingKindnessMeditation = ({ onClose }: LovingKindnessMeditationProps) => {
  const [stageIdx, setStageIdx] = useState(0);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stage = stages[stageIdx];
  const Icon = stage.icon;
  const phraseDur = stage.duration / stage.phrases.length;

  const goNextPhrase = () => {
    clearInterval(timerRef.current!);
    if (phraseIdx < stage.phrases.length - 1) {
      setPhraseIdx((p) => p + 1);
      setProgress(0);
    } else if (stageIdx < stages.length - 1) {
      setStageIdx((s) => s + 1);
      setPhraseIdx(0);
      setProgress(0);
    } else {
      setIsComplete(true);
    }
  };

  useEffect(() => {
    if (isPaused || isComplete) return;
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 100 / (phraseDur * 10);
        if (next >= 100) {
          clearInterval(timerRef.current!);
          setTimeout(goNextPhrase, 200);
          return 100;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(timerRef.current!);
  }, [stageIdx, phraseIdx, isPaused, isComplete]);

  const handleRestart = () => {
    setStageIdx(0);
    setPhraseIdx(0);
    setProgress(0);
    setIsPaused(false);
    setIsComplete(false);
  };

  const phraseProgressPerStage = (100 / stage.phrases.length) * phraseIdx
    + (progress / 100) * (100 / stage.phrases.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1a0533 0%, #2d0a4e 45%, #1e1030 100%)' }}
    >
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              background: p.color,
              left: `${p.x}%`,
              bottom: `${p.y}%`,
            }}
            animate={{ opacity: [0, 0.6, 0], y: [0, -120], scale: [0.5, 1.2] }}
            transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3.5 relative z-10">
        <div className="flex items-center gap-2.5">
          <motion.div
            animate={{ background: stage.bg + '44' }}
            transition={{ duration: 0.4 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
          >
            <Heart className="h-4 w-4" style={{ color: stage.accent, transition: 'color 0.4s' }} />
          </motion.div>
          <div>
            <motion.p
              animate={{ color: stage.accent }}
              transition={{ duration: 0.4 }}
              className="text-[10px] font-bold uppercase tracking-widest"
            >
              Loving-kindness
            </motion.p>
            <p className="text-[13px] font-bold text-white leading-tight">Guided Meditation</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.08)' }}
          aria-label="Close"
        >
          <X className="h-4 w-4 text-white/70" />
        </motion.button>
      </div>

      {/* Stage dot indicators */}
      <div className="flex justify-center gap-2 px-5 relative z-10">
        {stages.map((s, i) => {
          const SIcon = s.icon;
          const isDone = i < stageIdx;
          const isActive = i === stageIdx && !isComplete;
          return (
            <motion.div
              key={i}
              animate={{
                scale: isActive ? 1.1 : 1,
                background: isDone ? s.bg + '99' : isActive ? s.bg : 'rgba(255,255,255,0.05)',
              }}
              transition={{ duration: 0.3 }}
              className="w-12 h-12 rounded-[14px] flex flex-col items-center justify-center gap-0.5"
            >
              {isDone ? (
                <Check className="h-4 w-4 text-white" />
              ) : (
                <>
                  <SIcon className="h-[14px] w-[14px]" style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.25)' }} />
                  <span className="text-[8px] font-bold uppercase tracking-wide leading-none"
                    style={{ color: isActive ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)' }}>
                    {s.label}
                  </span>
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Segmented progress bar */}
      <div className="flex gap-1 px-5 mt-3.5 relative z-10">
        {stages.map((s, i) => (
          <div key={i} className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: s.accent }}
              animate={{
                width: i < stageIdx
                  ? '100%'
                  : i === stageIdx
                  ? `${phraseProgressPerStage}%`
                  : '0%',
              }}
              transition={{ duration: 0.15, ease: 'linear' }}
            />
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key={stageIdx}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center w-full max-w-sm"
            >
              {/* Orb */}
              <div className="relative flex items-center justify-center mb-7" style={{ width: 200, height: 200 }}>
                <motion.div
                  animate={{ scale: [1, 1.09, 1], background: stage.accent + '1a' }}
                  transition={{ scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' }, background: { duration: 0.5 } }}
                  className="absolute rounded-full"
                  style={{ width: 185, height: 185 }}
                />
                <motion.div
                  animate={{ borderColor: stage.accent + '30' }}
                  transition={{ duration: 0.5 }}
                  className="absolute rounded-full border"
                  style={{ width: 142, height: 142 }}
                />
                <motion.div
                  animate={{ background: stage.bg, scale: [1, 1.05, 1] }}
                  transition={{ background: { duration: 0.5 }, scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
                  className="w-24 h-24 rounded-[28px] flex items-center justify-center"
                >
                  <Icon className="h-10 w-10 text-white" />
                </motion.div>
              </div>

              <motion.span
                animate={{ color: stage.accent }}
                className="text-[10px] font-bold uppercase tracking-widest mb-1.5"
              >
                {stage.label}
              </motion.span>

              <h3 className="text-xl font-bold text-center text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
                {stage.recipient}
              </h3>
              <p className="text-[12px] text-center leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 272 }}>
                {stage.hint}
              </p>

              {/* Phrase card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={phraseIdx}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.22 }}
                  className="w-full rounded-[18px] px-5 py-4 flex items-center justify-center gap-2.5 mb-4"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: `1px solid ${stage.accent}25`,
                    transition: 'border-color 0.4s',
                  }}
                >
                  <Heart className="h-[18px] w-[18px] flex-shrink-0" style={{ color: stage.accent }} />
                  <span className="text-[16px] font-bold text-white text-center" style={{ letterSpacing: '-0.01em' }}>
                    {stage.phrases[phraseIdx]}
                  </span>
                  <Heart className="h-[18px] w-[18px] flex-shrink-0" style={{ color: stage.accent }} />
                </motion.div>
              </AnimatePresence>

              {/* Phrase pips */}
              <div className="flex justify-center gap-1.5 mb-5">
                {stage.phrases.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      width: i === phraseIdx ? 22 : 6,
                      background: i <= phraseIdx ? stage.accent : 'rgba(255,255,255,0.15)',
                    }}
                    transition={{ duration: 0.3 }}
                    style={{ height: 6, borderRadius: 99 }}
                  />
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={goNextPhrase}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-[18px] font-bold text-[15px] text-white border-none"
                style={{
                  background: stage.bg,
                  boxShadow: `0 8px 28px ${stage.accent}25`,
                  transition: 'background 0.4s, box-shadow 0.4s',
                }}
              >
                Next phrase
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center px-4"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-[92px] h-[92px] rounded-[28px] flex items-center justify-center mb-6"
                style={{ background: 'rgba(244,114,182,0.15)' }}
              >
                <Heart className="h-11 w-11" style={{ color: '#f472b6' }} />
              </motion.div>

              <h2 className="text-[26px] font-bold text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
                Heart full of love
              </h2>
              <p className="text-[13px] leading-relaxed mb-1.5 max-w-[262px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                You've shared kindness with yourself and the world. Carry this warmth with you.
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-9" style={{ color: '#f472b6' }}>
                May all beings be happy
              </p>

              <div className="flex gap-3 w-full">
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={handleRestart}
                  className="flex-1 py-4 rounded-[18px] font-bold text-[15px] border-none"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.75)' }}
                >
                  Again
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={onClose}
                  className="flex-1 py-4 rounded-[18px] font-bold text-[15px] text-white border-none"
                  style={{ background: 'rgba(244,114,182,0.22)' }}
                >
                  Done
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      {!isComplete && (
        <div className="flex justify-center gap-3.5 px-6 pb-8 relative z-10">
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => setIsPaused((p) => !p)}
            className="w-[54px] h-[54px] rounded-full flex items-center justify-center border-none"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
            aria-label={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused
              ? <Play className="h-5 w-5 text-white/70" />
              : <Pause className="h-5 w-5 text-white/70" />}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={goNextPhrase}
            className="w-[54px] h-[54px] rounded-full flex items-center justify-center border-none"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
            aria-label="Skip"
          >
            <SkipForward className="h-5 w-5 text-white/70" />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

export default LovingKindnessMeditation;