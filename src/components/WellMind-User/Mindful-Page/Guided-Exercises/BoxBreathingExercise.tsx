import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Square, RotateCcw } from 'lucide-react';

interface BoxBreathingExerciseProps {
  onClose: () => void;
}

const ACCENT = '#39a89b';

const phases = [
  { name: 'Inhale',  instruction: 'Breathe in slowly through your nose', duration: 4, corner: 0 },
  { name: 'Hold',    instruction: 'Hold your breath at the top',          duration: 4, corner: 1 },
  { name: 'Exhale',  instruction: 'Release slowly through your mouth',    duration: 4, corner: 2 },
  { name: 'Hold',    instruction: 'Rest empty before the next breath',    duration: 4, corner: 3 },
];

const TOTAL_CYCLES = 4;

// Box corners: bottom-left → top-left → top-right → bottom-right
const CORNERS = [
  { cx: 28, cy: 112 },   // phase 0 start  (left-mid before inhale, dot travels up)
  { cx: 28, cy: 28  },   // phase 1 start  (top-left)
  { cx: 112, cy: 28 },   // phase 2 start  (top-right)
  { cx: 112, cy: 112 },  // phase 3 start  (bottom-right)
];

// SVG box path segments — each side animates during its phase
const BOX_SIZE = 84; // side length in user units
const BOX_X = 28;
const BOX_Y = 28;

// Perimeter = 4 * 84 = 336
const PERIMETER = 4 * BOX_SIZE;

export const BoxBreathingExercise = ({ onClose }: BoxBreathingExerciseProps) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState(phases[0].duration);
  const [isComplete, setIsComplete] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started || isPaused || isComplete) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          const nextPhase = (currentPhase + 1) % 4;
          if (nextPhase === 0) {
            const newCycles = cycles + 1;
            if (newCycles >= TOTAL_CYCLES) {
              setIsComplete(true);
              return 0;
            }
            setCycles(newCycles);
          }
          setCurrentPhase(nextPhase);
          return phases[nextPhase].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPhase, cycles, isPaused, isComplete, started]);

  const phase = phases[currentPhase];
  const progress = (phase.duration - countdown) / phase.duration; // 0 → 1 within phase

  // Dot travels along one side per phase
  const dotX = (() => {
    if (!started) return CORNERS[0].cx;
    switch (currentPhase) {
      case 0: return BOX_X;                           // left side, going up → x stays at BOX_X
      case 1: return BOX_X + BOX_SIZE * progress;     // top side, going right
      case 2: return BOX_X + BOX_SIZE;                // right side, going down
      case 3: return BOX_X + BOX_SIZE * (1 - progress); // bottom side, going left
    }
  })();

  const dotY = (() => {
    if (!started) return CORNERS[0].cy;
    switch (currentPhase) {
      case 0: return BOX_Y + BOX_SIZE * (1 - progress); // left side going up
      case 1: return BOX_Y;                              // top side
      case 2: return BOX_Y + BOX_SIZE * progress;        // right side going down
      case 3: return BOX_Y + BOX_SIZE;                   // bottom side
    }
  })();

  // Perimeter drawn so far (for the trailing arc effect)
  const perimeterDone = (currentPhase / 4 + progress / 4) * PERIMETER;

  const handleStart = () => {
    setStarted(true);
    setIsPaused(false);
  };

  const handleReset = () => {
    setStarted(false);
    setIsPaused(false);
    setCurrentPhase(0);
    setCycles(0);
    setCountdown(phases[0].duration);
    setIsComplete(false);
  };

  const phaseColors: Record<string, string> = {
    Inhale: ACCENT,
    Hold:   '#8fa3b1',
    Exhale: '#e8735a',
  };

  const phaseColor = phaseColors[phase.name] ?? ACCENT;

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
            <Square className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>
              Box Breathing
            </p>
            <p className="text-[13px] font-bold leading-tight" style={{ color: '#1a2b38' }}>
              4 · 4 · 4 · 4 Technique
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

      {/* ── Cycle dots ── */}
      <div className="flex justify-center gap-2 mt-1 mb-6">
        {Array.from({ length: TOTAL_CYCLES }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === cycles && started && !isComplete ? 20 : 8,
              background: isComplete || i < cycles ? ACCENT : i === cycles && started ? ACCENT : '#c8dbd7',
            }}
            transition={{ duration: 0.3 }}
            style={{ height: 8, borderRadius: 99 }}
          />
        ))}
      </div>

      {/* ── Box visualiser ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key="exercise"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              {/* Phase label tabs */}
              <div className="flex gap-2 mb-8">
                {phases.map((p, i) => (
                  <motion.div
                    key={p.name + i}
                    animate={{
                      background: started && i === currentPhase ? phaseColor : 'rgba(26,43,56,0.06)',
                      color: started && i === currentPhase ? 'white' : '#8fa3b1',
                    }}
                    transition={{ duration: 0.3 }}
                    className="px-3 py-1 rounded-full text-xs font-bold"
                  >
                    {p.name}
                  </motion.div>
                ))}
              </div>

              {/* SVG box */}
              <div className="relative" style={{ width: 220, height: 220 }}>
                {/* Soft background glow */}
                <div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: `radial-gradient(circle at center, ${ACCENT}14 0%, transparent 70%)`,
                  }}
                />

                <svg width="220" height="220" viewBox="0 0 140 140" className="absolute inset-0">
                  {/* Corner dots */}
                  {CORNERS.map((c, i) => (
                    <circle
                      key={i}
                      cx={c.cx}
                      cy={c.cy}
                      r="4"
                      fill={`${ACCENT}55`}
                    />
                  ))}

                  {/* Full box outline (faint) */}
                  <rect
                    x={BOX_X} y={BOX_Y}
                    width={BOX_SIZE} height={BOX_SIZE}
                    fill="none"
                    stroke={`${ACCENT}22`}
                    strokeWidth="2.5"
                    rx="3"
                  />

                  {/* Animated perimeter trail */}
                  <rect
                    x={BOX_X} y={BOX_Y}
                    width={BOX_SIZE} height={BOX_SIZE}
                    fill="none"
                    stroke={ACCENT}
                    strokeWidth="2.5"
                    rx="3"
                    strokeDasharray={PERIMETER}
                    strokeDashoffset={PERIMETER - perimeterDone}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.6s linear' }}
                  />

                  {/* Phase labels at each corner */}
                  {[
                    { label: 'IN',   x: 14,  y: 75, anchor: 'middle' },
                    { label: 'HOLD', x: 70,  y: 20, anchor: 'middle' },
                    { label: 'OUT',  x: 126, y: 75, anchor: 'middle' },
                    { label: 'HOLD', x: 70,  y: 128, anchor: 'middle' },
                  ].map((l, i) => (
                    <text
                      key={i}
                      x={l.x} y={l.y}
                      textAnchor={l.anchor as 'middle'}
                      fontSize="6"
                      fontWeight="700"
                      letterSpacing="0.05em"
                      fill={started && i === currentPhase ? phaseColor : `${ACCENT}55`}
                      style={{ transition: 'fill 0.3s' }}
                    >
                      {l.label}
                    </text>
                  ))}

                  {/* Moving dot */}
                  {started && (
                    <motion.circle
                      cx={dotX}
                      cy={dotY}
                      r="6"
                      fill={phaseColor}
                      style={{ filter: `drop-shadow(0 0 4px ${phaseColor}88)` }}
                      animate={{ cx: dotX, cy: dotY }}
                      transition={{ duration: 1, ease: 'linear' }}
                    />
                  )}

                  {/* Countdown in centre */}
                  <text
                    x="70" y="74"
                    textAnchor="middle"
                    fontSize={started ? '22' : '14'}
                    fontWeight="700"
                    fill={started ? '#1a2b38' : `${ACCENT}88`}
                  >
                    {started ? countdown : '4'}
                  </text>
                  <text
                    x="70" y="88"
                    textAnchor="middle"
                    fontSize="7"
                    fontWeight="600"
                    fill={phaseColor}
                  >
                    {started ? phase.name.toUpperCase() : 'START'}
                  </text>
                </svg>
              </div>

              {/* Instruction text */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={phase.name + currentPhase}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-sm text-center mt-8 leading-relaxed"
                  style={{ color: '#5f7585', minHeight: 40 }}
                >
                  {started
                    ? phase.instruction
                    : 'Find a comfortable seated position. Breathe normally for a moment.'}
                </motion.p>
              </AnimatePresence>

              {/* Cycle count */}
              {started && (
                <p className="text-xs font-semibold mt-3" style={{ color: '#8fa3b1' }}>
                  Cycle {cycles + 1} of {TOTAL_CYCLES}
                </p>
              )}
            </motion.div>
          ) : (
            /* ── Complete state ── */
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
                <Square className="h-9 w-9" style={{ color: ACCENT }} />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}>
                All done
              </h2>
              <p className="text-sm leading-relaxed mb-2" style={{ color: '#5f7585' }}>
                You completed {TOTAL_CYCLES} full cycles. Your nervous system is calm and balanced.
              </p>
              <p className="text-xs font-semibold uppercase tracking-widest mb-8" style={{ color: ACCENT }}>
                {TOTAL_CYCLES * 4 * 4}s of mindful breathing
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
            onClick={handleStart}
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

        {started && !isComplete && (
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={handleReset}
              className="flex items-center justify-center w-14 h-14 rounded-2xl"
              style={{ background: 'rgba(26,43,56,0.06)' }}
              aria-label="Reset"
            >
              <RotateCcw className="h-5 w-5" style={{ color: '#5f7585' }} />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsPaused((p) => !p)}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-[15px] text-white"
              style={{
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc)`,
                boxShadow: `0 6px 24px ${ACCENT}55`,
              }}
            >
              {isPaused ? (
                <><Play className="h-5 w-5" /> Resume</>
              ) : (
                <><Pause className="h-5 w-5" /> Pause</>
              )}
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
              style={{
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc)`,
                boxShadow: `0 6px 24px ${ACCENT}55`,
              }}
            >
              Done
            </motion.button>
          </div>
        )}

        <p className="text-center text-xs" style={{ color: '#8fa3b1' }}>
          Used by Navy SEALs to stay calm under pressure
        </p>
      </div>
    </motion.div>
  );
};

export default BoxBreathingExercise;