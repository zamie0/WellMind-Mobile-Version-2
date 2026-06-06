import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onClose: () => void;
  onComplete: (score: number) => void;
}

const makeNumbers = (count: number) => {
  const nums = Array.from({ length: count }, (_, i) => i + 1);
  return nums.sort(() => Math.random() - 0.5);
};

export const NumberFlowGame = ({ onClose, onComplete }: Props) => {
  const [count, setCount] = useState(9);
  const [nums, setNums] = useState<number[]>(makeNumbers(9));
  const [next, setNext] = useState(1);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const tap = (n: number) => {
    if (n !== next) return;
    if (n === count) {
      setRunning(false);
      setDone(true);
    } else {
      setNext(n + 1);
    }
  };

  const nextLevel = () => {
    const c = count + 3;
    setCount(c);
    setNums(makeNumbers(c));
    setNext(1);
    setTime(0);
    setRunning(true);
    setDone(false);
  };

  const score = Math.max(15 - Math.floor(time / 5), 3);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background bg-gradient-to-b from-honey/10 to-background overflow-y-auto"
    >
      <div className="flex items-center justify-between p-4">
        <div>
          <p className="text-2xl font-bold text-foreground">{time}s</p>
          <p className="text-xs text-muted-foreground">Next: {next}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>
      <div className="flex flex-col items-center px-6 pb-8">
        <h2 className="text-xl font-bold text-foreground mb-1">Number Flow</h2>
        <p className="text-sm text-muted-foreground mb-6">Tap numbers in order, 1 → {count}</p>
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm mb-6">
          {nums.map((n) => (
            <button
              key={n}
              onClick={() => tap(n)}
              disabled={n < next}
              className={`aspect-square rounded-xl text-2xl font-bold shadow-soft transition-all ${
                n < next ? 'bg-muted text-muted-foreground' : 'bg-honey/30 hover:bg-honey/50 text-foreground'
              }`}
            >
              {n >= next ? n : '✓'}
            </button>
          ))}
        </div>
        {done ? (
          <div className="text-center">
            <p className="text-lg font-semibold mb-3">Done in {time}s! 🎯</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={nextLevel}>Next Level</Button>
              <Button onClick={() => onComplete(score)}>Collect +{score}</Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" onClick={nextLevel}>Skip</Button>
        )}
      </div>
    </motion.div>
  );
};
