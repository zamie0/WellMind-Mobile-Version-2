import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onClose: () => void;
  onComplete: (score: number) => void;
}

const INTERVAL = 900;

export const TapRhythmGame = ({ onClose, onComplete }: Props) => {
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [taps, setTaps] = useState(0);
  const lastBeat = useRef<number>(0);

  useEffect(() => {
    if (!running) return;
    lastBeat.current = Date.now();
    setPulse(true);
    const t = setInterval(() => {
      lastBeat.current = Date.now();
      setPulse(true);
      setTimeout(() => setPulse(false), 200);
    }, INTERVAL);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (taps >= 20) setRunning(false);
  }, [taps]);

  const tap = () => {
    if (!running) return;
    const diff = Math.abs(Date.now() - lastBeat.current);
    const wrap = Math.min(diff, INTERVAL - diff);
    if (wrap < 150) {
      setScore((s) => s + 2);
      setFeedback('Perfect!');
    } else if (wrap < 300) {
      setScore((s) => s + 1);
      setFeedback('Good');
    } else {
      setFeedback('Off');
    }
    setTaps((t) => t + 1);
    setTimeout(() => setFeedback(''), 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background bg-gradient-to-b from-coral/10 to-background overflow-y-auto"
    >
      <div className="flex items-center justify-between p-4">
        <div>
          <p className="text-2xl font-bold text-foreground">{score}</p>
          <p className="text-xs text-muted-foreground">{taps}/20 taps</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center h-[calc(100vh-180px)] px-6">
        <h2 className="text-xl font-bold text-foreground mb-1">Tap Rhythm</h2>
        <p className="text-sm text-muted-foreground mb-8">Tap on every beat</p>
        {!running && taps === 0 && (
          <Button size="lg" onClick={() => setRunning(true)}>Start</Button>
        )}
        {running && (
          <>
            <motion.button
              onClick={tap}
              animate={{ scale: pulse ? 1.2 : 1 }}
              transition={{ duration: 0.2 }}
              className="w-48 h-48 rounded-full bg-coral/40 active:bg-coral/60 shadow-card flex items-center justify-center text-5xl"
            >
              🥁
            </motion.button>
            <p className="mt-6 text-lg font-semibold text-foreground h-6">{feedback}</p>
          </>
        )}
        {!running && taps > 0 && (
          <div className="text-center">
            <p className="text-lg font-semibold mb-3">Score: {score}</p>
            <Button onClick={() => onComplete(Math.min(score, 15))}>
              Collect +{Math.min(score, 15)}
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
