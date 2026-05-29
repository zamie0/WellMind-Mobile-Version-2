import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, 
  UtensilsCrossed, 
  Footprints, 
  Headphones, 
  PenLine, 
  Sparkles as CleanIcon,
  BookOpen,
  Wind,
  Shuffle,
  X,
  Clock,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Activity {
  id: string;
  icon: React.ReactNode;
  title: string;
  shortDesc: string;
  details: string[];
  duration: string;
  difficulty: 'Easy' | 'Medium';
  color: string;
}

const activities: Activity[] = [
  {
    id: 'game',
    icon: <Gamepad2 className="h-6 w-6" />,
    title: 'Play a Simple Game',
    shortDesc: 'Quick mental refresh',
    details: [
      'Try the Bubble Pop game in the Rewards section',
      'Play a round of Zen Garden to relax your mind',
      'Challenge yourself with Color Match',
      'Focus on the game, let worries fade away'
    ],
    duration: '5-10 min',
    difficulty: 'Easy',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    id: 'cook',
    icon: <UtensilsCrossed className="h-6 w-6" />,
    title: 'Prepare a Simple Meal',
    shortDesc: 'Nourish your body',
    details: [
      'Make a warm cup of tea or coffee',
      'Prepare a simple sandwich or toast',
      'Cut up some fresh fruits',
      'Focus on the textures, smells, and colors'
    ],
    duration: '10-15 min',
    difficulty: 'Easy',
    color: 'bg-orange-100 text-orange-600'
  },
  {
    id: 'walk',
    icon: <Footprints className="h-6 w-6" />,
    title: 'Take a Short Walk',
    shortDesc: 'Move your body gently',
    details: [
      'Walk around your room or house',
      'Step outside for 5 minutes if possible',
      'Notice 3 things you can see, hear, and feel',
      'No destination needed — just move'
    ],
    duration: '5-15 min',
    difficulty: 'Easy',
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 'music',
    icon: <Headphones className="h-6 w-6" />,
    title: 'Listen to Calming Music',
    shortDesc: 'Soothe your mind',
    details: [
      'Put on your favorite relaxing playlist',
      'Try lo-fi, nature sounds, or classical music',
      'Close your eyes and focus on the melody',
      'Let the music wash away tension'
    ],
    duration: '5-20 min',
    difficulty: 'Easy',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 'journal',
    icon: <PenLine className="h-6 w-6" />,
    title: 'Journal Your Thoughts',
    shortDesc: 'Express yourself freely',
    details: [
      'Use the Journal feature on your dashboard',
      'Write 3 things you are grateful for',
      'Describe how you are feeling right now',
      'No need for perfection — just write'
    ],
    duration: '5-10 min',
    difficulty: 'Easy',
    color: 'bg-pink-100 text-pink-600'
  },
  {
    id: 'tidy',
    icon: <CleanIcon className="h-6 w-6" />,
    title: 'Tidy One Small Space',
    shortDesc: 'Create calm around you',
    details: [
      'Clear off your desk or bedside table',
      'Organize one drawer or shelf',
      'Make your bed if you have not yet',
      'A tidy space helps create a tidy mind'
    ],
    duration: '5-10 min',
    difficulty: 'Easy',
    color: 'bg-teal-100 text-teal-600'
  },
  {
    id: 'read',
    icon: <BookOpen className="h-6 w-6" />,
    title: 'Read a Few Pages',
    shortDesc: 'Escape into a story',
    details: [
      'Pick up any book or article you enjoy',
      'Read just 3-5 pages — no pressure for more',
      'Try a calming or uplifting genre',
      'Let yourself get lost in the words'
    ],
    duration: '5-15 min',
    difficulty: 'Easy',
    color: 'bg-amber-100 text-amber-600'
  },
  {
    id: 'breathe',
    icon: <Wind className="h-6 w-6" />,
    title: 'Try a 1-Minute Breathing',
    shortDesc: 'Reset with your breath',
    details: [
      'Go to the Mindfulness section',
      'Try the breathing exercise',
      'Breathe in for 4 counts, out for 6',
      'Even 60 seconds can shift your mood'
    ],
    duration: '1-3 min',
    difficulty: 'Easy',
    color: 'bg-cyan-100 text-cyan-600'
  }
];

export const ActivitySuggestion = () => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);

  const getRandomActivity = () => {
    const randomIndex = Math.floor(Math.random() * activities.length);
    setSelectedActivity(activities[randomIndex]);
    setShowSuggestion(true);
  };

  const closeSuggestion = () => {
    setShowSuggestion(false);
    setTimeout(() => setSelectedActivity(null), 300);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-5 border border-border"
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">💡</span>
          <h3 className="font-semibold text-foreground">What Can I Do Now?</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Feeling stuck or overwhelmed? Let us suggest a simple activity to help you feel better.
        </p>

        <Button 
          onClick={getRandomActivity}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Shuffle className="h-4 w-4 mr-2" />
          Suggest an Activity
        </Button>

        {/* Quick activity grid */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {activities.slice(0, 8).map((activity) => (
            <motion.button
              key={activity.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedActivity(activity);
                setShowSuggestion(true);
              }}
              className={`p-3 rounded-xl ${activity.color} transition-all`}
            >
              {activity.icon}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Activity Detail Modal */}
      <AnimatePresence>
        {showSuggestion && selectedActivity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeSuggestion}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-xl border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${selectedActivity.color}`}>
                  {selectedActivity.icon}
                </div>
                <Button variant="ghost" size="icon" onClick={closeSuggestion}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-1">
                {selectedActivity.title}
              </h3>
              <p className="text-muted-foreground mb-4">
                {selectedActivity.shortDesc}
              </p>

              <div className="flex gap-3 mb-4">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {selectedActivity.duration}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4" />
                  {selectedActivity.difficulty}
                </div>
              </div>

              <div className="bg-muted/50 rounded-xl p-4 mb-4">
                <h4 className="font-medium text-foreground mb-2">How to do it:</h4>
                <ul className="space-y-2">
                  {selectedActivity.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-0.5">•</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={getRandomActivity}
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  Try Another
                </Button>
                <Button 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={closeSuggestion}
                >
                  Got It!
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
