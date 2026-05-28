import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav } from '@/components/wellmind/BottomNav';
import { BreathingExercise } from '@/components/wellmind/BreathingExercise';
import { GroundingExercise } from '@/components/wellmind/GroundingExercise';
import { SleepMeditation } from '@/components/wellmind/SleepMeditation';
import { PeerChatButton } from '@/components/wellmind/PeerChatButton';
import { AIChatDemo } from '@/components/wellmind/AIChatDemo';
import { Button } from '@/components/ui/button';
import { Wind, Moon, Sun, Leaf, Play, Clock, MessageCircleHeart } from 'lucide-react';
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
    id: 'body-scan',
    icon: <Leaf className="h-8 w-8" />,
    title: 'Body Scan',
    description: 'Release tension by focusing on each part of your body',
    duration: '5 min',
    color: 'bg-sage-light text-sage',
    available: false,
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
];

const sounds = [
  { id: 'rain', emoji: '🌧️', label: 'Rain' },
  { id: 'ocean', emoji: '🌊', label: 'Ocean' },
  { id: 'forest', emoji: '🌲', label: 'Forest' },
  { id: 'fire', emoji: '🔥', label: 'Fire' },
];

export const Mindfulness = () => {
  const [showBreathing, setShowBreathing] = useState(false);
  const [showGrounding, setShowGrounding] = useState(false);
  const [showSleepMeditation, setShowSleepMeditation] = useState(false);
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);

  const handleExerciseClick = (exercise: typeof exercises[0]) => {
    if (exercise.id === 'breathing') {
      setShowBreathing(true);
    } else if (exercise.id === 'grounding') {
      setShowGrounding(true);
    } else if (exercise.id === 'sleep') {
      setShowSleepMeditation(true);
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
                transition={{ delay: index * 0.1 }}
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

        {/* Peer Support Section */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Connect with Others</h2>
          <PeerChatButton />
        </section>

        {/* AI Companion Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Talk to MindBuddy</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAIChat(!showAIChat)}
            >
              {showAIChat ? 'Hide' : 'Open Chat'}
            </Button>
          </div>
          
          {!showAIChat ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-5 border border-primary/20"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                  <MessageCircleHeart className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Need someone to talk to?</h3>
                  <p className="text-sm text-muted-foreground">
                    MindBuddy is here to listen and support you
                  </p>
                </div>
              </div>
              <Button
                className="w-full mt-4"
                onClick={() => setShowAIChat(true)}
              >
                <MessageCircleHeart className="w-4 h-4 mr-2" />
                Start Chatting
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <AIChatDemo />
            </motion.div>
          )}
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
        {showGrounding && (
          <GroundingExercise onClose={() => setShowGrounding(false)} />
        )}
        {showSleepMeditation && (
          <SleepMeditation onClose={() => setShowSleepMeditation(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Mindfulness;
