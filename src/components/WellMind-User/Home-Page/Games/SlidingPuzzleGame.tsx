import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onClose: () => void;
  onComplete: (score: number) => void;
}

const SIZE = 3;
const TOTAL = SIZE * SIZE;

const solved = () => Array.from({ length: TOTAL }, (_, i) => (i + 1) % TOTAL);

const shuffle = (): number[] => {
  const arr = solved();
  for (let i = 0; i < 80; i++) {
    const zero = arr.indexOf(0);
    const neighbors: number[] = [];
    const r = Math.floor(zero / SIZE), c = zero % SIZE;
    if (r > 0) neighbors.push(zero - SIZE);
    if (r < SIZE - 1) neighbors.push(zero + SIZE);
    if (c > 0) neighbors.push(zero - 1);
    if (c < SIZE - 1) neighbors.push(zero + 1);
    const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
    [arr[zero], arr[pick]] = [arr[pick], arr[zero]];
  }
  return arr;
};

export const SlidingPuzzleGame = ({ onClose, onComplete }: Props) => {
  const [tiles, setTiles] = useState<number[]>(shuffle);
  const [moves, setMoves] = useState(0);
  const won = tiles.every((v, i) => v === (i + 1) % TOTAL);

  const move = (i: number) => {
    if (won) return;
    const zero = tiles.indexOf(0);
    const r1 = Math.floor(i / SIZE), c1 = i % SIZE;
    const r2 = Math.floor(zero / SIZE), c2 = zero % SIZE;
    if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) return;
    const next = [...tiles];
    [next[i], next[zero]] = [next[zero], next[i]];
    setTiles(next);
    setMoves((m) => m + 1);
  };

  const score = won ? Math.max(15 - Math.floor(moves / 10), 5) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background bg-gradient-to-b from-sage/20 to-background overflow-y-auto"
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
        <h2 className="text-xl font-bold text-foreground mb-1">Sliding Puzzle</h2>
        <p className="text-sm text-muted-foreground mb-6">Arrange 1 → 8 in order</p>
        <div
          className="grid gap-2 bg-card p-3 rounded-2xl shadow-soft mb-6"
          style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
        >
          {tiles.map((v, i) => (
            <button
              key={i}
              onClick={() => move(i)}
              className={`w-20 h-20 rounded-xl text-2xl font-bold transition-all ${
                v === 0 ? 'bg-transparent' : 'bg-sage/30 hover:bg-sage/50 text-foreground shadow-soft'
              }`}
            >
              {v !== 0 && v}
            </button>
          ))}
        </div>
        {won ? (
          <div className="text-center">
            <p className="text-lg font-semibold mb-3">Solved! 🎉</p>
            <Button onClick={() => onComplete(score)}>Collect +{score}</Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setTiles(shuffle()); setMoves(0); }}>Shuffle</Button>
            <Button variant="ghost" onClick={() => onComplete(0)}>Finish</Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
