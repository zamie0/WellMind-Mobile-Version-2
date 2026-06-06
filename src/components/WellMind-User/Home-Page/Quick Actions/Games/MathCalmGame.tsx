import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onClose: () => void;
  onComplete: (score: number) => void;
}

const makeQuestion = () => {
  const ops = ['+', '-', '×'] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];
  const a = Math.floor(Math.random() * 12) + 1;
  const b = Math.floor(Math.random() * 12) + 1;
  const correct = op === '+' ? a + b : op === '-' ? a - b : a * b;
  const options = new Set<number>([correct]);
  while (options.size < 4) {
    options.add(correct + Math.floor(Math.random() * 11) - 5);
  }
  return {
    text: `${a} ${op} ${b}`,
    correct,
    options: Array.from(options).sort(() => Math.random() - 0.5),
  };
};

export const MathCalmGame = ({ onClose, onComplete }: Props) => {
  const [q, setQ] = useState(makeQuestion);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [time, setTime] = useState(30);
  const [feedback, setFeedback] = useState<'ok' | 'bad' | null>(null);

  useEffect(() => {
    if (time <= 0) return;
    const t = setTimeout(() => setTime((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [time]);

  const answer = (n: number) => {
    if (time <= 0) return;
    if (n === q.correct) {
      setScore((s) => s + 1);
      setFeedback('ok');
    } else {
      setFeedback('bad');
    }
    setRound((r) => r + 1);
    setTimeout(() => {
      setQ(makeQuestion());
      setFeedback(null);
    }, 350);
  };

  const done = time <= 0;
  const reward = Math.min(score, 15);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background bg-gradient-to-b from-honey/20 to-background overflow-y-auto"
    >
      <div className="flex items-center justify-between p-4">
        <div>
          <p className="text-2xl font-bold text-foreground">{time}s</p>
          <p className="text-xs text-muted-foreground">Score: {score} / {round}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
      </div>
      <div className="flex flex-col items-center px-6 pb-8">
        <h2 className="text-xl font-bold text-foreground mb-1">Math Calm</h2>
        <p className="text-sm text-muted-foreground mb-6">Solve as many as you can</p>
        {!done ? (
          <>
            <div className={`text-5xl font-bold mb-8 text-foreground transition-colors ${
              feedback === 'ok' ? 'text-sage' : feedback === 'bad' ? 'text-coral' : ''
            }`}>
              {q.text}
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              {q.options.map((n) => (
                <button
                  key={n}
                  onClick={() => answer(n)}
                  className="h-16 rounded-xl bg-honey/30 hover:bg-honey/50 text-2xl font-semibold text-foreground shadow-soft"
                >
                  {n}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-lg font-semibold mb-3">{score} correct in 30s</p>
            <Button onClick={() => onComplete(reward)}>Collect +{reward}</Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
