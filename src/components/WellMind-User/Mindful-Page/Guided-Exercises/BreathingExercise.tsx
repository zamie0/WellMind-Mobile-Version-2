import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw, Wind } from 'lucide-react';

interface BreathingExerciseProps {
  onClose: () => void;
}

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale' | 'complete';

const INHALE_DURATION = 4;
const HOLD_DURATION = 4;
const EXHALE_DURATION = 6;
const TOTAL_ROUNDS = 3;

const ACCENT = '#39a89b';

export const BreathingExercise = ({ onClose }: BreathingExerciseProps) => {
  const [phase, setPhase] = useState<Phase>('idle');
  const [timer, setTimer] = useState(0);
  const [round, setRound] = useState(1);
  const [isActive, setIsActive] = useState(false);

  const getPhaseConfig = useCallback(() => {
    switch (phase) {
      case 'inhale':
        return { duration: INHALE_DURATION, next: 'hold' as Phase, text: 'Breathe In', sub: 'Slow and steady through your nose' };
      case 'hold':
        return { duration: HOLD_DURATION, next: 'exhale' as Phase, text: 'Hold', sub: 'Keep your breath still' };
      case 'exhale':
        return { duration: EXHALE_DURATION, next: 'inhale' as Phase, text: 'Breathe Out', sub: 'Release slowly through your mouth' };
      default:
        return { duration: 0, next: 'idle' as Phase, text: 'Ready', sub: '' };
    }
  }, [phase]);

  useEffect(() => {
    if (!isActive || phase === 'idle' || phase === 'complete') return;
    const config = getPhaseConfig();
    if (timer < config.duration) {
      const interval = setInterval(() => setTimer((t) => t + 1), 1000);
      return () => clearInterval(interval);
    } else {
      if (phase === 'exhale') {
        if (round >= TOTAL_ROUNDS) {
          setPhase('complete');
          setIsActive(false);
        } else {
          setRound((r) => r + 1);
          setPhase('inhale');
        }
      } else {
        setPhase(config.next);
      }
      setTimer(0);
    }
  }, [isActive, phase, timer, round, getPhaseConfig]);

  const startExercise = () => {
    setPhase('inhale');
    setTimer(0);
    setRound(1);
    setIsActive(true);
  };

  const togglePause = () => setIsActive((a) => !a);

  const reset = () => {
    setPhase('idle');
    setTimer(0);
    setRound(1);
    setIsActive(false);
  };

  const config = getPhaseConfig();
  const progress =
    phase !== 'idle' && phase !== 'complete' ? (timer / config.duration) * 100 : 0;

  const circleScale =
    phase === 'inhale'
      ? 1 + (timer / INHALE_DURATION) * 0.4
      : phase === 'exhale'
      ? 1.4 - (timer / EXHALE_DURATION) * 0.4
      : phase === 'hold'
      ? 1.4
      : 1;

  const circumference = 2 * Math.PI * 96; // r=96

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'linear-gradient(180deg, #e8f5f3 0%, #f4faf9 50%, #ffffff 100%)' }}
    >
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: ACCENT }}
          >
            <Wind className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>
              Breathing
            </p>
            <p className="text-[13px] font-bold leading-tight" style={{ color: '#1a2b38' }}>
              4 · 4 · 6 Technique
            </p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(26,43,56,0.07)' }}
        >
          <X className="h-4 w-4" style={{ color: '#1a2b38' }} />
        </motion.button>
      </div>

      {/* ── Round dots ── */}
      <div className="flex justify-center gap-2 mt-2 mb-6">
        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width: i + 1 === round && phase !== 'idle' && phase !== 'complete' ? 20 : 8,
              background:
                phase === 'complete' || i + 1 < round
                  ? ACCENT
                  : i + 1 === round && phase !== 'idle'
                  ? ACCENT
                  : '#c8dbd7',
            }}
            transition={{ duration: 0.3 }}
            className="h-2 rounded-full"
          />
        ))}
      </div>

      {/* ── Breathing orb ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
          {/* Soft glow rings */}
          <div
            className="absolute rounded-full"
            style={{
              width: 220,
              height: 220,
              background: `radial-gradient(circle, ${ACCENT}22 0%, transparent 70%)`,
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 160,
              height: 160,
              background: `radial-gradient(circle, ${ACCENT}18 0%, transparent 70%)`,
            }}
          />

          {/* SVG progress ring */}
          <svg className="absolute" width="220" height="220" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="110" cy="110" r="96" fill="none" stroke={`${ACCENT}25`} strokeWidth="6" />
            <motion.circle
              cx="110"
              cy="110"
              r="96"
              fill="none"
              stroke={ACCENT}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (progress / 100) * circumference}
              transition={{ duration: 0.4 }}
            />
          </svg>

          {/* Animated fill circle */}
          <motion.div
            animate={{ scale: circleScale }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute rounded-full"
            style={{ width: 120, height: 120, background: `${ACCENT}28` }}
          />
          <motion.div
            animate={{ scale: circleScale * 0.7 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute rounded-full"
            style={{ width: 120, height: 120, background: `${ACCENT}40` }}
          />

          {/* Center text */}
          <div className="relative z-10 flex flex-col items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                className="text-center"
              >
                {phase === 'complete' ? (
                  <span className="text-3xl font-bold" style={{ color: ACCENT }}>
                    ✦
                  </span>
                ) : (
                  <>
                    {phase !== 'idle' && (
                      <p
                        className="text-[42px] font-bold leading-none mb-1"
                        style={{ color: '#1a2b38' }}
                      >
                        {config.duration - timer}
                      </p>
                    )}
                    <p className="text-sm font-bold" style={{ color: ACCENT }}>
                      {config.text}
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Phase subtitle */}
        <AnimatePresence mode="wait">
          <motion.p
            key={phase + '-sub'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-center mt-6 leading-relaxed"
            style={{ color: '#5f7585', minHeight: 20 }}
          >
            {phase === 'complete'
              ? `You completed ${TOTAL_ROUNDS} rounds. Well done.`
              : phase === 'idle'
              ? 'Find a comfortable position and relax your shoulders.'
              : config.sub}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* ── Controls ── */}
      <div className="px-6 pb-16 flex flex-col items-center gap-3">
        {phase === 'idle' && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={startExercise}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-[15px] text-white"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc)`,
              boxShadow: `0 6px 24px ${ACCENT}55`,
            }}
          >
            <Play className="h-5 w-5" />
            Begin Exercise
          </motion.button>
        )}

        {phase !== 'idle' && phase !== 'complete' && (
          <div className="flex items-center gap-3 w-full">
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={reset}
              className="flex items-center justify-center w-14 h-14 rounded-2xl"
              style={{ background: 'rgba(26,43,56,0.06)' }}
            >
              <RotateCcw className="h-5 w-5" style={{ color: '#5f7585' }} />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={togglePause}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-[15px] text-white"
              style={{
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc)`,
                boxShadow: `0 6px 24px ${ACCENT}55`,
              }}
            >
              {isActive ? (
                <>
                  <Pause className="h-5 w-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Resume
                </>
              )}
            </motion.button>
          </div>
        )}

        {phase === 'complete' && (
          <div className="flex items-center gap-3 w-full">
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={reset}
              className="flex items-center justify-center gap-2 flex-1 py-4 rounded-2xl font-bold text-[15px]"
              style={{ background: 'rgba(26,43,56,0.06)', color: '#1a2b38' }}
            >
              <RotateCcw className="h-4 w-4" />
              Again
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl font-bold text-[15px] text-white"
              style={{
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc)`,
                boxShadow: `0 6px 24px ${ACCENT}55`,
              }}
            >
              Done
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};