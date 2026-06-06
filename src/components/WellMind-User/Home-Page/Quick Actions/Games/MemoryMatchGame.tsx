import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onClose: () => void;
  onComplete: (score: number) => void;
}

const EMOJIS = ['🌿', '🌸', '🌊', '☀️', '🌙', '⭐', '🍃', '🌷'];

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

const shuffle = (): Card[] => {
  const pairs = [...EMOJIS, ...EMOJIS]
    .map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }))
    .sort(() => Math.random() - 0.5);
  return pairs;
};

export const MemoryMatchGame = ({ onClose, onComplete }: Props) => {
  const [cards, setCards] = useState<Card[]>(shuffle);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const won = cards.every((c) => c.matched);

  useEffect(() => {
    if (flipped.length === 2) {
      const [a, b] = flipped;
      setMoves((m) => m + 1);
      const match = cards[a].emoji === cards[b].emoji;
      setTimeout(() => {
        setCards((cs) =>
          cs.map((c, i) =>
            i === a || i === b
              ? { ...c, matched: match || c.matched, flipped: match }
              : c,
          ),
        );
        setFlipped([]);
      }, 700);
    }
  }, [flipped, cards]);

  const flip = (i: number) => {
    if (flipped.length === 2 || cards[i].flipped || cards[i].matched) return;
    setCards((cs) => cs.map((c, idx) => (idx === i ? { ...c, flipped: true } : c)));
    setFlipped((f) => [...f, i]);
  };

  const score = won ? Math.max(15 - Math.floor(moves / 2), 5) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background bg-gradient-to-b from-coral/10 to-background overflow-y-auto"
    >
      <div className="flex items-center justify-between p-4">
        <div>
          <p className="text-2xl font-bold text-foreground">{moves}</p>
          <p className="text-xs text-muted-foreground">moves</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>
      <div className="flex flex-col items-center px-6 pb-8">
        <h2 className="text-xl font-bold text-foreground mb-1">Memory Match</h2>
        <p className="text-sm text-muted-foreground mb-6">Find all pairs</p>
        <div className="grid grid-cols-4 gap-3 w-full max-w-sm mb-6">
          {cards.map((c, i) => (
            <button
              key={c.id}
              onClick={() => flip(i)}
              className={`aspect-square rounded-xl flex items-center justify-center text-3xl shadow-soft transition-all ${
                c.flipped || c.matched ? 'bg-card' : 'bg-primary/20 hover:bg-primary/30'
              } ${c.matched ? 'opacity-50' : ''}`}
            >
              {(c.flipped || c.matched) && c.emoji}
            </button>
          ))}
        </div>
        {won ? (
          <div className="text-center">
            <p className="text-lg font-semibold mb-3">Well done! 🎉</p>
            <Button onClick={() => onComplete(score)}>Collect +{score}</Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setCards(shuffle())}>Restart</Button>
        )}
      </div>
    </motion.div>
  );
};
