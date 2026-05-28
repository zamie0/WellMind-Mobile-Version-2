import { motion, AnimatePresence } from 'framer-motion';
import { X, Cookie, Apple, Cake, IceCream, Coffee, Pizza } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWellMindStore } from '@/stores/wellmindStore';
import { toast } from 'sonner';

interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  type: 'snack' | 'meal' | 'treat';
  hungerGain: number;
  happinessGain: number;
  cost: number;
}

const foodItems: FoodItem[] = [
  { id: 'cookie', name: 'Cookie', emoji: '🍪', type: 'snack', hungerGain: 15, happinessGain: 5, cost: 3 },
  { id: 'apple', name: 'Apple', emoji: '🍎', type: 'snack', hungerGain: 20, happinessGain: 3, cost: 3 },
  { id: 'burger', name: 'Burger', emoji: '🍔', type: 'meal', hungerGain: 40, happinessGain: 10, cost: 8 },
  { id: 'pizza', name: 'Pizza', emoji: '🍕', type: 'meal', hungerGain: 35, happinessGain: 12, cost: 8 },
  { id: 'sushi', name: 'Sushi', emoji: '🍣', type: 'meal', hungerGain: 45, happinessGain: 8, cost: 10 },
  { id: 'icecream', name: 'Ice Cream', emoji: '🍦', type: 'treat', hungerGain: 10, happinessGain: 25, cost: 12 },
  { id: 'cake', name: 'Cake', emoji: '🎂', type: 'treat', hungerGain: 15, happinessGain: 30, cost: 15 },
  { id: 'candy', name: 'Candy', emoji: '🍬', type: 'treat', hungerGain: 5, happinessGain: 20, cost: 10 },
];

interface FoodMenuProps {
  onClose: () => void;
  onFeed: (food: FoodItem) => void;
}

export const FoodMenu = ({ onClose, onFeed }: FoodMenuProps) => {
  const { calmCoins } = useWellMindStore();

  const categories = [
    { type: 'snack', label: 'Snacks', description: 'Quick bites' },
    { type: 'meal', label: 'Meals', description: 'Filling food' },
    { type: 'treat', label: 'Treats', description: 'Special goodies' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-md bg-card rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Feed Your Buddy</h2>
            <p className="text-sm text-muted-foreground">Choose something yummy!</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 px-3 py-1 bg-honey/20 rounded-full">
              <span className="text-honey">🪙</span>
              <span className="text-sm font-medium">{calmCoins}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Food Categories */}
        {categories.map(({ type, label, description }) => (
          <div key={type} className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">{label}</h3>
            <p className="text-xs text-muted-foreground mb-3">{description}</p>
            <div className="grid grid-cols-3 gap-3">
              {foodItems
                .filter((item) => item.type === type)
                .map((food, index) => (
                  <motion.button
                    key={food.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      if (calmCoins >= food.cost) {
                        onFeed(food);
                        toast.success(`Fed ${food.name}!`, {
                          description: `+${food.hungerGain} hunger, +${food.happinessGain} happiness`,
                        });
                        onClose();
                      } else {
                        toast.error('Not enough coins!');
                      }
                    }}
                    disabled={calmCoins < food.cost}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                      calmCoins >= food.cost
                        ? 'border-border hover:border-primary hover:bg-primary/5'
                        : 'opacity-50 cursor-not-allowed border-border'
                    }`}
                  >
                    <span className="text-3xl">{food.emoji}</span>
                    <span className="text-xs font-medium text-foreground">{food.name}</span>
                    <span className="text-[10px] text-honey flex items-center gap-0.5">
                      🪙 {food.cost}
                    </span>
                  </motion.button>
                ))}
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};
