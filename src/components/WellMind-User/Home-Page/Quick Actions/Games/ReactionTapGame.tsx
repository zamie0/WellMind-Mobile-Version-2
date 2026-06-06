import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onClose: () => void;
  onComplete: (score: number) => void;
}

type Phase = 'idle' | 'waiting' | 'go' | 'result' | 'tooSoon';

export const ReactionTapGame = ({ onClose, onComplete }: Props) => {
  const [phase, setPhase] = useState<Phase>('idle');
  const [time, setTime] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const startRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const start = () => {
    setPhase('waiting');
    const delay = 1000 + Math.random() * 3000;
    timerRef.current = window.setTimeout(() => {
      startRef.current = Date.now();
      setPhase('go');
    }, delay);
  };

  const tap = () => {
    if (phase === 'waiting') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPhase('tooSoon');
      return;
    }
    if (phase === 'go') {
      const ms = Date.now() - startRef.current;
      setTime(ms);
      setBest((b) => (b === null || ms < b ? ms : b));
      setScores((s) => [...s, ms]);
      setRound((r) => r + 1);
      setPhase('result');
    }
  };

  const done = round >= 5;
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const score = avg > 0 ? Math.max(15 - Math.floor((avg - 200) / 60), 3) : 5;

  const bgClass =
    phase === 'go' ? 'bg-sage/60'
    : phase === 'waiting' ? 'bg-coral/40'
    : phase === 'tooSoon' ? 'bg-coral/60'
    : 'bg-muted';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background overflow-y-auto"
    >
      <div className="flex items-center justify-between p-4">
        <div>
          <p className="text-2xl font-bold text-foreground">Round {round}/5</p>
          <p className="text-xs text-muted-foreground">Best: {best ?? '—'} ms</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>
      <div className="flex flex-col items-center px-6">
        <h2 className="text-xl font-bold text-foreground mb-1">Reaction Tap</h2>
        <p className="text-sm text-muted-foreground mb-6">Tap when the screen turns green</p>
        {!done ? (
          <>
            <button
              onClick={phase === 'idle' || phase === 'result' || phase === 'tooSoon' ? start : tap}
              className={`w-72 h-72 rounded-3xl flex items-center justify-center text-2xl font-bold text-foreground transition-colors ${bgClass}`}
            >
              {phase === 'idle' && 'Tap to start'}
              {phase === 'waiting' && 'Wait...'}
              {phase === 'go' && 'TAP!'}
              {phase === 'result' && `${time} ms — Next`}
              {phase === 'tooSoon' && 'Too soon — Retry'}
            </button>
          </>
        ) : (
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Average: {avg} ms</p>
            <Button onClick={() => onComplete(score)}>Collect +{score}</Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
