import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ColorMatchGameProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

const colorPairs = [
  { name: 'Sage', bg: 'bg-primary', text: 'text-primary' },
  { name: 'Coral', bg: 'bg-coral', text: 'text-coral' },
  { name: 'Honey', bg: 'bg-honey', text: 'text-honey' },
  { name: 'Lavender', bg: 'bg-lavender', text: 'text-lavender' },
];

export const ColorMatchGame = ({ onClose, onComplete }: ColorMatchGameProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentColor, setCurrentColor] = useState(colorPairs[0]);
  const [displayedColor, setDisplayedColor] = useState(colorPairs[0]);
  const [isMatching, setIsMatching] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [round, setRound] = useState(0);

  const generateRound = useCallback(() => {
    const textColor = colorPairs[Math.floor(Math.random() * colorPairs.length)];
    const shouldMatch = Math.random() > 0.5;
    let bgColor = textColor;
    
    if (!shouldMatch) {
      const otherColors = colorPairs.filter((c) => c.name !== textColor.name);
      bgColor = otherColors[Math.floor(Math.random() * otherColors.length)];
    }
    
    setCurrentColor(textColor);
    setDisplayedColor(bgColor);
    setIsMatching(shouldMatch);
    setRound((r) => r + 1);
  }, []);

  const handleAnswer = (answer: boolean) => {
    const correct = answer === isMatching;
    
    if (correct) {
      setScore((s) => s + 1);
      setFeedback('correct');
    } else {
      setLives((l) => {
        if (l <= 1) {
          setGameOver(true);
          setIsPlaying(false);
          return 0;
        }
        return l - 1;
      });
      setFeedback('wrong');
    }
    
    setTimeout(() => {
      setFeedback(null);
      if (!gameOver && lives > (correct ? 0 : 1)) {
        generateRound();
      }
    }, 500);
  };

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setRound(0);
    generateRound();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-background"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart
              key={i}
              className={`w-6 h-6 ${i < lives ? 'text-coral fill-coral' : 'text-muted'}`}
            />
          ))}
        </div>
        <div className="text-center -ml-8">
          <p className="text-2xl font-bold text-foreground">{score}</p>
          <p className="text-xs text-muted-foreground">matches</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Game Area */}
      <div className="flex flex-col items-center justify-center h-[calc(100vh-180px)] p-8">
        {!isPlaying && !gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Color Zen</h2>
            <p className="text-muted-foreground text-center mb-6 max-w-xs">
              Does the color of the text match the word? Focus and find your flow!
            </p>
            <Button
              onClick={startGame}
              className="bg-primary text-primary-foreground px-8 py-6 text-lg rounded-full"
            >
              Start Game
            </Button>
          </motion.div>
        )}

        {isPlaying && (
          <motion.div className="flex flex-col items-center w-full max-w-sm">
            {/* Color Display */}
            <AnimatePresence mode="wait">
              <motion.div
                key={round}
                initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                className={`w-full aspect-square rounded-3xl ${displayedColor.bg} flex items-center justify-center shadow-lg mb-8`}
              >
                <span className={`text-4xl font-bold ${currentColor.text === displayedColor.text ? 'text-white' : currentColor.text}`}>
                  {currentColor.name}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Feedback */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl`}
                >
                  {feedback === 'correct' ? '✓' : '✗'}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Question */}
            <p className="text-lg text-foreground mb-6 text-center">
              Does the <span className="font-bold">color</span> match the <span className="font-bold">word</span>?
            </p>

            {/* Answer Buttons */}
            <div className="flex gap-4 w-full">
              <Button
                onClick={() => handleAnswer(true)}
                className="flex-1 py-6 text-lg bg-primary text-primary-foreground rounded-xl"
                disabled={feedback !== null}
              >
                Yes ✓
              </Button>
              <Button
                onClick={() => handleAnswer(false)}
                variant="outline"
                className="flex-1 py-6 text-lg rounded-xl"
                disabled={feedback !== null}
              >
                No ✗
              </Button>
            </div>
          </motion.div>
        )}

        {gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">🌈</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Great Focus!</h2>
            <p className="text-4xl font-bold text-primary mb-2">{score}</p>
            <p className="text-muted-foreground mb-6">correct matches</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={startGame}>
                Play Again
              </Button>
              <Button
                onClick={() => onComplete(score)}
                className="bg-primary text-primary-foreground"
              >
                Collect Reward
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
