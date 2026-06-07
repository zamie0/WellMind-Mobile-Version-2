import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Moon, Pause, Play, SkipForward, Check,
  Wind, Cloud, Mountain, ChevronRight, MoonStar,
} from 'lucide-react';

interface SleepMeditationProps {
  onClose: () => void;
}

const steps = [
  {
    title: 'Get Comfortable',
    hint: 'Lie down in a comfortable position. Close your eyes gently and relax.',
    label: 'Settle',
    accent: '#a78bfa',
    bg: '#6d28d9',
    icon: Moon,
    duration: 10,
  },
  {
    title: 'Deep Breath',
    hint: 'Breathe in slowly through your nose… exhale fully through your mouth.',
    label: 'Breathe',
    accent: '#67e8f9',
    bg: '#0e7490',
    icon: Wind,
    duration: 15,
  },
  {
    title: 'Release Tension',
    hint: 'Let your shoulders drop. Feel your body softening into the bed.',
    label: 'Release',
    accent: '#86efac',
    bg: '#15803d',
    icon: Wind,
    duration: 15,
  },
  {
    title: 'Calm Your Mind',
    hint: 'Let any thoughts drift away gently, like passing clouds.',
    label: 'Calm',
    accent: '#fcd34d',
    bg: '#b45309',
    icon: Cloud,
    duration: 15,
  },
  {
    title: 'Body Scan',
    hint: 'From your toes upward — feel each part growing heavy and still.',
    label: 'Scan',
    accent: '#f9a8d4',
    bg: '#be185d',
    icon: Moon,
    duration: 20,
  },
  {
    title: 'Peaceful Place',
    hint: 'Imagine a calm, quiet place — a beach, a forest, wherever feels safe.',
    label: 'Visualise',
    accent: '#6ee7b7',
    bg: '#065f46',
    icon: Mountain,
    duration: 20,
  },
  {
    title: 'Gentle Waves',
    hint: 'Feel waves of warmth and calm wash over you with every breath.',
    label: 'Flow',
    accent: '#93c5fd',
    bg: '#1d4ed8',
    icon: Wind,
    duration: 20,
  },
  {
    title: 'Drift Away',
    hint: 'Allow yourself to gently drift into deep, peaceful sleep…',
    label: 'Sleep',
    accent: '#c4b5fd',
    bg: '#4c1d95',
    icon: MoonStar,
    duration: 30,
  },
];

const STAR_COUNT = 55;
const stars = Array.from({ length: STAR_COUNT }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() < 0.3 ? 2 : 1,
  dur: 2 + Math.random() * 3,
  delay: Math.random() * 2,
}));

export const SleepMeditation = ({ onClose }: SleepMeditationProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = steps[currentStep];
  const Icon = step.icon;

  const goNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
      setProgress(0);
    } else {
      setIsComplete(true);
    }
  };

  useEffect(() => {
    if (isPaused || isComplete) return;
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 100 / steps[currentStep].duration;
        if (next >= 100) {
          clearInterval(timerRef.current!);
          setTimeout(goNext, 300);
          return 100;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [currentStep, isPaused, isComplete]);

  const handleRestart = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsComplete(false);
    setIsPaused(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0f0c29 0%, #1a1040 50%, #24243e 100%)' }}
    >
      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {stars.map((s) => (
          <motion.div
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
            animate={{ opacity: [0.15, 0.7, 0.15], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: s.dur, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <motion.div
            animate={{ background: step.bg + '55' }}
            transition={{ duration: 0.4 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
          >
            <MoonStar className="h-4 w-4" style={{ color: step.accent, transition: 'color 0.4s' }} />
          </motion.div>
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: step.accent, transition: 'color 0.4s' }}
            >
              Sleep
            </p>
            <p className="text-[13px] font-bold leading-tight text-white">Guided Meditation</p>
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

      {/* Segmented progress bar */}
      <div className="flex gap-1.5 px-5 relative z-10">
        {steps.map((s, i) => (
          <div key={i} className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: s.accent }}
              animate={{
                width: i < currentStep ? '100%' : i === currentStep ? `${progress}%` : '0%',
              }}
              transition={{ duration: 0.9, ease: 'linear' }}
            />
          </div>
        ))}
      </div>

      {/* Step dot indicators */}
      <div className="flex justify-center gap-2.5 px-5 mt-5 relative z-10">
        {steps.map((s, i) => {
          const SIcon = s.icon;
          const isDone = i < currentStep;
          const isActive = i === currentStep && !isComplete;
          return (
            <motion.div
              key={i}
              animate={{
                scale: isActive ? 1.1 : 1,
                background: isDone ? s.bg + 'bb' : isActive ? s.bg : 'rgba(255,255,255,0.06)',
              }}
              transition={{ duration: 0.3 }}
              className="w-11 h-11 rounded-[14px] flex flex-col items-center justify-center gap-0.5"
            >
              {isDone ? (
                <Check className="h-4 w-4 text-white" />
              ) : (
                <>
                  <SIcon
                    className="h-3.5 w-3.5"
                    style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.3)' }}
                  />
                  <span
                    className="text-[9px] font-bold leading-none"
                    style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.3)' }}
                  >
                    {i + 1}
                  </span>
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center w-full max-w-sm"
            >
              {/* Orb */}
              <div className="relative flex items-center justify-center mb-8" style={{ width: 200, height: 200 }}>
                <motion.div
                  animate={{
                    scale: [1, 1.07, 1],
                    background: `radial-gradient(circle, ${step.accent}20 0%, transparent 70%)`,
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute rounded-full"
                  style={{ width: 190, height: 190 }}
                />
                <motion.div
                  animate={{ borderColor: step.accent + '33' }}
                  transition={{ duration: 0.4 }}
                  className="absolute rounded-full border"
                  style={{ width: 145, height: 145, transition: 'border-color 0.4s' }}
                />
                <motion.div
                  animate={{ background: step.bg }}
                  transition={{ duration: 0.4 }}
                  className="w-24 h-24 rounded-[28px] flex flex-col items-center justify-center gap-1"
                  style={{ animation: 'pulseSoft 3s ease-in-out infinite' }}
                >
                  <Icon className="h-9 w-9 text-white" />
                  <motion.span
                    key={currentStep}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                    className="text-xl font-bold text-white leading-none"
                  >
                    {steps.length - currentStep}
                  </motion.span>
                </motion.div>
              </div>

              <motion.span
                animate={{ color: step.accent }}
                className="text-[10px] font-bold uppercase tracking-widest mb-2"
              >
                {step.label}
              </motion.span>

              <h3 className="text-xl font-bold text-center text-white mb-3" style={{ letterSpacing: '-0.02em' }}>
                {step.title}
              </h3>
              <p className="text-[13px] text-center leading-relaxed mb-9" style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 280 }}>
                {step.hint}
              </p>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={goNext}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-[18px] font-bold text-[15px] text-white"
                style={{
                  background: step.bg,
                  boxShadow: `0 8px 28px ${step.accent}30`,
                  transition: 'background 0.4s, box-shadow 0.4s',
                }}
              >
                Got it — continue
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
                className="w-[90px] h-[90px] rounded-[28px] flex items-center justify-center mb-6"
                style={{ background: 'rgba(196,163,255,0.15)' }}
              >
                <MoonStar className="h-10 w-10" style={{ color: '#c4b5fd' }} />
              </motion.div>

              <h2 className="text-[26px] font-bold text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
                Sweet dreams
              </h2>
              <p className="text-[13px] leading-relaxed mb-1.5 max-w-[260px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                You've anchored yourself in stillness. Rest now.
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-9" style={{ color: '#c4b5fd' }}>
                Take a slow breath and let go
              </p>

              <div className="flex gap-3 w-full">
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={handleRestart}
                  className="flex-1 py-4 rounded-[18px] font-bold text-[15px]"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.8)' }}
                >
                  Again
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={onClose}
                  className="flex-1 py-4 rounded-[18px] font-bold text-[15px] text-white"
                  style={{ background: 'rgba(196,163,255,0.25)' }}
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
        <div className="flex justify-center gap-4 px-6 pb-10 relative z-10">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsPaused((p) => !p)}
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
            aria-label={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused
              ? <Play className="h-6 w-6 text-white/75" />
              : <Pause className="h-6 w-6 text-white/75" />}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={goNext}
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
            aria-label="Skip"
          >
            <SkipForward className="h-6 w-6 text-white/75" />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

export default SleepMeditation;