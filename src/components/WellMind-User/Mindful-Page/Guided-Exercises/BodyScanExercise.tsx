import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pause, Play, SkipForward, Leaf } from 'lucide-react';

interface BodyScanExerciseProps {
  onClose: () => void;
}

const ACCENT = '#39a89b';

const bodyParts = [
  { name: 'Feet',       instruction: 'Notice any tension in your feet. Wiggle your toes gently, then let them relax completely.', duration: 15 },
  { name: 'Legs',       instruction: 'Feel your calves and thighs. Notice any tightness. Breathe into that area and release.', duration: 15 },
  { name: 'Hips',       instruction: 'Bring awareness to your hips and lower back. Let gravity pull the tension away.', duration: 15 },
  { name: 'Stomach',    instruction: 'Notice your belly rising and falling with each breath. Release any tightness.', duration: 15 },
  { name: 'Chest',      instruction: 'Feel your chest expand and contract. Allow your heart to beat calmly.', duration: 15 },
  { name: 'Hands',      instruction: 'Notice your fingers and palms. Unclench any fists and let your hands rest.', duration: 15 },
  { name: 'Arms',       instruction: 'Feel the weight of your arms. Let them be heavy and completely relaxed.', duration: 15 },
  { name: 'Shoulders',  instruction: 'Drop your shoulders away from your ears. Release all the tension you hold here.', duration: 15 },
  { name: 'Neck',       instruction: 'Gently bring awareness to your neck. Let it be soft and relaxed.', duration: 15 },
  { name: 'Face',       instruction: 'Relax your jaw, soften your eyes, smooth your forehead. Let your whole face be peaceful.', duration: 15 },
  { name: 'Whole Body', instruction: 'Feel your entire body as one. Notice the peaceful stillness flowing through you.', duration: 20 },
];

// Which SVG parts highlight for each body part name
const HIGHLIGHT_MAP: Record<string, string[]> = {
  'Feet':       ['feet'],
  'Legs':       ['legs'],
  'Hips':       ['hips'],
  'Stomach':    ['stomach'],
  'Chest':      ['chest'],
  'Hands':      ['hands'],
  'Arms':       ['arms'],
  'Shoulders':  ['shoulders'],
  'Neck':       ['neck'],
  'Face':       ['face'],
  'Whole Body': ['feet','legs','hips','stomach','chest','hands','arms','shoulders','neck','face','whole'],
};

const fill = (part: string, active: string[]) =>
  active.includes(part) ? ACCENT : `${ACCENT}22`;

export const BodyScanExercise = ({ onClose }: BodyScanExerciseProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started || isPaused || isComplete) return;
    const duration = bodyParts[currentStep].duration;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 100 / (duration * 10);
        if (next >= 100) {
          if (currentStep < bodyParts.length - 1) {
            setCurrentStep((s) => s + 1);
            return 0;
          } else {
            setIsComplete(true);
            return 100;
          }
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [currentStep, isPaused, isComplete, started]);

  const handleSkip = () => {
    if (currentStep < bodyParts.length - 1) {
      setCurrentStep((s) => s + 1);
      setProgress(0);
    } else {
      setIsComplete(true);
    }
  };

  const currentPart = bodyParts[currentStep];
  const active = HIGHLIGHT_MAP[currentPart.name] ?? [];
  const isWhole = currentPart.name === 'Whole Body';

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
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: ACCENT }}>
            <Leaf className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>Body Scan</p>
            <p className="text-[13px] font-bold leading-tight" style={{ color: '#1a2b38' }}>Head to Toe Release</p>
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

      {/* ── Step progress dots ── */}
      <div className="flex justify-center gap-1.5 px-5 mb-4">
        {bodyParts.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === currentStep && started ? 16 : 6,
              background: isComplete || i < currentStep ? ACCENT : i === currentStep && started ? ACCENT : '#c8dbd7',
            }}
            transition={{ duration: 0.3 }}
            style={{ height: 6, borderRadius: 99 }}
          />
        ))}
      </div>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center w-full"
            >
              {/* Step label */}
              <div className="flex items-center gap-2 mb-5">
                <span
                  className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ background: `${ACCENT}18`, color: ACCENT }}
                >
                  {started ? `${currentStep + 1} of ${bodyParts.length}` : 'Ready'}
                </span>
              </div>

              {/* Body SVG */}
              <div className="relative" style={{ width: 160, height: 220 }}>
                {/* Whole-body glow */}
                {isWhole && started && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-3xl"
                    style={{ background: `radial-gradient(ellipse at center, ${ACCENT}40 0%, transparent 70%)` }}
                  />
                )}

                <svg width="160" height="220" viewBox="0 0 100 148" style={{ overflow: 'visible' }}>
                  {/* Face / head */}
                  <ellipse cx="50" cy="13" rx="13" ry="12"
                    fill={fill('face', active)}
                    style={{ transition: 'fill 0.5s ease' }} />
                  {/* Neck */}
                  <rect x="44" y="24" width="12" height="7" rx="2"
                    fill={fill('neck', active)}
                    style={{ transition: 'fill 0.5s ease' }} />
                  {/* Shoulders */}
                  <rect x="22" y="31" width="56" height="9" rx="4"
                    fill={fill('shoulders', active)}
                    style={{ transition: 'fill 0.5s ease' }} />
                  {/* Arms */}
                  <rect x="12" y="40" width="10" height="34" rx="4"
                    fill={fill('arms', active)}
                    style={{ transition: 'fill 0.5s ease' }} />
                  <rect x="78" y="40" width="10" height="34" rx="4"
                    fill={fill('arms', active)}
                    style={{ transition: 'fill 0.5s ease' }} />
                  {/* Chest */}
                  <rect x="30" y="40" width="40" height="18" rx="3"
                    fill={fill('chest', active)}
                    style={{ transition: 'fill 0.5s ease' }} />
                  {/* Stomach */}
                  <rect x="30" y="58" width="40" height="16" rx="3"
                    fill={fill('stomach', active)}
                    style={{ transition: 'fill 0.5s ease' }} />
                  {/* Hips */}
                  <rect x="28" y="74" width="44" height="12" rx="4"
                    fill={fill('hips', active)}
                    style={{ transition: 'fill 0.5s ease' }} />
                  {/* Hands */}
                  <ellipse cx="17" cy="80" rx="7" ry="8"
                    fill={fill('hands', active)}
                    style={{ transition: 'fill 0.5s ease' }} />
                  <ellipse cx="83" cy="80" rx="7" ry="8"
                    fill={fill('hands', active)}
                    style={{ transition: 'fill 0.5s ease' }} />
                  {/* Legs */}
                  <rect x="31" y="86" width="16" height="40" rx="5"
                    fill={fill('legs', active)}
                    style={{ transition: 'fill 0.5s ease' }} />
                  <rect x="53" y="86" width="16" height="40" rx="5"
                    fill={fill('legs', active)}
                    style={{ transition: 'fill 0.5s ease' }} />
                  {/* Feet */}
                  <ellipse cx="39" cy="132" rx="12" ry="7"
                    fill={fill('feet', active)}
                    style={{ transition: 'fill 0.5s ease' }} />
                  <ellipse cx="61" cy="132" rx="12" ry="7"
                    fill={fill('feet', active)}
                    style={{ transition: 'fill 0.5s ease' }} />
                </svg>
              </div>

              {/* Part name + instruction */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep + '-text'}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-center mt-5"
                >
                  <h2 className="text-xl font-bold mb-2" style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}>
                    {currentPart.name}
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: '#5f7585', maxWidth: 280 }}>
                    {started ? currentPart.instruction : 'Lie down or sit comfortably. Close your eyes and breathe gently.'}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Progress bar */}
              {started && (
                <div
                  className="mt-6 rounded-full overflow-hidden"
                  style={{ width: 240, height: 4, background: `${ACCENT}22` }}
                >
                  <motion.div
                    style={{ height: '100%', width: `${progress}%`, background: ACCENT, borderRadius: 99 }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              )}
            </motion.div>
          ) : (
            /* ── Complete ── */
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center px-4"
            >
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
                style={{ background: `${ACCENT}18` }}
              >
                <Leaf className="h-9 w-9" style={{ color: ACCENT }} />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}>
                Scan complete
              </h2>
              <p className="text-sm leading-relaxed mb-1" style={{ color: '#5f7585' }}>
                Your body is now relaxed and at peace.
              </p>
              <p className="text-xs font-semibold uppercase tracking-widest mb-8" style={{ color: ACCENT }}>
                {bodyParts.reduce((s, p) => s + p.duration, 0)}s of mindful release
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Controls ── */}
      <div className="px-6 pb-16 flex flex-col gap-3">
        {!started && !isComplete && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setStarted(true)}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-[15px] text-white"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc)`, boxShadow: `0 6px 24px ${ACCENT}55` }}
          >
            <Play className="h-5 w-5" />
            Begin Body Scan
          </motion.button>
        )}

        {started && !isComplete && (
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => setIsPaused((p) => !p)}
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(26,43,56,0.06)' }}
              aria-label={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused
                ? <Play className="h-5 w-5" style={{ color: '#5f7585' }} />
                : <Pause className="h-5 w-5" style={{ color: '#5f7585' }} />}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleSkip}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-[15px] text-white"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc)`, boxShadow: `0 6px 24px ${ACCENT}55` }}
            >
              <SkipForward className="h-5 w-5" />
              Next Area
            </motion.button>
          </div>
        )}

        {isComplete && (
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => { setCurrentStep(0); setProgress(0); setIsComplete(false); setStarted(false); }}
              className="flex items-center justify-center gap-2 flex-1 py-4 rounded-2xl font-bold text-[15px]"
              style={{ background: 'rgba(26,43,56,0.06)', color: '#1a2b38' }}
            >
              Again
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl font-bold text-[15px] text-white"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc)`, boxShadow: `0 6px 24px ${ACCENT}55` }}
            >
              Done
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BodyScanExercise;