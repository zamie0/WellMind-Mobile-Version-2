import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onClose: () => void;
  onComplete: (score: number) => void;
}

interface Leaf { id: number; x: number; y: number; emoji: string; speed: number; }

const EMOJIS = ['🍃', '🍂', '🌿', '🌸'];

export const FallingLeavesGame = ({ onClose, onComplete }: Props) => {
  const [leaves, setLeaves] = useState<Leaf[]>([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30);
  const nextId = useRef(0);

  useEffect(() => {
    if (time <= 0) return;
    const t = setInterval(() => setTime((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [time]);

  useEffect(() => {
    if (time <= 0) return;
    const spawn = setInterval(() => {
      setLeaves((ls) => [
        ...ls,
        {
          id: nextId.current++,
          x: 5 + Math.random() * 90,
          y: -5,
          emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
          speed: 0.5 + Math.random() * 0.8,
        },
      ]);
    }, 700);
    return () => clearInterval(spawn);
  }, [time]);

  useEffect(() => {
    if (time <= 0) return;
    const tick = setInterval(() => {
      setLeaves((ls) =>
        ls.map((l) => ({ ...l, y: l.y + l.speed })).filter((l) => l.y < 110),
      );
    }, 40);
    return () => clearInterval(tick);
  }, [time]);

  const catchLeaf = (id: number) => {
    setLeaves((ls) => ls.filter((l) => l.id !== id));
    setScore((s) => s + 1);
  };

  const done = time <= 0;
  const reward = Math.min(score, 15);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background bg-gradient-to-b from-sage/30 to-background"
    >
      <div className="flex items-center justify-between p-4">
        <div>
          <p className="text-2xl font-bold text-foreground">{score}</p>
          <p className="text-xs text-muted-foreground">{time}s left</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
      </div>
      <div className="px-4">
        <h2 className="text-xl font-bold text-foreground text-center mb-1">Falling Leaves</h2>
        <p className="text-sm text-muted-foreground text-center mb-3">Tap leaves as they fall</p>
        <div className="relative w-full h-[60vh] bg-card/30 rounded-2xl overflow-hidden">
          {leaves.map((l) => (
            <button
              key={l.id}
              onClick={() => catchLeaf(l.id)}
              style={{ left: `${l.x}%`, top: `${l.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-3xl"
            >
              {l.emoji}
            </button>
          ))}
          {done && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
              <p className="text-lg font-semibold mb-3">Caught {score} leaves!</p>
              <Button onClick={() => onComplete(reward)}>Collect +{reward}</Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
