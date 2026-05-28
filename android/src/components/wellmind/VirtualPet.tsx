import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Zap, Sparkles, Cookie, Gamepad2, Droplets, Moon, Sun,
  Star, ShoppingBag, MessageCircle, Shirt
} from 'lucide-react';
import { useWellMindStore } from '@/stores/wellmindStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PetShop } from './PetShop';
import { FoodMenu } from './FoodMenu';
import { GamesMenu } from './GamesMenu';
import { MindBuddyChat } from './MindBuddyChat';
import { BuddyCharacter } from './BuddyCharacter';
import { toast } from 'sonner';
import type { PetMood, PetSkin, PetAccessory } from '@/types/wellmind';

const petMessages: Record<PetMood, string[]> = {
  thriving: [
    "I'm so happy! You're amazing!",
    "Life is wonderful with you!",
    "Best day ever! Let's play!",
  ],
  happy: [
    "Feeling great today!",
    "Thanks for taking care of me!",
    "Let's have some fun!",
  ],
  content: [
    "I'm doing okay!",
    "Could use some attention...",
    "Play with me?",
  ],
  tired: [
    "I need rest...",
    "So sleepy...",
    "A nap would be nice...",
  ],
  sad: [
    "I miss you...",
    "Please feed me...",
    "I need love...",
  ],
  sick: [
    "I don't feel well...",
    "Need some care...",
    "Help me get better...",
  ],
  sleeping: [
    "Zzz...",
    "Sweet dreams...",
    "Resting peacefully...",
  ],
};

export const VirtualPet = () => {
  const { 
    pet, calmCoins, feedPet, playWithPet, cleanPet, 
    putPetToSleep, wakePet, getPetMood, decayPetStats,
    spendCoins, addPetExperience
  } = useWellMindStore();
  
  const [showShop, setShowShop] = useState(false);
  const [showFoodMenu, setShowFoodMenu] = useState(false);
  const [showGamesMenu, setShowGamesMenu] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [showAction, setShowAction] = useState<string | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  
  const mood = getPetMood();
  const messages = petMessages[mood];
  const expToLevel = pet.level * 100;
  const expProgress = (pet.experience / expToLevel) * 100;

  // Rotate messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [messages.length]);

  // Decay stats over time
  useEffect(() => {
    const interval = setInterval(() => {
      if (!pet.isSleeping) {
        decayPetStats();
      }
    }, 60000); // Every minute
    return () => clearInterval(interval);
  }, [pet.isSleeping, decayPetStats]);

  const handleAction = (action: string, callback: () => void) => {
    callback();
    setShowAction(action);
    setIsInteracting(true);
    setTimeout(() => {
      setShowAction(null);
      setIsInteracting(false);
    }, 1500);
  };

  const handleFeed = (food: { cost: number; hungerGain: number; happinessGain: number }) => {
    if (spendCoins(food.cost)) {
      // Custom feeding logic
      useWellMindStore.setState((state) => ({
        pet: {
          ...state.pet,
          hunger: Math.min(100, state.pet.hunger + food.hungerGain),
          happiness: Math.min(100, state.pet.happiness + food.happinessGain),
          lastFed: new Date(),
        },
      }));
      addPetExperience(5);
      setShowAction('feed');
      setIsInteracting(true);
      setTimeout(() => {
        setShowAction(null);
        setIsInteracting(false);
      }, 1500);
    }
  };

  const handlePlay = (game: { cost: number; happinessGain: number; energyLoss: number; expGain: number }) => {
    if (spendCoins(game.cost)) {
      useWellMindStore.setState((state) => ({
        pet: {
          ...state.pet,
          happiness: Math.min(100, state.pet.happiness + game.happinessGain),
          energy: Math.max(0, state.pet.energy - game.energyLoss),
          lastPlayed: new Date(),
        },
      }));
      addPetExperience(game.expGain);
      setShowAction('play');
      setIsInteracting(true);
      setTimeout(() => {
        setShowAction(null);
        setIsInteracting(false);
      }, 1500);
    }
  };

  const handleClean = () => {
    if (calmCoins < 5) {
      toast.error('Not enough coins!');
      return;
    }
    handleAction('clean', () => {
      cleanPet();
      toast.success('Squeaky clean!', { description: '+10 cleanliness, +5 happiness' });
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-5 shadow-card"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{pet.name}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Star className="w-3 h-3 text-honey" />
              <span>Level {pet.level}</span>
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-honey" 
                  initial={{ width: 0 }}
                  animate={{ width: `${expProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1 bg-honey/20 rounded-full">
              <Sparkles className="w-4 h-4 text-honey" />
              <span className="text-sm font-medium text-foreground">{calmCoins}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowShop(true)}
              className="h-8 w-8"
            >
              <ShoppingBag className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Pet Display - Using New BuddyCharacter */}
        <motion.div
          className="relative flex flex-col items-center justify-center py-6 bg-gradient-to-b from-primary/10 to-transparent rounded-xl mb-4 overflow-hidden"
        >
          {/* Buddy Character */}
          <BuddyCharacter 
            size="xl" 
            isInteracting={isInteracting}
            onClick={() => setShowChat(true)}
          />

          {/* Action Animation */}
          <AnimatePresence>
            {showAction && (
              <motion.div
                initial={{ scale: 0, opacity: 0, y: 20 }}
                animate={{ scale: 1.5, opacity: 1, y: -30 }}
                exit={{ scale: 0, opacity: 0, y: -60 }}
                className="absolute top-4 text-4xl"
              >
                {showAction === 'feed' && '🍪'}
                {showAction === 'play' && '⚽'}
                {showAction === 'clean' && '✨'}
                {showAction === 'sleep' && '😴'}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message */}
          <AnimatePresence mode="wait">
            <motion.p
              key={currentMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-muted-foreground text-center px-4 mt-4"
            >
              "{messages[currentMessage]}"
            </motion.p>
          </AnimatePresence>

          {/* Tap to chat hint */}
          <motion.p
            className="text-xs text-primary/60 mt-2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Tap to chat with {pet.name}
          </motion.p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatBar icon={Heart} color="text-coral" label="Happy" value={pet.happiness} />
          <StatBar icon={Zap} color="text-honey" label="Energy" value={pet.energy} />
          <StatBar icon={Cookie} color="text-primary" label="Hunger" value={pet.hunger} />
          <StatBar icon={Droplets} color="text-sky" label="Clean" value={pet.cleanliness} />
        </div>

        {/* Actions */}
        {pet.isSleeping ? (
          <Button
            onClick={() => handleAction('wake', wakePet)}
            className="w-full"
            variant="secondary"
          >
            <Sun className="w-4 h-4 mr-2" />
            Wake Up
          </Button>
        ) : (
          <div className="grid grid-cols-5 gap-2">
            <ActionButton
              icon="🍪"
              label="Feed"
              onClick={() => setShowFoodMenu(true)}
            />
            <ActionButton
              icon="🎮"
              label="Play"
              onClick={() => setShowGamesMenu(true)}
            />
            <ActionButton
              icon="✨"
              label="Clean"
              cost={5}
              disabled={calmCoins < 5}
              onClick={handleClean}
            />
            <ActionButton
              icon="💬"
              label="Talk"
              onClick={() => setShowChat(true)}
            />
            <ActionButton
              icon="😴"
              label="Sleep"
              onClick={() => handleAction('sleep', () => {
                putPetToSleep();
                toast.success('Sweet dreams!');
              })}
            />
          </div>
        )}

        {calmCoins < 3 && !pet.isSleeping && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            Earn more coins by checking in daily!
          </p>
        )}
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showShop && <PetShop onClose={() => setShowShop(false)} />}
        {showFoodMenu && (
          <FoodMenu 
            onClose={() => setShowFoodMenu(false)} 
            onFeed={handleFeed}
          />
        )}
        {showGamesMenu && (
          <GamesMenu 
            onClose={() => setShowGamesMenu(false)} 
            onPlay={handlePlay}
          />
        )}
        {showChat && <MindBuddyChat onClose={() => setShowChat(false)} />}
      </AnimatePresence>
    </>
  );
};

const StatBar = ({ 
  icon: Icon, 
  color, 
  label, 
  value 
}: { 
  icon: React.ElementType; 
  color: string; 
  label: string; 
  value: number;
}) => (
  <div className="flex items-center gap-2">
    <Icon className={`w-4 h-4 ${color}`} />
    <div className="flex-1">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground font-medium">{value}%</span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  </div>
);

const ActionButton = ({
  icon,
  label,
  cost,
  disabled,
  onClick,
}: {
  icon: string;
  label: string;
  cost?: number;
  disabled?: boolean;
  onClick: () => void;
}) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    disabled={disabled}
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
      disabled 
        ? 'opacity-50 bg-muted border-border cursor-not-allowed' 
        : 'bg-card border-border hover:border-primary/50 hover:bg-primary/5 active:bg-primary/10'
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span className="text-[10px] text-muted-foreground">{label}</span>
    {cost !== undefined && cost > 0 && (
      <span className="text-[10px] text-honey">{cost}🪙</span>
    )}
  </motion.button>
);
