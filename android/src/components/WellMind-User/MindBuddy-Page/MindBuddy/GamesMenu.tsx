import { motion, AnimatePresence } from 'framer-motion';
import { X, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWellMindStore } from '@/stores/wellmindStore';
import { toast } from 'sonner';

interface Game {
  id: string;
  name: string;
  emoji: string;
  type: 'ball' | 'puzzle' | 'dance';
  happinessGain: number;
  energyLoss: number;
  expGain: number;
  cost: number;
  description: string;
}

const games: Game[] = [
  { 
    id: 'ball', 
    name: 'Play Ball', 
    emoji: '⚽', 
    type: 'ball', 
    happinessGain: 20, 
    energyLoss: 15, 
    expGain: 8,
    cost: 3,
    description: 'A fun game of catch!'
  },
  { 
    id: 'frisbee', 
    name: 'Frisbee', 
    emoji: '🥏', 
    type: 'ball', 
    happinessGain: 25, 
    energyLoss: 20, 
    expGain: 10,
    cost: 4,
    description: 'Throw and catch!'
  },
  { 
    id: 'puzzle', 
    name: 'Puzzle Time', 
    emoji: '🧩', 
    type: 'puzzle', 
    happinessGain: 25, 
    energyLoss: 8, 
    expGain: 15,
    cost: 5,
    description: 'Brain training fun!'
  },
  { 
    id: 'cards', 
    name: 'Memory Cards', 
    emoji: '🃏', 
    type: 'puzzle', 
    happinessGain: 22, 
    energyLoss: 6, 
    expGain: 12,
    cost: 4,
    description: 'Match the pairs!'
  },
  { 
    id: 'dance', 
    name: 'Dance Party', 
    emoji: '💃', 
    type: 'dance', 
    happinessGain: 35, 
    energyLoss: 25, 
    expGain: 12,
    cost: 8,
    description: 'Shake it off!'
  },
  { 
    id: 'music', 
    name: 'Music Jam', 
    emoji: '🎵', 
    type: 'dance', 
    happinessGain: 30, 
    energyLoss: 18, 
    expGain: 10,
    cost: 6,
    description: 'Make some noise!'
  },
];

interface GamesMenuProps {
  onClose: () => void;
  onPlay: (game: Game) => void;
}

export const GamesMenu = ({ onClose, onPlay }: GamesMenuProps) => {
  const { calmCoins, pet } = useWellMindStore();

  const categories = [
    { type: 'ball', label: 'Active Games', icon: '🏃' },
    { type: 'puzzle', label: 'Brain Games', icon: '🧠' },
    { type: 'dance', label: 'Fun & Dance', icon: '🎉' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-md bg-card rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Play with Your Buddy</h2>
            <p className="text-sm text-muted-foreground">Choose an activity!</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 px-3 py-1 bg-honey/20 rounded-full">
              <span className="text-honey">🪙</span>
              <span className="text-sm font-medium">{calmCoins}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Energy Warning */}
        {pet.energy < 30 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-coral/10 border border-coral/30 rounded-xl p-3 mb-4"
          >
            <p className="text-sm text-coral">
              ⚡ Your buddy is tired! Let them rest to regain energy.
            </p>
          </motion.div>
        )}

        {/* Games */}
        {categories.map(({ type, label, icon }) => (
          <div key={type} className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>{icon}</span> {label}
            </h3>
            <div className="space-y-2">
              {games
                .filter((game) => game.type === type)
                .map((game, index) => {
                  const canPlay = calmCoins >= game.cost && pet.energy >= game.energyLoss;
                  return (
                    <motion.button
                      key={game.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        if (canPlay) {
                          onPlay(game);
                          toast.success(`Playing ${game.name}!`, {
                            description: `+${game.happinessGain} happiness, +${game.expGain} XP`,
                          });
                          onClose();
                        } else if (calmCoins < game.cost) {
                          toast.error('Not enough coins!');
                        } else {
                          toast.error('Not enough energy!');
                        }
                      }}
                      disabled={!canPlay}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        canPlay
                          ? 'border-border hover:border-primary hover:bg-primary/5'
                          : 'opacity-50 cursor-not-allowed border-border'
                      }`}
                    >
                      <span className="text-3xl">{game.emoji}</span>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-foreground">{game.name}</p>
                        <p className="text-xs text-muted-foreground">{game.description}</p>
                        <div className="flex items-center gap-3 mt-1 text-[10px]">
                          <span className="text-primary">+{game.happinessGain} 😊</span>
                          <span className="text-coral">-{game.energyLoss} ⚡</span>
                          <span className="text-honey">+{game.expGain} XP</span>
                        </div>
                      </div>
                      <div className="text-sm text-honey flex items-center gap-1">
                        🪙 {game.cost}
                      </div>
                    </motion.button>
                  );
                })}
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};
