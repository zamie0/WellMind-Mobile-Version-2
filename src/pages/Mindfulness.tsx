import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav } from '@/components/wellmind/BottomNav';
import { BreathingExercise } from '@/components/wellmind/BreathingExercise';
import { GroundingExercise } from '@/components/wellmind/GroundingExercise';
import { SleepMeditation } from '@/components/wellmind/SleepMeditation';
import { BodyScanExercise } from '@/components/wellmind/BodyScanExercise';
import { ProgressiveMuscleRelaxation } from '@/components/wellmind/ProgressiveMuscleRelaxation';
import { LovingKindnessMeditation } from '@/components/wellmind/LovingKindnessMeditation';
import { VisualizationExercise } from '@/components/wellmind/VisualizationExercise';
import { BoxBreathingExercise } from '@/components/wellmind/BoxBreathingExercise';
import { GratitudeExercise } from '@/components/wellmind/GratitudeExercise';
import { Button } from '@/components/ui/button';
import { Wind, Moon, Sun, Leaf, Play, Clock, MessageCircleHeart, Waves, Heart, Sparkles, Square, PenLine } from 'lucide-react';
import heroMindfulness from '@/assets/hero-mindfulness.png';

const exercises = [
  {
    id: 'breathing',
    icon: <Wind className="h-8 w-8" />,
    title: 'Deep Breathing',
    description: '4-4-6 breathing technique to calm your nervous system',
    duration: '3 min',
    color: 'bg-sky-light text-sky',
    available: true,
  },
  {
    id: 'box-breathing',
    icon: <Square className="h-8 w-8" />,
    title: 'Box Breathing',
    description: '4-4-4-4 technique used by Navy SEALs for calm under pressure',
    duration: '3 min',
    color: 'bg-sky-light text-sky',
    available: true,
  },
  {
    id: 'body-scan',
    icon: <Leaf className="h-8 w-8" />,
    title: 'Body Scan',
    description: 'Release tension by focusing on each part of your body',
    duration: '5 min',
    color: 'bg-sage-light text-sage',
    available: true,
  },
  {
    id: 'progressive-muscle',
    icon: <Waves className="h-8 w-8" />,
    title: 'Progressive Muscle Relaxation',
    description: 'Tense and release muscle groups to melt away stress',
    duration: '5 min',
    color: 'bg-coral-light text-coral',
    available: true,
  },
  {
    id: 'grounding',
    icon: <Sun className="h-8 w-8" />,
    title: '5-4-3-2-1 Grounding',
    description: 'Use your senses to ground yourself in the present',
    duration: '2 min',
    color: 'bg-honey-light text-honey',
    available: true,
  },
  {
    id: 'sleep',
    icon: <Moon className="h-8 w-8" />,
    title: 'Sleep Meditation',
    description: 'Gentle guidance to help you drift into peaceful sleep',
    duration: '3 min',
    color: 'bg-lavender-light text-lavender',
    available: true,
  },
  {
    id: 'loving-kindness',
    icon: <Heart className="h-8 w-8" />,
    title: 'Loving-Kindness',
    description: 'Send compassion to yourself and others for inner peace',
    duration: '4 min',
    color: 'bg-lavender-light text-lavender',
    available: true,
  },
  {
    id: 'visualization',
    icon: <Sparkles className="h-8 w-8" />,
    title: 'Peaceful Visualization',
    description: 'Journey to a calming beach scene in your mind',
    duration: '3 min',
    color: 'bg-primary/10 text-primary',
    available: true,
  },
  {
    id: 'gratitude',
    icon: <PenLine className="h-8 w-8" />,
    title: 'Gratitude Practice',
    description: 'Reflect on three things you are grateful for today',
    duration: '3 min',
    color: 'bg-honey-light text-honey',
    available: true,
  },
];

const sounds = [
  { id: 'rain', emoji: '🌧️', label: 'Rain' },
  { id: 'ocean', emoji: '🌊', label: 'Ocean' },
  { id: 'forest', emoji: '🌲', label: 'Forest' },
  { id: 'fire', emoji: '🔥', label: 'Fire' },
];

export const Mindfulness = () => {
  const [showBreathing, setShowBreathing] = useState(false);
  const [showBoxBreathing, setShowBoxBreathing] = useState(false);
  const [showGrounding, setShowGrounding] = useState(false);
  const [showSleepMeditation, setShowSleepMeditation] = useState(false);
  const [showBodyScan, setShowBodyScan] = useState(false);
  const [showProgressiveMuscle, setShowProgressiveMuscle] = useState(false);
  const [showLovingKindness, setShowLovingKindness] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [showGratitude, setShowGratitude] = useState(false);
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);

  const handleExerciseClick = (exercise: typeof exercises[0]) => {
    switch (exercise.id) {
      case 'breathing':
        setShowBreathing(true);
        break;
      case 'box-breathing':
        setShowBoxBreathing(true);
        break;
      case 'grounding':
        setShowGrounding(true);
        break;
      case 'sleep':
        setShowSleepMeditation(true);
        break;
      case 'body-scan':
        setShowBodyScan(true);
        break;
      case 'progressive-muscle':
        setShowProgressiveMuscle(true);
        break;
      case 'loving-kindness':
        setShowLovingKindness(true);
        break;
      case 'visualization':
        setShowVisualization(true);
        break;
      case 'gratitude':
        setShowGratitude(true);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with Hero Image */}
      <header className="relative">
        <div className="h-48 overflow-hidden">
          <img 
            src={heroMindfulness} 
            alt="Peaceful mindfulness illustration" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        </div>
        <div className="px-5 -mt-8 relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-foreground"
          >
            Mindfulness
          </motion.h1>
          <p className="text-muted-foreground">Take a moment for yourself</p>
        </div>
      </header>

      <main className="px-5 py-4 space-y-8">
        {/* Ambient Sounds */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Ambient Sounds</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {sounds.map((sound) => (
              <motion.button
                key={sound.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveSound(activeSound === sound.id ? null : sound.id)}
                className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl transition-all ${
                  activeSound === sound.id
                    ? 'bg-primary text-primary-foreground shadow-glow'
                    : 'bg-card shadow-soft'
                }`}
              >
                <span className="text-2xl mb-1">{sound.emoji}</span>
                <span className="text-xs font-medium">{sound.label}</span>
              </motion.button>
            ))}
          </div>
          {activeSound && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground text-center mt-3"
            >
              🎵 Sound feature coming soon...
            </motion.p>
          )}
        </section>

        {/* Exercises */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Guided Exercises</h2>
          <div className="space-y-4">
            {exercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-card rounded-2xl p-5 shadow-soft ${
                  !exercise.available && 'opacity-60'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-2xl ${exercise.color} flex items-center justify-center flex-shrink-0`}>
                    {exercise.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{exercise.title}</h3>
                      {!exercise.available && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                          Coming soon
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {exercise.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {exercise.duration}
                      </div>
                      <Button
                        size="sm"
                        variant={exercise.available ? 'sage' : 'outline'}
                        disabled={!exercise.available}
                        onClick={() => handleExerciseClick(exercise)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-sage-light rounded-2xl p-5"
        >
          <h3 className="font-semibold text-foreground mb-2">💡 Quick Tip</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Even just 1 minute of mindful breathing can help reduce stress hormones. 
            Try to practice at the same time each day to build a habit.
          </p>
        </motion.section>
      </main>

      <BottomNav />

      {/* Exercise Modals */}
      <AnimatePresence>
        {showBreathing && (
          <BreathingExercise onClose={() => setShowBreathing(false)} />
        )}
        {showBoxBreathing && (
          <BoxBreathingExercise onClose={() => setShowBoxBreathing(false)} />
        )}
        {showGrounding && (
          <GroundingExercise onClose={() => setShowGrounding(false)} />
        )}
        {showSleepMeditation && (
          <SleepMeditation onClose={() => setShowSleepMeditation(false)} />
        )}
        {showBodyScan && (
          <BodyScanExercise onClose={() => setShowBodyScan(false)} />
        )}
        {showProgressiveMuscle && (
          <ProgressiveMuscleRelaxation onClose={() => setShowProgressiveMuscle(false)} />
        )}
        {showLovingKindness && (
          <LovingKindnessMeditation onClose={() => setShowLovingKindness(false)} />
        )}
        {showVisualization && (
          <VisualizationExercise onClose={() => setShowVisualization(false)} />
        )}
        {showGratitude && (
          <GratitudeExercise onClose={() => setShowGratitude(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Mindfulness;
