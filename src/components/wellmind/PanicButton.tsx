import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Phone, Heart, Wind, Eye, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PanicPhase = 'idle' | 'breathing' | 'grounding' | 'affirmation' | 'complete';

const BREATHING_DURATION = 60;

// Simple icon components for senses
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
  { sense: 'see', count: 5, icon: Eye, instruction: 'Name 5 things you can SEE' },
  { sense: 'touch', count: 4, icon: Hand, instruction: 'Name 4 things you can TOUCH' },
  { sense: 'hear', count: 3, icon: Ear, instruction: 'Name 3 things you can HEAR' },
  { sense: 'smell', count: 2, icon: Nose, instruction: 'Name 2 things you can SMELL' },
  { sense: 'taste', count: 1, icon: Tongue, instruction: 'Name 1 thing you can TASTE' },
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

  // Breathing cycle
  useEffect(() => {
    if (phase !== 'breathing') return;
    
    const breathCycle = () => {
      setBreathPhase(prev => {
        if (prev === 'inhale') return 'hold';
        if (prev === 'hold') return 'exhale';
        return 'inhale';
      });
    };

    const interval = setInterval(breathCycle, 4000);
    return () => clearInterval(interval);
  }, [phase]);

  // Breath timer countdown
  useEffect(() => {
    if (phase !== 'breathing' || breathTimer <= 0) return;
    
    const timer = setInterval(() => {
      setBreathTimer(prev => {
        if (prev <= 1) {
          setPhase('grounding');
          return BREATHING_DURATION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, breathTimer]);

  // Affirmation rotation
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

  const skipToAffirmation = useCallback(() => {
    setPhase('affirmation');
  }, []);

  const breathScale = breathPhase === 'inhale' ? 1.3 : breathPhase === 'hold' ? 1.3 : 1;

  return (
    <>
      {/* Floating Action Button */}
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

      {/* Inline Button */}
      {variant === 'inline' && (
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={startPanicMode}
          className="w-full p-4 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-full bg-destructive flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-destructive-foreground" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-destructive">Panic Support</p>
            <p className="text-sm text-muted-foreground">Tap for instant calm</p>
          </div>
        </motion.button>
      )}

      {/* Full Screen Panic Mode */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gradient-to-b from-sky/95 to-primary/95 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={closePanicMode}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6">
              <AnimatePresence mode="wait">
                {/* Breathing Phase */}
                {phase === 'breathing' && (
                  <motion.div
                    key="breathing"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center text-center"
                  >
                    <p className="text-white/80 text-lg mb-8">
                      {breathTimer} seconds remaining
                    </p>
                    
                    <motion.div
                      animate={{ scale: breathScale }}
                      transition={{ duration: 4, ease: "easeInOut" }}
                      className="w-48 h-48 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8"
                    >
                      <motion.div
                        animate={{ scale: breathScale * 0.8 }}
                        transition={{ duration: 4, ease: "easeInOut" }}
                        className="w-32 h-32 rounded-full bg-white/30 flex items-center justify-center"
                      >
                        <Wind className="w-12 h-12 text-white" />
                      </motion.div>
                    </motion.div>

                    <motion.p
                      key={breathPhase}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-3xl font-medium text-white capitalize"
                    >
                      {breathPhase === 'inhale' ? 'Breathe In...' : 
                       breathPhase === 'hold' ? 'Hold...' : 'Breathe Out...'}
                    </motion.p>

                    <Button
                      variant="ghost"
                      onClick={skipToAffirmation}
                      className="mt-8 text-white/60 hover:text-white hover:bg-white/10"
                    >
                      Skip to affirmations
                    </Button>
                  </motion.div>
                )}

                {/* Grounding Phase */}
                {phase === 'grounding' && (
                  <motion.div
                    key="grounding"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center text-center"
                  >
                    <p className="text-white/60 text-sm mb-4">5-4-3-2-1 Grounding</p>
                    
                    {(() => {
                      const step = GROUNDING_STEPS[groundingStep];
                      const Icon = step.icon;
                      return (
                        <motion.div
                          key={groundingStep}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex flex-col items-center"
                        >
                          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-6">
                            <Icon className="w-10 h-10 text-white" />
                          </div>
                          <p className="text-2xl font-medium text-white mb-2">
                            {step.instruction}
                          </p>
                          <p className="text-white/60 mb-8">
                            Take your time to notice them
                          </p>
                          <Button
                            onClick={nextGroundingStep}
                            className="bg-white/20 text-white hover:bg-white/30 px-8"
                          >
                            {groundingStep < GROUNDING_STEPS.length - 1 ? 'Next' : 'Continue'}
                          </Button>
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
                    className="flex flex-col items-center text-center"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-8"
                    >
                      <Heart className="w-10 h-10 text-white" />
                    </motion.div>

                    <AnimatePresence mode="wait">
                      <motion.p
                        key={affirmationIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-2xl font-medium text-white max-w-xs mb-8"
                      >
                        {AFFIRMATIONS[affirmationIndex]}
                      </motion.p>
                    </AnimatePresence>

                    <div className="space-y-3">
                      <Button
                        onClick={closePanicMode}
                        className="w-full bg-white text-primary hover:bg-white/90"
                      >
                        I'm feeling better
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setPhase('breathing')}
                        className="w-full text-white/80 hover:text-white hover:bg-white/10"
                      >
                        Restart breathing
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Crisis Hotline */}
            <div className="p-6">
              <a
                href="tel:999"
                className="flex items-center justify-center gap-2 p-4 rounded-xl bg-white/10 text-white"
              >
                <Phone className="w-5 h-5" />
                <span>Crisis Hotline: 999</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
