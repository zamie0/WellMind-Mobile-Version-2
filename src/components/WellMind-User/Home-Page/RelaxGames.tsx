import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { useWellMindStore } from '@/stores/wellmindStore';
import { toast } from 'sonner';
import { BubblePopGame } from './Quick Actions/Games/BubblePopGame';
import { BreathingGame } from './Quick Actions/Games/BreathingGame';
import { ColorMatchGame } from './Quick Actions/Games/ColorMatchGame';
import { ZenGardenGame } from './Quick Actions/Games/ZenGardenGame';
import { BlockPuzzleGame } from './Quick Actions/Games/BlockPuzzleGame';
import { MemoryMatchGame } from './Quick Actions/Games/MemoryMatchGame';
import { NumberFlowGame } from './Quick Actions/Games/NumberFlowGame';
import { PatternTraceGame } from './Quick Actions/Games/PatternTraceGame';
import { WordCalmGame } from './Quick Actions/Games/WordCalmGame';
import { TapRhythmGame } from './Quick Actions/Games/TapRhythmGame';
import { SlidingPuzzleGame } from './Quick Actions/Games/SlidingPuzzleGame';
import { ReactionTapGame } from './Quick Actions/Games/ReactionTapGame';
import { TicTacZenGame } from './Quick Actions/Games/TicTacZenGame';
import { MathCalmGame } from './Quick Actions/Games/MathCalmGame';
import { DotConnectGame } from './Quick Actions/Games/DotConnectGame';
import { FallingLeavesGame } from './Quick Actions/Games/FallingLeavesGame';

type GameType =
  | 'bubble' | 'breathing' | 'color' | 'zen' | 'block' | 'memory'
  | 'number' | 'pattern' | 'word' | 'rhythm'
  | 'sliding' | 'reaction' | 'tictac' | 'math' | 'dots' | 'leaves'
  | null;

const games = [
  { id: 'bubble' as const, name: 'Bubble Pop', emoji: '🫧', description: 'Pop bubbles to release stress', color: 'from-primary/20 to-primary/10' },
  { id: 'breathing' as const, name: 'Breathing Sync', emoji: '🌬️', description: 'Follow the rhythm to calm down', color: 'from-honey/20 to-honey/10' },
  { id: 'color' as const, name: 'Color Zen', emoji: '🎨', description: 'Match colors mindfully', color: 'from-lavender/20 to-lavender/10' },
  { id: 'zen' as const, name: 'Zen Garden', emoji: '🪨', description: 'Create peaceful patterns', color: 'from-sage/20 to-sage/10' },
  { id: 'block' as const, name: 'Block Puzzle', emoji: '🧱', description: 'Place blocks, clear lines', color: 'from-primary/20 to-sage/10' },
  { id: 'memory' as const, name: 'Memory Match', emoji: '🃏', description: 'Find all matching pairs', color: 'from-coral/20 to-coral/10' },
  { id: 'number' as const, name: 'Number Flow', emoji: '🔢', description: 'Tap numbers in order', color: 'from-honey/20 to-coral/10' },
  { id: 'pattern' as const, name: 'Pattern Trace', emoji: '✨', description: 'Repeat the sequence', color: 'from-lavender/20 to-primary/10' },
  { id: 'word' as const, name: 'Word Calm', emoji: '🔤', description: 'Unscramble calming words', color: 'from-sage/20 to-honey/10' },
  { id: 'rhythm' as const, name: 'Tap Rhythm', emoji: '🥁', description: 'Tap on every beat', color: 'from-coral/20 to-lavender/10' },
  { id: 'sliding' as const, name: 'Sliding Puzzle', emoji: '🧩', description: 'Slide tiles into order', color: 'from-sage/20 to-primary/10' },
  { id: 'reaction' as const, name: 'Reaction Tap', emoji: '⚡', description: 'Tap when it turns green', color: 'from-honey/20 to-sage/10' },
  { id: 'tictac' as const, name: 'Tic-Tac-Zen', emoji: '🌿', description: 'Outsmart the calm AI', color: 'from-sage/20 to-lavender/10' },
  { id: 'math' as const, name: 'Math Calm', emoji: '➕', description: 'Quick mental math', color: 'from-honey/20 to-primary/10' },
  { id: 'dots' as const, name: 'Dot Connect', emoji: '🔗', description: 'Trace dots in order', color: 'from-lavender/20 to-coral/10' },
  { id: 'leaves' as const, name: 'Falling Leaves', emoji: '🍃', description: 'Catch the falling leaves', color: 'from-sage/20 to-honey/10' },
];

interface RelaxGamesSheetProps {
  open: boolean;
  onClose: () => void;
}

export const RelaxGamesSheet = ({ open, onClose }: RelaxGamesSheetProps) => {
  const [activeGame, setActiveGame] = useState<GameType>(null);
  const [showAll, setShowAll] = useState(false);
  const { addCoins } = useWellMindStore();

  const handleGameComplete = (score: number) => {
    const coinsEarned = Math.min(score, 15);
    addCoins(coinsEarned);
    toast.success(`+${coinsEarned} Calm Coins earned!`, {
      description: 'Great job relaxing!',
    });
    setActiveGame(null);
  };

  const visible = showAll ? games : games.slice(0, 4);

  return (
    <>
      <AnimatePresence>
        {open && !activeGame && (
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
              className="w-full max-w-md bg-card rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Relaxation Games</h2>
                  <p className="text-sm text-muted-foreground">Pick a game to unwind</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {visible.map((game, index) => (
                  <motion.button
                    key={game.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.04 }}
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

              <button
                onClick={() => setShowAll((v) => !v)}
                className="mt-4 w-full flex items-center justify-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors py-3 rounded-xl bg-primary/5"
              >
                {showAll ? (
                  <>Show less <ChevronUp className="h-4 w-4" /></>
                ) : (
                  <>Show all {games.length} games <ChevronDown className="h-4 w-4" /></>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeGame === 'bubble' && <BubblePopGame onClose={() => setActiveGame(null)} onComplete={handleGameComplete} />}
        {activeGame === 'breathing' && <BreathingGame onClose={() => setActiveGame(null)} onComplete={handleGameComplete} />}
        {activeGame === 'color' && <ColorMatchGame onClose={() => setActiveGame(null)} onComplete={handleGameComplete} />}
        {activeGame === 'zen' && <ZenGardenGame onClose={() => setActiveGame(null)} onComplete={handleGameComplete} />}
        {activeGame === 'block' && <BlockPuzzleGame onClose={() => setActiveGame(null)} onComplete={handleGameComplete} />}
        {activeGame === 'memory' && <MemoryMatchGame onClose={() => setActiveGame(null)} onComplete={handleGameComplete} />}
        {activeGame === 'number' && <NumberFlowGame onClose={() => setActiveGame(null)} onComplete={handleGameComplete} />}
        {activeGame === 'pattern' && <PatternTraceGame onClose={() => setActiveGame(null)} onComplete={handleGameComplete} />}
        {activeGame === 'word' && <WordCalmGame onClose={() => setActiveGame(null)} onComplete={handleGameComplete} />}
        {activeGame === 'rhythm' && <TapRhythmGame onClose={() => setActiveGame(null)} onComplete={handleGameComplete} />}
        {activeGame === 'sliding' && <SlidingPuzzleGame onClose={() => setActiveGame(null)} onComplete={handleGameComplete} />}
        {activeGame === 'reaction' && <ReactionTapGame onClose={() => setActiveGame(null)} onComplete={handleGameComplete} />}
        {activeGame === 'tictac' && <TicTacZenGame onClose={() => setActiveGame(null)} onComplete={handleGameComplete} />}
        {activeGame === 'math' && <MathCalmGame onClose={() => setActiveGame(null)} onComplete={handleGameComplete} />}
        {activeGame === 'dots' && <DotConnectGame onClose={() => setActiveGame(null)} onComplete={handleGameComplete} />}
        {activeGame === 'leaves' && <FallingLeavesGame onClose={() => setActiveGame(null)} onComplete={handleGameComplete} />}
      </AnimatePresence>
    </>
  );
};
