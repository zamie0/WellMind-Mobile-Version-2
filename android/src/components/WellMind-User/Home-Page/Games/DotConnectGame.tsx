import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onClose: () => void;
  onComplete: (score: number) => void;
}

interface Dot { id: number; x: number; y: number; }

const makeDots = (count: number): Dot[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
  }));

export const DotConnectGame = ({ onClose, onComplete }: Props) => {
  const [level, setLevel] = useState(1);
  const [dots, setDots] = useState<Dot[]>(() => makeDots(6));
  const [tapped, setTapped] = useState<number[]>([]);
  const [over, setOver] = useState(false);

  const lines = useMemo(() => {
    const pairs: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < tapped.length - 1; i++) {
      const a = dots.find((d) => d.id === tapped[i])!;
      const b = dots.find((d) => d.id === tapped[i + 1])!;
      pairs.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
    }
    return pairs;
  }, [tapped, dots]);

  const tap = (id: number) => {
    if (over) return;
    const expected = tapped.length + 1;
    if (id !== expected) {
      setOver(true);
      return;
    }
    const next = [...tapped, id];
    setTapped(next);
    if (next.length === dots.length) {
      setOver(true);
    }
  };

  const won = tapped.length === dots.length;
  const score = won ? Math.min(level * 3, 15) : Math.max(tapped.length, 2);

  const nextLevel = () => {
    const l = level + 1;
    setLevel(l);
    setDots(makeDots(6 + l));
    setTapped([]);
    setOver(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background bg-gradient-to-b from-lavender/20 to-background overflow-y-auto"
    >
      <div className="flex items-center justify-between p-4">
        <div>
          <p className="text-2xl font-bold text-foreground">Level {level}</p>
          <p className="text-xs text-muted-foreground">Next: {tapped.length + 1}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
      </div>
      <div className="flex flex-col items-center px-6 pb-8">
        <h2 className="text-xl font-bold text-foreground mb-1">Dot Connect</h2>
        <p className="text-sm text-muted-foreground mb-6">Tap dots 1 → {dots.length} in order</p>
        <div className="relative w-full max-w-sm aspect-square bg-card rounded-2xl shadow-soft overflow-hidden mb-6">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {lines.map((l, i) => (
              <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="hsl(var(--primary))" strokeWidth="0.6" />
            ))}
          </svg>
          {dots.map((d) => {
            const done = tapped.includes(d.id);
            return (
              <button
                key={d.id}
                onClick={() => tap(d.id)}
                style={{ left: `${d.x}%`, top: `${d.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full text-sm font-bold flex items-center justify-center transition-all ${
                  done ? 'bg-primary text-primary-foreground' : 'bg-lavender/40 text-foreground hover:bg-lavender/60'
                }`}
              >
                {d.id}
              </button>
            );
          })}
        </div>
        {over && (
          <div className="text-center">
            <p className="text-lg font-semibold mb-3">{won ? 'Complete! 🎉' : 'Wrong order'}</p>
            <div className="flex gap-3">
              {won && <Button variant="outline" onClick={nextLevel}>Next Level</Button>}
              {!won && <Button variant="outline" onClick={() => { setTapped([]); setOver(false); }}>Retry</Button>}
              <Button onClick={() => onComplete(score)}>Collect +{score}</Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
