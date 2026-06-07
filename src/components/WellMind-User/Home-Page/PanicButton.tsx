import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Phone, Heart, Wind, Eye, Volume2, VolumeX, ChevronRight } from 'lucide-react';

type PanicPhase = 'idle' | 'breathing' | 'grounding' | 'affirmation';

const BREATHING_DURATION = 60;

const Hand = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </svg>
);
const Ear = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0" />
    <path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 0 4 0" />
  </svg>
);
const Nose = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2v8" />
    <path d="M8 14c-2 0-4 2-4 4 0 1.5 1 3 4 3 2 0 3-1 4-1s2 1 4 1c3 0 4-1.5 4-3 0-2-2-4-4-4" />
  </svg>
);
const Tongue = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22c5 0 8-3.5 8-8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8c0 4.5 3 8 8 8z" />
    <path d="M12 18c2 0 3.5-1.5 3.5-4V10" />
  </svg>
);

const GROUNDING_STEPS = [
  { sense: 'see',   count: 5, icon: Eye,    instruction: 'Name 5 things you can', highlight: 'SEE',   color: 'from-sky/80 to-blue-400/80' },
  { sense: 'touch', count: 4, icon: Hand,   instruction: 'Name 4 things you can', highlight: 'TOUCH', color: 'from-sage/80 to-green-400/80' },
  { sense: 'hear',  count: 3, icon: Ear,    instruction: 'Name 3 things you can', highlight: 'HEAR',  color: 'from-lavender/80 to-purple-400/80' },
  { sense: 'smell', count: 2, icon: Nose,   instruction: 'Name 2 things you can', highlight: 'SMELL', color: 'from-honey/80 to-yellow-400/80' },
  { sense: 'taste', count: 1, icon: Tongue, instruction: 'Name 1 thing you can',  highlight: 'TASTE', color: 'from-coral/80 to-red-400/80' },
];

const AFFIRMATIONS = [
  "This feeling will pass. You are safe.",
  "You are stronger than you think.",
  "Breathe. You've got this.",
  "It's okay to feel this way. It won't last forever.",
  "You are not alone. Help is available.",
  "Take it one moment at a time.",
  "You have survived difficult times before.",
];

interface PanicButtonProps {
  variant?: 'fab' | 'inline';
}

export const PanicButton = ({ variant = 'fab' }: PanicButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState<PanicPhase>('idle');
  const [breathTimer, setBreathTimer] = useState(BREATHING_DURATION);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [groundingStep, setGroundingStep] = useState(0);
  const [affirmationIndex, setAffirmationIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if (phase !== 'breathing') return;
    const interval = setInterval(() => {
      setBreathPhase(prev =>
        prev === 'inhale' ? 'hold' : prev === 'hold' ? 'exhale' : 'inhale'
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'breathing' || breathTimer <= 0) return;
    const timer = setInterval(() => {
      setBreathTimer(prev => {
        if (prev <= 1) { setPhase('grounding'); return BREATHING_DURATION; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, breathTimer]);

  useEffect(() => {
    if (phase !== 'affirmation') return;
    const interval = setInterval(() => {
      setAffirmationIndex(prev => (prev + 1) % AFFIRMATIONS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [phase]);

  const startPanicMode = useCallback(() => {
    setIsOpen(true);
    setPhase('breathing');
    setBreathTimer(BREATHING_DURATION);
    setBreathPhase('inhale');
    setGroundingStep(0);
    setAffirmationIndex(0);
  }, []);

  const closePanicMode = useCallback(() => {
    setIsOpen(false);
    setPhase('idle');
  }, []);

  const nextGroundingStep = useCallback(() => {
    if (groundingStep < GROUNDING_STEPS.length - 1) {
      setGroundingStep(prev => prev + 1);
    } else {
      setPhase('affirmation');
    }
  }, [groundingStep]);

  const breathScale = breathPhase === 'inhale' ? 1.3 : breathPhase === 'hold' ? 1.3 : 1;
  const breathLabel =
    breathPhase === 'inhale' ? 'Breathe In...' :
    breathPhase === 'hold'   ? 'Hold...' :
                               'Breathe Out...';
  const breathHint =
    breathPhase === 'inhale' ? '4 counts' :
    breathPhase === 'hold'   ? 'hold steady' : '6 counts';

  const phaseProgress =
    phase === 'breathing'   ? 1 :
    phase === 'grounding'   ? 2 : 3;

  return (
    <>
      {/* FAB */}
      {variant === 'fab' && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={startPanicMode}
          className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-destructive text-destructive-foreground shadow-lg flex items-center justify-center"
        >
          <AlertCircle className="w-6 h-6" />
        </motion.button>
      )}

      {/* Inline */}
      {variant === 'inline' && (
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={startPanicMode}
          className="w-full bg-card rounded-2xl p-4 shadow-soft flex items-center gap-3 text-left hover:shadow-card transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground text-sm">Panic Support</p>
            <p className="text-xs text-muted-foreground">Tap for instant calm</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </motion.button>
      )}

      {/* Full Screen Panic Mode */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: 'linear-gradient(160deg, #4a9b8e 0%, #3b7dbf 50%, #6b5ea8 100%)' }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 pb-3"
              style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}
            >
              {/* Progress steps */}
              <div className="flex items-center gap-2">
                {['Breathe', 'Ground', 'Affirm'].map((label, i) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      i + 1 === phaseProgress
                        ? 'bg-white text-primary'
                        : i + 1 < phaseProgress
                        ? 'bg-white/30 text-white'
                        : 'bg-white/10 text-white/40'
                    }`}>
                      <span>{i + 1}</span>
                      <span>{label}</span>
                    </div>
                    {i < 2 && (
                      <div className={`w-3 h-px ${i + 1 < phaseProgress ? 'bg-white/50' : 'bg-white/20'}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={closePanicMode}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6">
              <AnimatePresence mode="wait">

                {/* Breathing Phase */}
                {phase === 'breathing' && (
                  <motion.div
                    key="breathing"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center text-center w-full"
                  >
                    <p className="text-white/60 text-xs mb-1 uppercase tracking-widest">Breathing Exercise</p>
                    <p className="text-white/80 text-sm mb-10">{breathTimer}s remaining</p>

                    {/* Orb */}
                    <div className="relative flex items-center justify-center mb-10">
                      <motion.div
                        animate={{ scale: breathScale * 1.15, opacity: breathPhase === 'exhale' ? 0.2 : 0.4 }}
                        transition={{ duration: 4, ease: 'easeInOut' }}
                        className="absolute w-56 h-56 rounded-full bg-white/10"
                      />
                      <motion.div
                        animate={{ scale: breathScale }}
                        transition={{ duration: 4, ease: 'easeInOut' }}
                        className="absolute w-44 h-44 rounded-full bg-white/15 backdrop-blur-sm"
                      />
                      <motion.div
                        animate={{ scale: breathScale * 0.75 }}
                        transition={{ duration: 4, ease: 'easeInOut' }}
                        className="w-32 h-32 rounded-full bg-white/25 backdrop-blur flex items-center justify-center shadow-lg"
                      >
                        <Wind className="w-10 h-10 text-white" />
                      </motion.div>
                    </div>

                    <motion.p
                      key={breathPhase}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-3xl font-semibold text-white mb-1"
                    >
                      {breathLabel}
                    </motion.p>
                    <p className="text-white/50 text-sm mb-10">{breathHint}</p>

                    <button
                      onClick={() => setPhase('affirmation')}
                      className="text-white/50 text-sm hover:text-white/80 transition-colors underline underline-offset-4"
                    >
                      Skip to affirmations
                    </button>
                  </motion.div>
                )}

                {/* Grounding Phase */}
                {phase === 'grounding' && (
                  <motion.div
                    key="grounding"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center text-center w-full"
                  >
                    <p className="text-white/60 text-xs mb-1 uppercase tracking-widest">5-4-3-2-1 Grounding</p>

                    {/* Step dots */}
                    <div className="flex gap-2 mb-10">
                      {GROUNDING_STEPS.map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            i === groundingStep ? 'w-6 bg-white' :
                            i < groundingStep   ? 'w-3 bg-white/50' :
                                                  'w-3 bg-white/20'
                          }`}
                        />
                      ))}
                    </div>

                    {(() => {
                      const step = GROUNDING_STEPS[groundingStep];
                      const Icon = step.icon;
                      return (
                        <motion.div
                          key={groundingStep}
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -30 }}
                          className="flex flex-col items-center"
                        >
                          <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-lg`}>
                            <Icon className="w-12 h-12 text-white" />
                          </div>
                          <p className="text-xl text-white/80 mb-1">{step.instruction}</p>
                          <p className="text-4xl font-bold text-white mb-2">{step.highlight}</p>
                          <p className="text-white/50 text-sm mb-10">Take your time to notice them</p>
                          <button
                            onClick={nextGroundingStep}
                            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-medium px-8 py-3 rounded-full transition-colors"
                          >
                            {groundingStep < GROUNDING_STEPS.length - 1 ? 'Next sense' : 'Continue'}
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </motion.div>
                      );
                    })()}
                  </motion.div>
                )}

                {/* Affirmation Phase */}
                {phase === 'affirmation' && (
                  <motion.div
                    key="affirmation"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center text-center w-full"
                  >
                    <p className="text-white/60 text-xs mb-8 uppercase tracking-widest">You've got this</p>

                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-8 shadow-lg"
                    >
                      <Heart className="w-10 h-10 text-white fill-white/50" />
                    </motion.div>

                    {/* Affirmation dots */}
                    <div className="flex gap-1.5 mb-6">
                      {AFFIRMATIONS.map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            i === affirmationIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/30'
                          }`}
                        />
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.p
                        key={affirmationIndex}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        className="text-2xl font-semibold text-white max-w-xs leading-snug mb-10"
                      >
                        {AFFIRMATIONS[affirmationIndex]}
                      </motion.p>
                    </AnimatePresence>

                    <div className="w-full space-y-3">
                      <button
                        onClick={closePanicMode}
                        className="w-full bg-white text-primary font-semibold py-4 rounded-2xl hover:bg-white/90 transition-colors"
                      >
                        I'm feeling better 💚
                      </button>
                      <button
                        onClick={() => setPhase('breathing')}
                        className="w-full bg-white/10 text-white font-medium py-4 rounded-2xl hover:bg-white/20 transition-colors"
                      >
                        Restart breathing
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Crisis Hotline */}
            <div
              className="px-5"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)' }}
            >
              <a
                href="tel:999"
                className="flex items-center gap-3 py-4 px-5 rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">Crisis Hotline</p>
                  <p className="text-xs text-white/60">Call 999 — available 24/7</p>
                </div>
              </a>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};