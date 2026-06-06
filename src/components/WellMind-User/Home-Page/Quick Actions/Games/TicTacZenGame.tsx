import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onClose: () => void;
  onComplete: (score: number) => void;
}

type Cell = '🌿' | '🌸' | null;
const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const checkWin = (b: Cell[]): Cell => {
  for (const [a, c, d] of LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  return null;
};

const aiMove = (b: Cell[]): number => {
  const empties = b.map((c, i) => (c === null ? i : -1)).filter((i) => i >= 0);
  for (const i of empties) {
    const test = [...b]; test[i] = '🌸';
    if (checkWin(test) === '🌸') return i;
  }
  for (const i of empties) {
    const test = [...b]; test[i] = '🌿';
    if (checkWin(test) === '🌿') return i;
  }
  if (b[4] === null) return 4;
  return empties[Math.floor(Math.random() * empties.length)];
};

export const TicTacZenGame = ({ onClose, onComplete }: Props) => {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<'user' | 'ai'>('user');
  const winner = checkWin(board);
  const full = board.every((c) => c !== null);
  const over = winner !== null || full;

  useEffect(() => {
    if (turn === 'ai' && !over) {
      const t = setTimeout(() => {
        const i = aiMove(board);
        const next = [...board]; next[i] = '🌸';
        setBoard(next);
        setTurn('user');
      }, 500);
      return () => clearTimeout(t);
    }
  }, [turn, board, over]);

  const tap = (i: number) => {
    if (board[i] || turn !== 'user' || over) return;
    const next = [...board]; next[i] = '🌿';
    setBoard(next);
    setTurn('ai');
  };

  const reset = () => { setBoard(Array(9).fill(null)); setTurn('user'); };
  const score = winner === '🌿' ? 10 : winner === null && full ? 5 : 3;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background bg-gradient-to-b from-sage/20 to-background overflow-y-auto"
    >
      <div className="flex items-center justify-between p-4">
        <div>
          <p className="text-2xl font-bold text-foreground">{turn === 'user' ? 'Your turn' : '...'}</p>
          <p className="text-xs text-muted-foreground">You are 🌿</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
      </div>
      <div className="flex flex-col items-center px-6 pb-8">
        <h2 className="text-xl font-bold text-foreground mb-1">Tic-Tac-Zen</h2>
        <p className="text-sm text-muted-foreground mb-6">Three in a row wins</p>
        <div className="grid grid-cols-3 gap-2 w-full max-w-xs mb-6">
          {board.map((c, i) => (
            <button
              key={i}
              onClick={() => tap(i)}
              className="aspect-square rounded-xl bg-card hover:bg-sage/20 text-4xl flex items-center justify-center shadow-soft"
            >
              {c}
            </button>
          ))}
        </div>
        {over && (
          <div className="text-center">
            <p className="text-lg font-semibold mb-3">
              {winner === '🌿' ? 'You win! 🎉' : winner === '🌸' ? 'AI wins' : 'Draw'}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={reset}>Play Again</Button>
              <Button onClick={() => onComplete(score)}>Collect +{score}</Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
