import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, RotateCcw, Flower2, TreePine, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ZenGardenGameProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

interface GardenItem {
  id: number;
  type: 'rock' | 'flower' | 'tree' | 'leaf';
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

interface RakePoint {
  x: number;
  y: number;
}

const items = [
  { type: 'rock', emoji: '🪨' },
  { type: 'flower', emoji: '🌸' },
  { type: 'tree', emoji: '🌳' },
  { type: 'leaf', emoji: '🍃' },
];

export const ZenGardenGame = ({ onClose, onComplete }: ZenGardenGameProps) => {
  const [gardenItems, setGardenItems] = useState<GardenItem[]>([]);
  const [rakeLines, setRakeLines] = useState<RakePoint[][]>([]);
  const [currentLine, setCurrentLine] = useState<RakePoint[]>([]);
  const [isRaking, setIsRaking] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const gardenRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setTimeSpent((t) => t + 1);
      }, 1000);
    }
  };

  const handleGardenClick = (e: React.MouseEvent) => {
    if (!gardenRef.current || !selectedItem) return;
    startTimer();

    const rect = gardenRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newItem: GardenItem = {
      id: Date.now(),
      type: selectedItem as GardenItem['type'],
      x,
      y,
      rotation: Math.random() * 30 - 15,
      scale: 0.8 + Math.random() * 0.4,
    };

    setGardenItems((prev) => [...prev, newItem]);
  };

  const handleRakeStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (selectedItem) return;
    startTimer();
    
    setIsRaking(true);
    const point = getPoint(e);
    if (point) setCurrentLine([point]);
  };

  const handleRakeMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isRaking || selectedItem) return;
    
    const point = getPoint(e);
    if (point) {
      setCurrentLine((prev) => [...prev, point]);
    }
  };

  const handleRakeEnd = () => {
    if (currentLine.length > 1) {
      setRakeLines((prev) => [...prev, currentLine]);
    }
    setCurrentLine([]);
    setIsRaking(false);
  };

  const getPoint = (e: React.MouseEvent | React.TouchEvent): RakePoint | null => {
    if (!gardenRef.current) return null;
    
    const rect = gardenRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  };

  const clearGarden = () => {
    setGardenItems([]);
    setRakeLines([]);
    setCurrentLine([]);
  };

  const getEmoji = (type: string) => {
    return items.find((i) => i.type === type)?.emoji || '🪨';
  };

  const handleComplete = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    // Reward based on time spent (max 10 points)
    const points = Math.min(Math.floor(timeSpent / 10) + 1, 10);
    onComplete(points);
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
        <Button variant="ghost" size="icon" onClick={clearGarden}>
          <RotateCcw className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Zen Garden</p>
          <p className="text-xs text-muted-foreground">
            {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')} spent
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Tool Palette */}
      <div className="flex justify-center gap-2 px-4 mb-4">
        <Button
          variant={selectedItem === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedItem(null)}
          className="rounded-full"
        >
          ✋ Rake
        </Button>
        {items.map((item) => (
          <Button
            key={item.type}
            variant={selectedItem === item.type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedItem(item.type)}
            className="rounded-full"
          >
            {item.emoji}
          </Button>
        ))}
      </div>

      {/* Garden Canvas */}
      <div
        ref={gardenRef}
        className="mx-4 h-[50vh] bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl relative overflow-hidden shadow-inner cursor-crosshair"
        onClick={handleGardenClick}
        onMouseDown={handleRakeStart}
        onMouseMove={handleRakeMove}
        onMouseUp={handleRakeEnd}
        onMouseLeave={handleRakeEnd}
        onTouchStart={handleRakeStart}
        onTouchMove={handleRakeMove}
        onTouchEnd={handleRakeEnd}
      >
        {/* Sand texture pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle, #d4a574 1px, transparent 1px)`,
          backgroundSize: '10px 10px',
        }} />

        {/* Rake Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {rakeLines.map((line, lineIndex) => (
            <motion.path
              key={lineIndex}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              d={`M ${line.map((p) => `${p.x},${p.y}`).join(' L ')}`}
              fill="none"
              stroke="rgba(139, 119, 101, 0.4)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ vectorEffect: 'non-scaling-stroke' }}
            />
          ))}
          {currentLine.length > 1 && (
            <path
              d={`M ${currentLine.map((p) => `${p.x},${p.y}`).join(' L ')}`}
              fill="none"
              stroke="rgba(139, 119, 101, 0.5)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ vectorEffect: 'non-scaling-stroke' }}
            />
          )}
        </svg>

        {/* Garden Items */}
        {gardenItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ scale: 0 }}
            animate={{ scale: item.scale, rotate: item.rotation }}
            className="absolute text-3xl pointer-events-none"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {getEmoji(item.type)}
          </motion.div>
        ))}
      </div>

      {/* Instructions & Complete */}
      <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          {selectedItem 
            ? 'Tap to place items in your garden' 
            : 'Drag to rake peaceful patterns in the sand'}
        </p>
        <Button
          onClick={handleComplete}
          className="bg-primary text-primary-foreground px-8 rounded-full"
        >
          Finish & Collect Reward
        </Button>
      </div>
    </motion.div>
  );
};
