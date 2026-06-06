import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWellMindStore } from '@/stores/wellmindStore';
import { toast } from 'sonner';

export interface Game {
  id: string;
  name: string;
  emoji: string;
  type: 'ball' | 'puzzle' | 'dance';
  happinessGain: number;
  energyLoss: number;
  expGain: number;
  description: string;
}

/* ---------------- Games (NO COST) - 20+ Options ---------------- */

const games: Game[] = [
  // Active Games (8)
  { 
    id: 'ball', 
    name: 'Play Ball', 
    emoji: '⚽', 
    type: 'ball', 
    happinessGain: 20, 
    energyLoss: 15, 
    expGain: 8,
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
    description: 'Throw and catch!'
  },
  { 
    id: 'fetch', 
    name: 'Fetch', 
    emoji: '🎾', 
    type: 'ball', 
    happinessGain: 22, 
    energyLoss: 18, 
    expGain: 9,
    description: 'Go get it!'
  },
  { 
    id: 'tag', 
    name: 'Tag', 
    emoji: '🏃', 
    type: 'ball', 
    happinessGain: 28, 
    energyLoss: 25, 
    expGain: 12,
    description: 'Chase & be chased!'
  },
  { 
    id: 'hideseek', 
    name: 'Hide & Seek', 
    emoji: '🙈', 
    type: 'ball', 
    happinessGain: 30, 
    energyLoss: 22, 
    expGain: 11,
    description: 'Find the best hiding spot!'
  },
  { 
    id: 'jumprope', 
    name: 'Jump Rope', 
    emoji: '🪢', 
    type: 'ball', 
    happinessGain: 18, 
    energyLoss: 20, 
    expGain: 10,
    description: 'Skip & bounce!'
  },
  { 
    id: 'swimming', 
    name: 'Swimming', 
    emoji: '🏊', 
    type: 'ball', 
    happinessGain: 32, 
    energyLoss: 28, 
    expGain: 14,
    description: 'Splash time!'
  },
  { 
    id: 'volleyball', 
    name: 'Volleyball', 
    emoji: '🏐', 
    type: 'ball', 
    happinessGain: 26, 
    energyLoss: 24, 
    expGain: 11,
    description: 'Spike it high!'
  },

  // Brain Games (8)
  { 
    id: 'puzzle', 
    name: 'Puzzle Time', 
    emoji: '🧩', 
    type: 'puzzle', 
    happinessGain: 25, 
    energyLoss: 8, 
    expGain: 15,
    description: 'Brain training fun!'
  },
  { 
    id: 'memory', 
    name: 'Memory Cards', 
    emoji: '🃏', 
    type: 'puzzle', 
    happinessGain: 22, 
    energyLoss: 6, 
    expGain: 12,
    description: 'Match the pairs!'
  },
  { 
    id: 'chess', 
    name: 'Chess', 
    emoji: '♟️', 
    type: 'puzzle', 
    happinessGain: 20, 
    energyLoss: 4, 
    expGain: 18,
    description: 'Tactical mastermind!'
  },
  { 
    id: 'sudoku', 
    name: 'Sudoku', 
    emoji: '🔢', 
    type: 'puzzle', 
    happinessGain: 18, 
    energyLoss: 5, 
    expGain: 16,
    description: 'Number challenge!'
  },
  { 
    id: 'trivia', 
    name: 'Trivia Quest', 
    emoji: '🧠', 
    type: 'puzzle', 
    happinessGain: 24, 
    energyLoss: 6, 
    expGain: 14,
    description: 'Test your knowledge!'
  },
  { 
    id: 'wordgame', 
    name: 'Word Game', 
    emoji: '📝', 
    type: 'puzzle', 
    happinessGain: 21, 
    energyLoss: 5, 
    expGain: 13,
    description: 'Word finding fun!'
  },
  { 
    id: 'blocks', 
    name: 'Block Puzzle', 
    emoji: '◻️', 
    type: 'puzzle', 
    happinessGain: 23, 
    energyLoss: 7, 
    expGain: 15,
    description: 'Stack and match!'
  },
  { 
    id: 'logic', 
    name: 'Logic Challenge', 
    emoji: '💡', 
    type: 'puzzle', 
    happinessGain: 26, 
    energyLoss: 8, 
    expGain: 17,
    description: 'Solve the riddle!'
  },

  // Fun & Dance (6)
  { 
    id: 'dance', 
    name: 'Dance Party', 
    emoji: '💃', 
    type: 'dance', 
    happinessGain: 35, 
    energyLoss: 25, 
    expGain: 12,
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
    description: 'Make some noise!'
  },
  { 
    id: 'karaoke', 
    name: 'Karaoke', 
    emoji: '🎤', 
    type: 'dance', 
    happinessGain: 32, 
    energyLoss: 16, 
    expGain: 11,
    description: 'Sing your heart out!'
  },
  { 
    id: 'gymnastics', 
    name: 'Gymnastics', 
    emoji: '🤸', 
    type: 'dance', 
    happinessGain: 28, 
    energyLoss: 22, 
    expGain: 13,
    description: 'Flip & spin!'
  },
  { 
    id: 'parkour', 
    name: 'Parkour', 
    emoji: '🏗️', 
    type: 'dance', 
    happinessGain: 33, 
    energyLoss: 26, 
    expGain: 14,
    description: 'Climb & jump!'
  },
  { 
    id: 'yoga', 
    name: 'Yoga Flow', 
    emoji: '🧘', 
    type: 'dance', 
    happinessGain: 25, 
    energyLoss: 12, 
    expGain: 9,
    description: 'Stretch & breathe!'
  },
];

interface GamesMenuProps {
  onClose: () => void;
  onPlay: (game: Game) => void;
}

export const GamesMenu = ({ onClose, onPlay }: GamesMenuProps) => {
  const { pet } = useWellMindStore();

  const categories = [
    { type: 'ball', label: 'Active Games', icon: '🏃', description: '8 exciting physical activities' },
    { type: 'puzzle', label: 'Brain Games', icon: '🧠', description: '8 challenging puzzles' },
    { type: 'dance', label: 'Fun & Dance', icon: '🎉', description: '6 dance & movement games' },
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
            <h2 className="text-xl font-bold text-foreground">
              Play with Your Buddy
            </h2>
            <p className="text-sm text-muted-foreground">
              Choose an activity!
            </p>
          </div>

          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Energy Warning */}
        {pet.energy < 30 && (
          <div className="bg-coral/10 border border-coral/30 rounded-xl p-3 mb-4">
            <p className="text-sm text-coral">
              ⚡ Your buddy is tired! Let them rest.
            </p>
          </div>
        )}

        {/* Games */}
        {categories.map(({ type, label, icon, description }) => (
          <div key={type} className="mb-6">
            <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
              <span>{icon}</span> {label}
            </h3>
            <p className="text-xs text-muted-foreground mb-3">{description}</p>

            <div className="space-y-2">
              {games
                .filter((game) => game.type === type)
                .map((game, index) => {
                  const canPlay = pet.energy >= game.energyLoss;

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
                            description: `+${game.happinessGain} 😊  +${game.expGain} XP`,
                          });

                          onClose();
                        } else {
                          toast.error('Not enough energy!');
                        }
                      }}
                      disabled={!canPlay}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border ${
                        canPlay
                          ? 'hover:bg-primary/5'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <span className="text-3xl">{game.emoji}</span>

                      <div className="flex-1 text-left">
                        <p className="font-medium">{game.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {game.description}
                        </p>

                        <div className="flex gap-3 mt-1 text-[10px]">
                          <span>+{game.happinessGain} 😊</span>
                          <span>-{game.energyLoss} ⚡</span>
                          <span>+{game.expGain} XP</span>
                        </div>
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