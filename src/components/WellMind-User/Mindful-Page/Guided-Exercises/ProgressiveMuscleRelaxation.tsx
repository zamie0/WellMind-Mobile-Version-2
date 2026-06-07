import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, SkipForward, Waves, Zap, Leaf, RotateCcw } from 'lucide-react';

interface ProgressiveMuscleRelaxationProps {
  onClose: () => void;
}

const ACCENT       = '#39a89b';   // teal  — release
const TENSE_COLOR  = '#e8735a';   // coral — tense

const muscleGroups = [
  { name: 'Hands',     tense: 'Make tight fists with both hands. Squeeze hard.',                   release: 'Open your hands. Feel the tension melt away.',          duration: 12 },
  { name: 'Forearms',  tense: 'Bend your wrists back, stretching your forearms.',                  release: 'Release and let your arms go limp.',                    duration: 12 },
  { name: 'Biceps',    tense: 'Flex your biceps — curl your fists toward your shoulders.',         release: 'Let go. Feel the heaviness in your arms.',              duration: 12 },
  { name: 'Shoulders', tense: 'Raise your shoulders up to your ears. Hold tight.',                 release: 'Drop them down. Feel the relief.',                      duration: 12 },
  { name: 'Forehead',  tense: 'Raise your eyebrows as high as you can.',                           release: 'Smooth your forehead out. Let it be calm.',             duration: 12 },
  { name: 'Eyes',      tense: 'Squeeze your eyes shut as tight as possible.',                      release: 'Relax. Keep them gently closed.',                       duration: 12 },
  { name: 'Jaw',       tense: 'Clench your jaw. Press your teeth together firmly.',                release: 'Let your jaw hang loose. Mouth slightly open.',         duration: 12 },
  { name: 'Chest',     tense: 'Take a deep breath and hold it. Feel your chest expand.',           release: 'Exhale slowly. Let your chest relax.',                  duration: 12 },
  { name: 'Stomach',   tense: 'Tighten your stomach muscles. Make them hard as a board.',          release: 'Release. Let your belly be soft and still.',            duration: 12 },
  { name: 'Thighs',    tense: 'Press your thighs together and squeeze.',                           release: 'Let them fall apart. Feel the relief.',                 duration: 12 },
  { name: 'Calves',    tense: 'Point your toes down, flexing your calves hard.',                   release: 'Relax. Let your feet go loose.',                        duration: 12 },
  { name: 'Feet',      tense: "Curl your toes tightly, like you're gripping sand.",                release: 'Spread them wide and completely relax.',                duration: 12 },
];

export const ProgressiveMuscleRelaxation = ({ onClose }: ProgressiveMuscleRelaxationProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [phase, setPhase] = useState<'tense' | 'release'>('tense');
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started || isPaused || isComplete) return;
    const halfDuration = muscleGroups[currentStep].duration / 2;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 100 / (halfDuration * 10);
        if (next >= 100) {
          if (phase === 'tense') {
            setPhase('release');
            return 0;
          } else {
            if (currentStep < muscleGroups.length - 1) {
              setCurrentStep((s) => s + 1);
              setPhase('tense');
              return 0;
            } else {
              setIsComplete(true);
              return 100;
            }
          }
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [currentStep, phase, isPaused, isComplete, started]);

  const handleSkip = () => {
    if (phase === 'tense') { setPhase('release'); setProgress(0); }
    else if (currentStep < muscleGroups.length - 1) { setCurrentStep((s) => s + 1); setPhase('tense'); setProgress(0); }
    else setIsComplete(true);
  };

  const handleReset = () => {
    setCurrentStep(0); setPhase('tense'); setProgress(0);
    setIsComplete(false); setStarted(false); setIsPaused(false);
  };

  const currentGroup = muscleGroups[currentStep];
  const isTense = phase === 'tense';
  const activeColor = isTense ? TENSE_COLOR : ACCENT;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'linear-gradient(180deg, #fdf0ec 0%, #faf5f3 50%, #ffffff 100%)' }}
    >
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: TENSE_COLOR }}>
            <Waves className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: TENSE_COLOR }}>
              Muscle Relaxation
            </p>
            <p className="text-[13px] font-bold leading-tight" style={{ color: '#1a2b38' }}>
              Progressive Release
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

      {/* ── Step dots ── */}
      <div className="flex justify-center gap-1 px-5 mb-5">
        {muscleGroups.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === currentStep && started ? 14 : 6,
              background: isComplete || i < currentStep
                ? TENSE_COLOR
                : i === currentStep && started
                ? activeColor
                : '#ddd0cc',
            }}
            transition={{ duration: 0.3 }}
            style={{ height: 6, borderRadius: 99 }}
          />
        ))}
      </div>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key={`${currentStep}-${phase}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center w-full"
            >
              {/* Phase badge */}
              <motion.div
                animate={{ background: `${activeColor}18`, color: activeColor }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
                style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                {isTense
                  ? <Zap className="h-3.5 w-3.5" />
                  : <Leaf className="h-3.5 w-3.5" />}
                {isTense ? 'Tense' : 'Release'}
              </motion.div>

              {/* Pulsing orb */}
              <div className="relative flex items-center justify-center mb-8" style={{ width: 180, height: 180 }}>
                {/* Glow ring */}
                <motion.div
                  animate={{
                    scale: isTense ? [1, 1.15, 1.08] : [1.08, 1, 1.02],
                    background: `radial-gradient(circle, ${activeColor}28 0%, transparent 70%)`,
                  }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatType: 'mirror' }}
                  className="absolute rounded-full"
                  style={{ width: 160, height: 160 }}
                />

                {/* Outer ring */}
                <motion.div
                  animate={{
                    scale: isTense ? 1.12 : 1,
                    borderColor: activeColor,
                  }}
                  transition={{ duration: 0.5 }}
                  className="absolute rounded-full border-2"
                  style={{ width: 128, height: 128, borderColor: activeColor }}
                />

                {/* Filled orb */}
                <motion.div
                  animate={{
                    scale: isTense ? 1.1 : 1,
                    background: activeColor,
                  }}
                  transition={{ duration: 0.5 }}
                  className="absolute rounded-full flex items-center justify-center"
                  style={{ width: 104, height: 104 }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={phase}
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isTense
                        ? <Zap className="h-9 w-9 text-white" />
                        : <Leaf className="h-9 w-9 text-white" />}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Muscle group name */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep + phase}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-center"
                >
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#8fa3b1' }}>
                    {started ? `${currentStep + 1} of ${muscleGroups.length}` : 'Get ready'}
                  </p>
                  <h2 className="text-2xl font-bold mb-3" style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}>
                    {currentGroup.name}
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: '#5f7585', maxWidth: 280 }}>
                    {started
                      ? (isTense ? currentGroup.tense : currentGroup.release)
                      : 'Sit or lie down comfortably. We\'ll work through each muscle group together.'}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Progress bar */}
              {started && (
                <div
                  className="mt-6 rounded-full overflow-hidden"
                  style={{ width: 240, height: 4, background: `${activeColor}22` }}
                >
                  <motion.div
                    style={{ height: '100%', background: activeColor, borderRadius: 99, width: `${progress}%` }}
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
                <Waves className="h-9 w-9" style={{ color: ACCENT }} />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}>
                Fully relaxed
              </h2>
              <p className="text-sm leading-relaxed mb-1" style={{ color: '#5f7585' }}>
                Your muscles are now tension-free. Notice how light your body feels.
              </p>
              <p className="text-xs font-semibold uppercase tracking-widest mb-8" style={{ color: ACCENT }}>
                {muscleGroups.length} groups released
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
            style={{ background: `linear-gradient(135deg, ${TENSE_COLOR}, ${TENSE_COLOR}cc)`, boxShadow: `0 6px 24px ${TENSE_COLOR}44` }}
          >
            <Play className="h-5 w-5" />
            Begin Exercise
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
              style={{ background: `linear-gradient(135deg, ${activeColor}, ${activeColor}cc)`, boxShadow: `0 6px 24px ${activeColor}44` }}
            >
              <SkipForward className="h-5 w-5" />
              {isTense ? 'Release' : 'Next Muscle'}
            </motion.button>
          </div>
        )}

        {isComplete && (
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={handleReset}
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

export default ProgressiveMuscleRelaxation;