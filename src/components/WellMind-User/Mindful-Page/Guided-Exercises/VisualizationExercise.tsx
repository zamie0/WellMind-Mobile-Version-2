import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Play, Pause, SkipForward, Check,
  Sunrise, Umbrella, Waves, Sun, Wind, Feather, Sparkles, ChevronRight,
} from 'lucide-react';

interface VisualizationExerciseProps {
  onClose: () => void;
}

const scenes = [
  {
    title: 'Preparation',
    label: 'Settle',
    icon: Sunrise,
    hint: 'Close your eyes. Take three deep breaths. Let your body relax completely.',
    accent: '#a78bfa',
    bg: '#3b0764',
    rootBg: '#1a0a2e',
    duration: 15,
  },
  {
    title: 'A peaceful beach',
    label: 'Beach',
    icon: Umbrella,
    hint: 'Imagine yourself on a warm, sandy beach. Feel the soft sand beneath your feet.',
    accent: '#fbbf24',
    bg: '#78350f',
    rootBg: '#1c1500',
    duration: 20,
  },
  {
    title: 'Gentle waves',
    label: 'Waves',
    icon: Waves,
    hint: 'Watch crystal-clear waves rolling in and out. Hear their soothing rhythm.',
    accent: '#38bdf8',
    bg: '#075985',
    rootBg: '#061629',
    duration: 20,
  },
  {
    title: 'Warm sunlight',
    label: 'Sun',
    icon: Sun,
    hint: 'Feel warm sun on your skin. It fills you with golden, healing energy.',
    accent: '#fb923c',
    bg: '#7c2d12',
    rootBg: '#1e0c05',
    duration: 20,
  },
  {
    title: 'A gentle breeze',
    label: 'Breeze',
    icon: Wind,
    hint: 'A soft, cool breeze brushes your face. It carries away all your worries.',
    accent: '#6ee7b7',
    bg: '#064e3b',
    rootBg: '#031a13',
    duration: 20,
  },
  {
    title: 'Peace within',
    label: 'Peace',
    icon: Feather,
    hint: 'Feel a deep sense of peace washing over you. You are safe. You are calm.',
    accent: '#c4b5fd',
    bg: '#4c1d95',
    rootBg: '#160b30',
    duration: 20,
  },
  {
    title: 'Carrying peace',
    label: 'Return',
    icon: Sparkles,
    hint: 'Slowly bring awareness back. This peace stays with you always.',
    accent: '#f9a8d4',
    bg: '#881337',
    rootBg: '#1f0515',
    duration: 15,
  },
];

const FLOATER_COUNT = 18;
const floaters = Array.from({ length: FLOATER_COUNT }, (_, i) => ({
  id: i,
  size: 40 + Math.random() * 120,
  x: Math.random() * 100,
  y: Math.random() * 100,
  dur: 5 + Math.random() * 8,
  delay: Math.random() * 4,
  tx: (Math.random() - 0.5) * 60,
  ty: (Math.random() - 0.5) * 40,
  colorIdx: i % 2,
}));

export const VisualizationExercise = ({ onClose }: VisualizationExerciseProps) => {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scene = scenes[sceneIdx];
  const Icon = scene.icon;

  const goNext = () => {
    clearInterval(timerRef.current!);
    if (sceneIdx < scenes.length - 1) {
      setSceneIdx((s) => s + 1);
      setProgress(0);
    } else {
      setIsComplete(true);
    }
  };

  useEffect(() => {
    if (isPaused || isComplete) return;
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 100 / (scenes[sceneIdx].duration * 10);
        if (next >= 100) {
          clearInterval(timerRef.current!);
          setTimeout(goNext, 300);
          return 100;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(timerRef.current!);
  }, [sceneIdx, isPaused, isComplete]);

  const handleRestart = () => {
    setSceneIdx(0);
    setProgress(0);
    setIsPaused(false);
    setIsComplete(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: scene.rootBg, transition: 'background 1.2s ease' }}
    >
      {/* Ambient floaters */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floaters.map((f) => (
          <motion.div
            key={f.id}
            className="absolute rounded-full"
            style={{
              width: f.size,
              height: f.size,
              background: f.colorIdx === 0 ? scene.accent : '#ffffff',
              left: `${f.x}%`,
              top: `${f.y}%`,
              opacity: 0.18,
            }}
            animate={{
              x: [0, f.tx, 0],
              y: [0, f.ty, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: f.dur, repeat: Infinity, delay: f.delay, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3.5 relative z-10">
        <div className="flex items-center gap-2.5">
          <motion.div
            animate={{ background: scene.bg + '55' }}
            transition={{ duration: 0.6 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
          >
            <Icon className="h-4 w-4" style={{ color: scene.accent, transition: 'color 0.6s' }} />
          </motion.div>
          <div>
            <motion.p
              animate={{ color: scene.accent }}
              transition={{ duration: 0.6 }}
              className="text-[10px] font-bold uppercase tracking-widest"
            >
              Visualisation
            </motion.p>
            <p className="text-[13px] font-bold text-white leading-tight">Peaceful Journey</p>
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
      <div className="flex gap-1 px-5 relative z-10">
        {scenes.map((s, i) => (
          <div key={i} className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: s.accent }}
              animate={{
                width: i < sceneIdx ? '100%' : i === sceneIdx ? `${progress}%` : '0%',
              }}
              transition={{ duration: 0.12, ease: 'linear' }}
            />
          </div>
        ))}
      </div>

      {/* Scene dot indicators */}
      <div className="flex justify-center gap-2 px-5 mt-4 relative z-10">
        {scenes.map((s, i) => {
          const SIcon = s.icon;
          const isDone = i < sceneIdx;
          const isActive = i === sceneIdx && !isComplete;
          return (
            <motion.div
              key={i}
              animate={{
                scale: isActive ? 1.1 : 1,
                background: isDone ? s.bg + '99' : isActive ? s.bg : 'rgba(255,255,255,0.05)',
              }}
              transition={{ duration: 0.3 }}
              className="w-10 h-10 rounded-[12px] flex flex-col items-center justify-center gap-0.5"
            >
              {isDone ? (
                <Check className="h-3.5 w-3.5 text-white" />
              ) : (
                <>
                  <SIcon className="h-3.5 w-3.5" style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.25)' }} />
                  <span
                    className="text-[7px] font-bold uppercase tracking-wide leading-none"
                    style={{ color: isActive ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.2)' }}
                  >
                    {s.label}
                  </span>
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key={sceneIdx}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center w-full max-w-sm"
            >
              {/* Orb */}
              <div className="relative flex items-center justify-center mb-7" style={{ width: 200, height: 200 }}>
                <motion.div
                  animate={{ scale: [1, 1.1, 1], background: scene.accent + '1c' }}
                  transition={{ scale: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }, background: { duration: 0.7 } }}
                  className="absolute rounded-full"
                  style={{ width: 185, height: 185 }}
                />
                <motion.div
                  animate={{ borderColor: scene.accent + '2e' }}
                  transition={{ duration: 0.7 }}
                  className="absolute rounded-full border"
                  style={{ width: 142, height: 142 }}
                />
                <motion.div
                  animate={{ background: scene.bg, y: [0, -8, 0], rotate: [0, 2, -2, 0] }}
                  transition={{
                    background: { duration: 0.7 },
                    y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                    rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  className="w-24 h-24 rounded-[28px] flex items-center justify-center"
                >
                  <Icon className="h-10 w-10 text-white" />
                </motion.div>
              </div>

              <motion.span
                animate={{ color: scene.accent }}
                transition={{ duration: 0.6 }}
                className="text-[10px] font-bold uppercase tracking-widest mb-1.5"
              >
                {scene.label}
              </motion.span>

              <h3
                className="text-[22px] font-bold text-center text-white mb-2.5"
                style={{ letterSpacing: '-0.02em', lineHeight: 1.25 }}
              >
                {scene.title}
              </h3>
              <p
                className="text-[13px] text-center leading-relaxed mb-8"
                style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 276, fontStyle: 'italic' }}
              >
                {scene.hint}
              </p>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={goNext}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-[18px] font-bold text-[15px] text-white border-none"
                style={{
                  background: scene.bg,
                  boxShadow: `0 8px 28px ${scene.accent}22`,
                  transition: 'background 0.6s, box-shadow 0.6s',
                }}
              >
                Continue
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
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-[92px] h-[92px] rounded-[28px] flex items-center justify-center mb-6"
                style={{ background: scenes[scenes.length - 1].bg + '88' }}
              >
                <Sparkles className="h-11 w-11" style={{ color: scenes[scenes.length - 1].accent }} />
              </motion.div>

              <h2 className="text-[26px] font-bold text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
                Journey complete
              </h2>
              <p className="text-[13px] leading-relaxed mb-1.5 max-w-[262px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                You've returned from your peaceful place, refreshed and calm.
              </p>
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-9"
                style={{ color: scenes[scenes.length - 1].accent }}
              >
                This peace stays with you always
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
                  style={{ background: scenes[scenes.length - 1].bg }}
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
            className="w-[54px] h-[54px] rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
            aria-label={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="h-5 w-5 text-white/70" /> : <Pause className="h-5 w-5 text-white/70" />}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={goNext}
            className="w-[54px] h-[54px] rounded-full flex items-center justify-center"
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

export default VisualizationExercise;