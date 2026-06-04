import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onClose: () => void;
  onComplete: (score: number) => void;
}

const WORDS = [
  { w: 'PEACE', hint: 'A calm state of mind' },
  { w: 'CALM', hint: 'Quiet and still' },
  { w: 'BREATHE', hint: 'In and out, slowly' },
  { w: 'RELAX', hint: 'Let your body rest' },
  { w: 'SMILE', hint: 'A small lift of the lips' },
  { w: 'GRATEFUL', hint: 'Feeling thankful' },
  { w: 'PRESENT', hint: 'Right here, right now' },
  { w: 'KIND', hint: 'Gentle with yourself' },
];

const scramble = (w: string) =>
  w.split('').sort(() => Math.random() - 0.5).join('');

export const WordCalmGame = ({ onClose, onComplete }: Props) => {
  const [index, setIndex] = useState(0);
  const [scrambled, setScrambled] = useState(scramble(WORDS[0].w));
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'ok' | 'bad' | null>(null);

  const current = WORDS[index];

  const submit = () => {
    if (guess.toUpperCase() === current.w) {
      setScore((s) => s + 2);
      setFeedback('ok');
      setTimeout(() => {
        setFeedback(null);
        const ni = (index + 1) % WORDS.length;
        setIndex(ni);
        setScrambled(scramble(WORDS[ni].w));
        setGuess('');
      }, 600);
    } else {
      setFeedback('bad');
      setTimeout(() => setFeedback(null), 600);
    }
  };

  const skip = () => {
    const ni = (index + 1) % WORDS.length;
    setIndex(ni);
    setScrambled(scramble(WORDS[ni].w));
    setGuess('');
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
          <p className="text-xs text-muted-foreground">solved</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>
      <div className="flex flex-col items-center px-6 pb-8">
        <h2 className="text-xl font-bold text-foreground mb-1">Word Calm</h2>
        <p className="text-sm text-muted-foreground mb-6 text-center">{current.hint}</p>
        <div className="flex gap-2 mb-6 flex-wrap justify-center">
          {scrambled.split('').map((c, i) => (
            <div
              key={i}
              className="w-10 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-xl font-bold text-foreground"
            >
              {c}
            </div>
          ))}
        </div>
        <input
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Your guess"
          className={`w-full max-w-xs h-12 rounded-xl border-2 px-4 text-center uppercase bg-card text-foreground transition-colors ${
            feedback === 'ok' ? 'border-primary' : feedback === 'bad' ? 'border-coral' : 'border-border'
          }`}
        />
        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={skip}>Skip</Button>
          <Button onClick={submit}>Guess</Button>
        </div>
        <Button variant="ghost" className="mt-6" onClick={() => onComplete(Math.min(score, 15))}>
          Finish & Collect +{Math.min(score, 15)}
        </Button>
      </div>
    </motion.div>
  );
};
