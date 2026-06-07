import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Hand, Ear, Wind, Smile, ChevronRight, Sun, Check } from 'lucide-react';

interface GroundingExerciseProps {
  onClose: () => void;
}

const steps = [
  {
    count: 5,
    sense: 'See',
    icon: Eye,
    instruction: 'Name 5 things you can see',
    hint: 'Look around — colors, shapes, objects near and far.',
    accent: '#39a89b',
    bg: '#e8f5f3',
  },
  {
    count: 4,
    sense: 'Touch',
    icon: Hand,
    instruction: 'Name 4 things you can touch',
    hint: 'Feel textures — your clothes, chair, skin, or the air.',
    accent: '#6bab9e',
    bg: '#edf7f5',
  },
  {
    count: 3,
    sense: 'Hear',
    icon: Ear,
    instruction: 'Name 3 things you can hear',
    hint: 'Listen for nearby sounds, distant sounds, or silence.',
    accent: '#f59e0b',
    bg: '#fef9ec',
  },
  {
    count: 2,
    sense: 'Smell',
    icon: Wind,
    instruction: 'Name 2 things you can smell',
    hint: 'Notice any scents in the air or on your skin.',
    accent: '#e8735a',
    bg: '#fdf0ec',
  },
  {
    count: 1,
    sense: 'Taste',
    icon: Smile,
    instruction: 'Name 1 thing you can taste',
    hint: 'Notice any flavour in your mouth right now.',
    accent: '#8fa3b1',
    bg: '#f0f4f7',
  },
];

export const GroundingExercise = ({ onClose }: GroundingExerciseProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>(new Array(5).fill(false));
  const [isFinished, setIsFinished] = useState(false);

  const handleNext = () => {
    const next = [...completed];
    next[currentStep] = true;
    setCompleted(next);
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    else setIsFinished(true);
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        background: isFinished
          ? 'linear-gradient(180deg, #e8f5f3 0%, #f4faf9 60%, #ffffff 100%)'
          : `linear-gradient(180deg, ${step.bg} 0%, #fafafa 60%, #ffffff 100%)`,
        transition: 'background 0.6s ease',
      }}
    >
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <div className="flex items-center gap-2.5">
          <motion.div
            animate={{ background: step.accent }}
            transition={{ duration: 0.4 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
          >
            <Sun className="h-4 w-4 text-white" />
          </motion.div>
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: step.accent, transition: 'color 0.4s' }}
            >
              Grounding
            </p>
            <p className="text-[13px] font-bold leading-tight" style={{ color: '#1a2b38' }}>
              5 · 4 · 3 · 2 · 1 Technique
            </p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(26,43,56,0.07)' }}
          aria-label="Close"
        >
          <X className="h-4 w-4" style={{ color: '#1a2b38' }} />
        </motion.button>
      </div>

      {/* ── Step indicator row ── */}
      <div className="flex justify-center gap-3 px-5 mb-8">
        {steps.map((s, i) => {
          const SIcon = s.icon;
          const isDone = completed[i];
          const isActive = i === currentStep && !isFinished;
          return (
            <motion.div
              key={i}
              animate={{
                scale: isActive ? 1.08 : 1,
                background: isDone ? s.accent : isActive ? s.accent : 'rgba(26,43,56,0.06)',
              }}
              transition={{ duration: 0.3 }}
              className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center gap-0.5"
            >
              {isDone ? (
                <Check className="h-5 w-5 text-white" />
              ) : (
                <>
                  <SIcon
                    className="h-4 w-4"
                    style={{ color: isActive ? 'white' : '#8fa3b1' }}
                  />
                  <span
                    className="text-[10px] font-bold leading-none"
                    style={{ color: isActive ? 'white' : '#8fa3b1' }}
                  >
                    {s.count}
                  </span>
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {!isFinished ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center w-full max-w-sm"
            >
              {/* Large icon orb */}
              <div className="relative flex items-center justify-center mb-8" style={{ width: 180, height: 180 }}>
                <motion.div
                  animate={{
                    scale: [1, 1.06, 1],
                    background: `radial-gradient(circle, ${step.accent}28 0%, transparent 70%)`,
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute rounded-full"
                  style={{ width: 170, height: 170 }}
                />
                <motion.div
                  animate={{ background: `${step.accent}18`, borderColor: `${step.accent}40` }}
                  transition={{ duration: 0.4 }}
                  className="absolute rounded-full border"
                  style={{ width: 130, height: 130 }}
                />
                <motion.div
                  animate={{ background: step.accent }}
                  transition={{ duration: 0.4 }}
                  className="w-24 h-24 rounded-3xl flex flex-col items-center justify-center gap-1"
                >
                  <Icon className="h-9 w-9 text-white" />
                  <motion.span
                    key={currentStep}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                    className="text-2xl font-bold text-white leading-none"
                  >
                    {step.count}
                  </motion.span>
                </motion.div>
              </div>

              {/* Sense label */}
              <motion.span
                animate={{ color: step.accent }}
                className="text-xs font-bold uppercase tracking-widest mb-2"
              >
                {step.sense}
              </motion.span>

              <h3 className="text-xl font-bold text-center mb-3" style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}>
                {step.instruction}
              </h3>
              <p className="text-sm text-center leading-relaxed mb-10" style={{ color: '#5f7585' }}>
                {step.hint}
              </p>

              {/* CTA */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleNext}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-[15px] text-white"
                style={{
                  background: `linear-gradient(135deg, ${step.accent}, ${step.accent}cc)`,
                  boxShadow: `0 6px 24px ${step.accent}44`,
                }}
              >
                Done — Next
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            </motion.div>
          ) : (
            /* ── Complete ── */
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center px-4"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.8, repeat: 2 }}
                className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
                style={{ background: 'rgba(57,168,155,0.15)' }}
              >
                <Check className="h-9 w-9" style={{ color: '#39a89b' }} />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}>
                You're grounded
              </h2>
              <p className="text-sm leading-relaxed mb-1" style={{ color: '#5f7585' }}>
                You've anchored yourself in the present moment.
              </p>
              <p className="text-xs font-semibold uppercase tracking-widest mb-10" style={{ color: '#39a89b' }}>
                Take a slow breath and notice how you feel
              </p>

              <div className="flex items-center gap-3 w-full">
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={() => { setCurrentStep(0); setCompleted(new Array(5).fill(false)); setIsFinished(false); }}
                  className="flex-1 py-4 rounded-2xl font-bold text-[15px]"
                  style={{ background: 'rgba(26,43,56,0.06)', color: '#1a2b38' }}
                >
                  Again
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl font-bold text-[15px] text-white"
                  style={{ background: 'linear-gradient(135deg, #39a89b, rgba(57,168,155,0.8))', boxShadow: '0 6px 24px rgba(57,168,155,0.4)' }}
                >
                  Done
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default GroundingExercise;