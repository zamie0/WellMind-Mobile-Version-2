import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Eye, Hand, Ear, Wind, Heart, ChevronRight, Check } from 'lucide-react';

interface GroundingExerciseProps {
  onClose: () => void;
}

const steps = [
  {
    count: 5,
    sense: 'SEE',
    icon: Eye,
    instruction: 'Name 5 things you can SEE',
    color: 'text-sky',
    bgColor: 'bg-sky-light',
    examples: 'Look around and notice colors, shapes, or objects',
  },
  {
    count: 4,
    sense: 'TOUCH',
    icon: Hand,
    instruction: 'Name 4 things you can TOUCH',
    color: 'text-sage',
    bgColor: 'bg-sage-light',
    examples: 'Feel textures around you - your clothes, chair, or skin',
  },
  {
    count: 3,
    sense: 'HEAR',
    icon: Ear,
    instruction: 'Name 3 things you can HEAR',
    color: 'text-honey',
    bgColor: 'bg-honey-light',
    examples: 'Listen for sounds nearby or in the distance',
  },
  {
    count: 2,
    sense: 'SMELL',
    icon: Wind,
    instruction: 'Name 2 things you can SMELL',
    color: 'text-coral',
    bgColor: 'bg-coral-light',
    examples: 'Notice any scents in your environment',
  },
  {
    count: 1,
    sense: 'TASTE',
    icon: Heart,
    instruction: 'Name 1 thing you can TASTE',
    color: 'text-lavender',
    bgColor: 'bg-lavender-light',
    examples: 'Notice any taste in your mouth right now',
  },
];

export const GroundingExercise = ({ onClose }: GroundingExerciseProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>(new Array(5).fill(false));
  const [isFinished, setIsFinished] = useState(false);

  const handleNext = () => {
    const newCompleted = [...completed];
    newCompleted[currentStep] = true;
    setCompleted(newCompleted);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsFinished(true);
    }
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <h2 className="text-lg font-semibold text-foreground">5-4-3-2-1 Grounding</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Progress Indicators */}
      <div className="flex justify-center gap-2 px-4 mb-6">
        {steps.map((s, index) => (
          <motion.div
            key={index}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              index === currentStep
                ? `${s.bgColor} ${s.color} ring-2 ring-offset-2 ring-primary`
                : completed[index]
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
            animate={{ scale: index === currentStep ? 1.1 : 1 }}
          >
            {completed[index] ? <Check className="h-4 w-4" /> : s.count}
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {!isFinished ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="text-center w-full max-w-sm"
            >
              {/* Icon */}
              <motion.div
                className={`w-24 h-24 ${step.bgColor} rounded-full mx-auto mb-6 flex items-center justify-center`}
                animate={{ 
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Icon className={`h-12 w-12 ${step.color}`} />
              </motion.div>

              {/* Count */}
              <motion.div
                className={`text-6xl font-bold ${step.color} mb-4`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
              >
                {step.count}
              </motion.div>

              {/* Instruction */}
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {step.instruction}
              </h3>

              {/* Examples */}
              <p className="text-muted-foreground text-sm mb-8">
                {step.examples}
              </p>

              {/* Next Button */}
              <Button
                size="lg"
                className="w-full"
                onClick={handleNext}
              >
                I've done this
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                className="w-24 h-24 bg-primary/20 rounded-full mx-auto mb-6 flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: 2 }}
              >
                <Check className="h-12 w-12 text-primary" />
              </motion.div>

              <h3 className="text-2xl font-bold text-foreground mb-2">
                Well done! 🌟
              </h3>
              <p className="text-muted-foreground mb-6">
                You've grounded yourself in the present moment.
                Take a deep breath and notice how you feel.
              </p>

              <Button size="lg" onClick={onClose}>
                Finish
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default GroundingExercise;
