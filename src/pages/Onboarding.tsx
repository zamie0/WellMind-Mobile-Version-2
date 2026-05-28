import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWellMindStore } from '@/stores/wellmindStore';
import { Heart, Shield, Sparkles, ArrowRight } from 'lucide-react';

const slides = [
  {
    icon: <Heart className="h-16 w-16 text-coral" />,
    title: "Welcome to WellMind",
    description: "Your safe space for mental wellness. Track your mood, practice mindfulness, and understand your emotional patterns.",
    color: "bg-coral-light",
  },
  {
    icon: <Shield className="h-16 w-16 text-sage" />,
    title: "Your Privacy Matters",
    description: "All your data stays on your device. We never share your personal information. This is your private journey.",
    color: "bg-sage-light",
  },
  {
    icon: <Sparkles className="h-16 w-16 text-honey" />,
    title: "Small Steps, Big Impact",
    description: "Just a few minutes daily can help you build awareness and develop healthy mental habits.",
    color: "bg-honey-light",
  },
];

export const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const completeOnboarding = useWellMindStore((state) => state.completeOnboarding);

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      setStep(slides.length); // Go to name input
    }
  };

  const handleComplete = () => {
    completeOnboarding(name || 'Friend');
    navigate('/');
  };

  const isNameStep = step === slides.length;

  return (
    <div className="min-h-screen flex flex-col bg-background safe-area-top safe-area-bottom">
      <AnimatePresence mode="wait">
        {!isNameStep ? (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            {/* Illustration area */}
            <div className={`flex-1 flex items-center justify-center ${slides[step].color} rounded-b-[3rem]`}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="p-8"
              >
                <div className="w-32 h-32 rounded-full bg-card/50 flex items-center justify-center shadow-card">
                  {slides[step].icon}
                </div>
              </motion.div>
            </div>

            {/* Content area */}
            <div className="p-8 pb-12">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-foreground mb-4 text-center"
              >
                {slides[step].title}
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground text-center mb-8 leading-relaxed"
              >
                {slides[step].description}
              </motion.p>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 mb-8">
                {slides.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === step ? 'w-6 bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              <Button variant="hero" size="lg" className="w-full" onClick={handleNext}>
                {step === slides.length - 1 ? "Get Started" : "Continue"}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="name"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col justify-center p-8"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="w-20 h-20 rounded-full gradient-hero mx-auto mb-6 flex items-center justify-center"
              >
                <span className="text-4xl">🌱</span>
              </motion.div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                What should we call you?
              </h1>
              <p className="text-muted-foreground">
                This helps personalize your experience
              </p>
            </div>

            <Input
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-center text-lg h-14 rounded-xl mb-6"
            />

            <Button variant="hero" size="lg" onClick={handleComplete}>
              Let's Begin
              <Sparkles className="h-5 w-5 ml-2" />
            </Button>

            <button
              onClick={handleComplete}
              className="text-muted-foreground text-sm mt-4 hover:text-foreground transition-colors"
            >
              Skip for now
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disclaimer */}
      <div className="p-4 text-center">
        <p className="text-xs text-muted-foreground">
          This app is not a substitute for professional medical advice, diagnosis, or treatment.
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
