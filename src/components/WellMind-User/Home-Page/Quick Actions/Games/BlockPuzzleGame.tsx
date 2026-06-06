import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onClose: () => void;
  onComplete: (score: number) => void;
}

const GRID = 8;

type Cell = 0 | 1;
type Shape = number[][];

const SHAPES: Shape[] = [
  [[1, 1, 1]],
  [[1, 1], [1, 1]],
  [[1, 1, 1, 1]],
  [[1, 0], [1, 1]],
  [[1, 1, 1], [0, 1, 0]],
  [[1]],
  [[1, 1], [1, 0]],
];

const emptyBoard = (): Cell[][] =>
  Array.from({ length: GRID }, () => Array<Cell>(GRID).fill(0));

const randomShapes = (): Shape[] =>
  Array.from({ length: 3 }, () => SHAPES[Math.floor(Math.random() * SHAPES.length)]);

export const BlockPuzzleGame = ({ onClose, onComplete }: Props) => {
  const [board, setBoard] = useState<Cell[][]>(emptyBoard);
  const [tray, setTray] = useState<Shape[]>(randomShapes);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const canPlace = (shape: Shape, r: number, c: number, b: Cell[][]) => {
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (!shape[i][j]) continue;
        const nr = r + i, nc = c + j;
        if (nr >= GRID || nc >= GRID || b[nr][nc]) return false;
      }
    }
    return true;
  };

  const anyPlaceable = (shapes: Shape[], b: Cell[][]) =>
    shapes.some((s) => {
      for (let r = 0; r < GRID; r++)
        for (let c = 0; c < GRID; c++)
          if (canPlace(s, r, c, b)) return true;
      return false;
    });

  const handleCellClick = useCallback(
    (r: number, c: number) => {
      if (selected === null || !tray[selected]) return;
      const shape = tray[selected];
      if (!canPlace(shape, r, c, board)) return;

      const next = board.map((row) => [...row]) as Cell[][];
      let placed = 0;
      shape.forEach((row, i) =>
        row.forEach((v, j) => {
          if (v) {
            next[r + i][c + j] = 1;
            placed++;
          }
        }),
      );

      // Clear full rows/cols
      let cleared = 0;
      for (let i = 0; i < GRID; i++) {
        if (next[i].every((v) => v)) {
          next[i] = Array<Cell>(GRID).fill(0);
          cleared++;
        }
      }
      for (let j = 0; j < GRID; j++) {
        if (next.every((row) => row[j])) {
          next.forEach((row) => (row[j] = 0));
          cleared++;
        }
      }

      const newTray = [...tray];
      newTray[selected] = [];
      const refilled = newTray.every((s) => s.length === 0) ? randomShapes() : newTray;

      setBoard(next);
      setTray(refilled);
      setSelected(null);
      setScore((s) => s + placed + cleared * 10);

      if (!anyPlaceable(refilled.filter((s) => s.length > 0), next)) {
        setGameOver(true);
      }
    },
    [selected, tray, board],
  );

  const reset = () => {
    setBoard(emptyBoard());
    setTray(randomShapes());
    setScore(0);
    setSelected(null);
    setGameOver(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background bg-gradient-to-b from-sage/20 to-background overflow-y-auto"
    >
      <div className="flex items-center justify-between p-4">
        <div>
          <p className="text-2xl font-bold text-foreground">{score}</p>
          <p className="text-xs text-muted-foreground">points</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex flex-col items-center px-4 pb-8">
        <h2 className="text-xl font-bold text-foreground mb-1">Block Puzzle</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Tap a piece, then tap a spot on the board
        </p>

        <div
          className="grid gap-1 bg-card p-2 rounded-xl shadow-soft mb-6"
          style={{ gridTemplateColumns: `repeat(${GRID}, minmax(0, 1fr))` }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`w-8 h-8 rounded-md transition-colors ${
                  cell ? 'bg-primary' : 'bg-muted hover:bg-primary/20'
                }`}
              />
            )),
          )}
        </div>

        <div className="flex gap-3 mb-6">
          {tray.map((shape, i) =>
            shape.length === 0 ? (
              <div key={i} className="w-20 h-20" />
            ) : (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`p-2 rounded-xl border-2 ${
                  selected === i ? 'border-primary bg-primary/10' : 'border-border'
                }`}
              >
                <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${shape[0].length}, minmax(0, 1fr))` }}>
                  {shape.flatMap((row, ri) =>
                    row.map((v, ci) => (
                      <div
                        key={`${ri}-${ci}`}
                        className={`w-4 h-4 rounded-sm ${v ? 'bg-primary' : 'bg-transparent'}`}
                      />
                    )),
                  )}
                </div>
              </button>
            ),
          )}
        </div>

        {gameOver && (
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">No more moves!</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={reset}>Play Again</Button>
              <Button onClick={() => onComplete(Math.floor(score / 10))}>Collect Reward</Button>
            </div>
          </div>
        )}
        {!gameOver && (
          <Button variant="outline" onClick={() => onComplete(Math.floor(score / 10))}>
            Finish & Collect
          </Button>
        )}
      </div>
    </motion.div>
  );
};
