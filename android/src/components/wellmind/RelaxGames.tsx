import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2 } from 'lucide-react';
import { useWellMindStore } from '@/stores/wellmindStore';
import { toast } from 'sonner';
import { BubblePopGame } from './games/BubblePopGame';
import { BreathingGame } from './games/BreathingGame';
import { ColorMatchGame } from './games/ColorMatchGame';
import { ZenGardenGame } from './games/ZenGardenGame';

type GameType = 'bubble' | 'breathing' | 'color' | 'zen' | null;

const games = [
  {
    id: 'bubble' as const,
    name: 'Bubble Pop',
    emoji: '🫧',
    description: 'Pop bubbles to release stress',
    color: 'from-primary/20 to-primary/10',
  },
  {
    id: 'breathing' as const,
    name: 'Breathing Sync',
    emoji: '🌬️',
    description: 'Follow the rhythm to calm down',
    color: 'from-honey/20 to-honey/10',
  },
  {
    id: 'color' as const,
    name: 'Color Zen',
    emoji: '🎨',
    description: 'Match colors mindfully',
    color: 'from-lavender/20 to-lavender/10',
  },
  {
    id: 'zen' as const,
    name: 'Zen Garden',
    emoji: '🪨',
    description: 'Create peaceful patterns',
    color: 'from-sage/20 to-sage/10',
  },
];

export const RelaxGames = () => {
  const [activeGame, setActiveGame] = useState<GameType>(null);
  const { addCoins } = useWellMindStore();

  const handleGameComplete = (score: number) => {
    const coinsEarned = Math.min(score, 15);
    addCoins(coinsEarned);
    toast.success(`+${coinsEarned} Calm Coins earned!`, {
      description: 'Great job relaxing!',
    });
    setActiveGame(null);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Relaxation Games</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {games.map((game, index) => (
            <motion.button
              key={game.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveGame(game.id)}
              className={`bg-gradient-to-br ${game.color} rounded-xl p-4 text-left shadow-soft border border-border/50`}
            >
              <span className="text-3xl mb-2 block">{game.emoji}</span>
              <h3 className="font-medium text-foreground text-sm">{game.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{game.description}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Game Modals */}
      <AnimatePresence>
        {activeGame === 'bubble' && (
          <BubblePopGame
            onClose={() => setActiveGame(null)}
            onComplete={handleGameComplete}
          />
        )}
        {activeGame === 'breathing' && (
          <BreathingGame
            onClose={() => setActiveGame(null)}
            onComplete={handleGameComplete}
          />
        )}
        {activeGame === 'color' && (
          <ColorMatchGame
            onClose={() => setActiveGame(null)}
            onComplete={handleGameComplete}
          />
        )}
        {activeGame === 'zen' && (
          <ZenGardenGame
            onClose={() => setActiveGame(null)}
            onComplete={handleGameComplete}
          />
        )}
      </AnimatePresence>
    </>
  );
};
