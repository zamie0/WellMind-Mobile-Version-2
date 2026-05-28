import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
}

interface BubblePopGameProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

const colors = [
  'bg-primary/60',
  'bg-coral/60',
  'bg-honey/60',
  'bg-sage/60',
  'bg-lavender/60',
];

export const BubblePopGame = ({ onClose, onComplete }: BubblePopGameProps) => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [gameOver, setGameOver] = useState(false);

  const createBubble = useCallback(() => {
    const bubble: Bubble = {
      id: Date.now() + Math.random(),
      x: Math.random() * 80 + 10,
      y: 110,
      size: Math.random() * 30 + 40,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 2 + 1,
    };
    setBubbles((prev) => [...prev, bubble]);
  }, []);

  const popBubble = (id: number) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
    setScore((prev) => prev + 1);
  };

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const spawnInterval = setInterval(createBubble, 800);
    return () => clearInterval(spawnInterval);
  }, [isPlaying, gameOver, createBubble]);

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const moveInterval = setInterval(() => {
      setBubbles((prev) =>
        prev
          .map((b) => ({ ...b, y: b.y - b.speed }))
          .filter((b) => b.y > -20)
      );
    }, 50);

    return () => clearInterval(moveInterval);
  }, [isPlaying, gameOver]);

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, gameOver]);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(30);
    setBubbles([]);
    setGameOver(false);
  };

  const handleComplete = () => {
    onComplete(score);
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
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundOn(!soundOn)}
          >
            {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{score}</p>
          <p className="text-xs text-muted-foreground">bubbles popped</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Timer */}
      {isPlaying && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2">
          <div className="bg-card px-4 py-2 rounded-full shadow-soft">
            <span className="text-lg font-semibold text-foreground">{timeLeft}s</span>
          </div>
        </div>
      )}

      {/* Game Area */}
      <div className="relative h-[calc(100vh-120px)] overflow-hidden">
        <AnimatePresence>
          {bubbles.map((bubble) => (
            <motion.div
              key={bubble.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              style={{
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
                width: bubble.size,
                height: bubble.size,
              }}
              className={`absolute rounded-full ${bubble.color} cursor-pointer shadow-lg backdrop-blur-sm border border-white/30`}
              onClick={() => popBubble(bubble.id)}
              whileTap={{ scale: 0.5 }}
            >
              <div className="absolute top-2 left-2 w-3 h-3 bg-white/40 rounded-full" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Start Screen */}
        {!isPlaying && !gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8"
          >
            <div className="text-6xl mb-4">🫧</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Bubble Pop</h2>
            <p className="text-muted-foreground text-center mb-6">
              Pop as many bubbles as you can in 30 seconds. Let the stress float away!
            </p>
            <Button
              onClick={startGame}
              className="bg-primary text-primary-foreground px-8 py-6 text-lg rounded-full"
            >
              Start Popping
            </Button>
          </motion.div>
        )}

        {/* Game Over Screen */}
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-background/80 backdrop-blur-sm"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Great Job!</h2>
            <p className="text-4xl font-bold text-primary mb-2">{score}</p>
            <p className="text-muted-foreground mb-6">bubbles popped</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={startGame}
                className="px-6"
              >
                Play Again
              </Button>
              <Button
                onClick={handleComplete}
                className="bg-primary text-primary-foreground px-6"
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
