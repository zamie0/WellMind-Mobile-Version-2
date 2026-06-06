import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onClose: () => void;
  onComplete: (score: number) => void;
}

const SIZE = 9;

export const PatternTraceGame = ({ onClose, onComplete }: Props) => {
  const [pattern, setPattern] = useState<number[]>([]);
  const [user, setUser] = useState<number[]>([]);
  const [showing, setShowing] = useState(true);
  const [round, setRound] = useState(1);
  const [active, setActive] = useState<number | null>(null);
  const [over, setOver] = useState(false);

  const newRound = (length: number) => {
    const p = Array.from({ length }, () => Math.floor(Math.random() * SIZE));
    setPattern(p);
    setUser([]);
    setShowing(true);
  };

  useEffect(() => {
    newRound(round + 2);
  }, [round]);

  useEffect(() => {
    if (!showing || pattern.length === 0) return;
    let i = 0;
    const interval = setInterval(() => {
      setActive(pattern[i]);
      setTimeout(() => setActive(null), 400);
      i++;
      if (i >= pattern.length) {
        clearInterval(interval);
        setTimeout(() => setShowing(false), 500);
      }
    }, 700);
    return () => clearInterval(interval);
  }, [showing, pattern]);

  const tap = (i: number) => {
    if (showing || over) return;
    const nextUser = [...user, i];
    if (pattern[nextUser.length - 1] !== i) {
      setOver(true);
      return;
    }
    setUser(nextUser);
    if (nextUser.length === pattern.length) {
      setTimeout(() => setRound((r) => r + 1), 600);
    }
  };

  const reset = () => {
    setRound(1);
    setOver(false);
    newRound(3);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background bg-gradient-to-b from-lavender/20 to-background overflow-y-auto"
    >
      <div className="flex items-center justify-between p-4">
        <div>
          <p className="text-2xl font-bold text-foreground">Round {round}</p>
          <p className="text-xs text-muted-foreground">{showing ? 'Watch...' : 'Your turn'}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>
      <div className="flex flex-col items-center px-6 pb-8">
        <h2 className="text-xl font-bold text-foreground mb-1">Pattern Trace</h2>
        <p className="text-sm text-muted-foreground mb-6">Repeat the sequence</p>
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs mb-6">
          {Array.from({ length: SIZE }).map((_, i) => (
            <button
              key={i}
              onClick={() => tap(i)}
              className={`aspect-square rounded-xl transition-all ${
                active === i ? 'bg-lavender scale-95' : 'bg-lavender/20 hover:bg-lavender/40'
              }`}
            />
          ))}
        </div>
        {over ? (
          <div className="text-center">
            <p className="text-lg font-semibold mb-3">Reached round {round}</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={reset}>Try Again</Button>
              <Button onClick={() => onComplete(Math.min(round * 2, 15))}>
                Collect +{Math.min(round * 2, 15)}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
};
