import { motion, AnimatePresence } from 'framer-motion';
import { X, Cookie, Apple, Cake, IceCream, Coffee, Pizza } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWellMindStore } from '@/stores/wellmindStore';
import { toast } from 'sonner';

interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  type: 'snack' | 'meal' | 'treat' | 'fruit' | 'drink';
  hungerGain: number;
  happinessGain: number;
  cost: number;
}

const foodItems: FoodItem[] = [
  // Snacks (12)
  { id: 'cookie', name: 'Cookie', emoji: '🍪', type: 'snack', hungerGain: 15, happinessGain: 5, cost: 3 },
  { id: 'apple', name: 'Apple', emoji: '🍎', type: 'snack', hungerGain: 20, happinessGain: 3, cost: 3 },
  { id: 'chips', name: 'Chips', emoji: '🥔', type: 'snack', hungerGain: 12, happinessGain: 6, cost: 3 },
  { id: 'popcorn', name: 'Popcorn', emoji: '🍿', type: 'snack', hungerGain: 10, happinessGain: 7, cost: 2 },
  { id: 'granola', name: 'Granola', emoji: '🥣', type: 'snack', hungerGain: 18, happinessGain: 4, cost: 3 },
  { id: 'pretzel', name: 'Pretzel', emoji: '🥨', type: 'snack', hungerGain: 14, happinessGain: 5, cost: 3 },
  { id: 'donut', name: 'Donut', emoji: '🍩', type: 'snack', hungerGain: 16, happinessGain: 8, cost: 4 },
  { id: 'banana', name: 'Banana', emoji: '🍌', type: 'snack', hungerGain: 22, happinessGain: 4, cost: 2 },
  { id: 'orange', name: 'Orange', emoji: '🍊', type: 'snack', hungerGain: 18, happinessGain: 3, cost: 2 },
  { id: 'grapes', name: 'Grapes', emoji: '🍇', type: 'snack', hungerGain: 16, happinessGain: 4, cost: 3 },
  { id: 'crackers', name: 'Crackers', emoji: '🥛', type: 'snack', hungerGain: 13, happinessGain: 3, cost: 2 },
  { id: 'nuts', name: 'Mixed Nuts', emoji: '🥜', type: 'snack', hungerGain: 20, happinessGain: 5, cost: 4 },

  // Meals (16)
  { id: 'burger', name: 'Burger', emoji: '🍔', type: 'meal', hungerGain: 40, happinessGain: 10, cost: 8 },
  { id: 'pizza', name: 'Pizza', emoji: '🍕', type: 'meal', hungerGain: 35, happinessGain: 12, cost: 8 },
  { id: 'sushi', name: 'Sushi', emoji: '🍣', type: 'meal', hungerGain: 45, happinessGain: 8, cost: 10 },
  { id: 'pasta', name: 'Pasta', emoji: '🍝', type: 'meal', hungerGain: 38, happinessGain: 11, cost: 8 },
  { id: 'tacos', name: 'Tacos', emoji: '🌮', type: 'meal', hungerGain: 36, happinessGain: 13, cost: 7 },
  { id: 'sandwich', name: 'Sandwich', emoji: '🥪', type: 'meal', hungerGain: 32, happinessGain: 7, cost: 6 },
  { id: 'noodles', name: 'Noodles', emoji: '🍜', type: 'meal', hungerGain: 42, happinessGain: 10, cost: 8 },
  { id: 'ricebowl', name: 'Rice Bowl', emoji: '🍚', type: 'meal', hungerGain: 40, happinessGain: 8, cost: 7 },
  { id: 'steak', name: 'Steak', emoji: '🥩', type: 'meal', hungerGain: 45, happinessGain: 14, cost: 12 },
  { id: 'fish', name: 'Grilled Fish', emoji: '🐟', type: 'meal', hungerGain: 42, happinessGain: 9, cost: 9 },
  { id: 'chicken', name: 'Chicken', emoji: '🍗', type: 'meal', hungerGain: 40, happinessGain: 10, cost: 8 },
  { id: 'curry', name: 'Curry', emoji: '🥘', type: 'meal', hungerGain: 38, happinessGain: 12, cost: 9 },
  { id: 'ramen', name: 'Ramen', emoji: '🍲', type: 'meal', hungerGain: 44, happinessGain: 11, cost: 8 },
  { id: 'soup', name: 'Soup', emoji: '🥣', type: 'meal', hungerGain: 30, happinessGain: 7, cost: 5 },
  { id: 'hotdog', name: 'Hot Dog', emoji: '🌭', type: 'meal', hungerGain: 28, happinessGain: 8, cost: 5 },
  { id: 'quesadilla', name: 'Quesadilla', emoji: '🧀', type: 'meal', hungerGain: 34, happinessGain: 11, cost: 7 },

  // Treats (14)
  { id: 'icecream', name: 'Ice Cream', emoji: '🍦', type: 'treat', hungerGain: 10, happinessGain: 25, cost: 12 },
  { id: 'cake', name: 'Cake', emoji: '🎂', type: 'treat', hungerGain: 15, happinessGain: 30, cost: 15 },
  { id: 'candy', name: 'Candy', emoji: '🍬', type: 'treat', hungerGain: 5, happinessGain: 20, cost: 10 },
  { id: 'chocolate', name: 'Chocolate', emoji: '🍫', type: 'treat', hungerGain: 8, happinessGain: 28, cost: 12 },
  { id: 'cupcake', name: 'Cupcake', emoji: '🧁', type: 'treat', hungerGain: 12, happinessGain: 26, cost: 13 },
  { id: 'brownie', name: 'Brownie', emoji: '🍪', type: 'treat', hungerGain: 10, happinessGain: 27, cost: 11 },
  { id: 'fudge', name: 'Fudge', emoji: '🍫', type: 'treat', hungerGain: 6, happinessGain: 24, cost: 10 },
  { id: 'waffle', name: 'Waffle', emoji: '🧇', type: 'treat', hungerGain: 18, happinessGain: 22, cost: 10 },
  { id: 'pudding', name: 'Pudding', emoji: '🍮', type: 'treat', hungerGain: 12, happinessGain: 21, cost: 9 },
  { id: 'pie', name: 'Pie', emoji: '🥧', type: 'treat', hungerGain: 16, happinessGain: 29, cost: 14 },
  { id: 'tart', name: 'Tart', emoji: '🍰', type: 'treat', hungerGain: 10, happinessGain: 23, cost: 11 },
  { id: 'churro', name: 'Churro', emoji: '🥯', type: 'treat', hungerGain: 14, happinessGain: 25, cost: 10 },
  { id: 'donuttreat', name: 'Glazed Donut', emoji: '🍩', type: 'treat', hungerGain: 12, happinessGain: 24, cost: 10 },
  { id: 'popsicle', name: 'Popsicle', emoji: '🍭', type: 'treat', hungerGain: 8, happinessGain: 22, cost: 8 },

  // Fruits (8)
  { id: 'strawberry', name: 'Strawberry', emoji: '🍓', type: 'fruit', hungerGain: 14, happinessGain: 5, cost: 3 },
  { id: 'watermelon', name: 'Watermelon', emoji: '🍉', type: 'fruit', hungerGain: 16, happinessGain: 4, cost: 2 },
  { id: 'mango', name: 'Mango', emoji: '🥭', type: 'fruit', hungerGain: 20, happinessGain: 6, cost: 4 },
  { id: 'pineapple', name: 'Pineapple', emoji: '🍍', type: 'fruit', hungerGain: 18, happinessGain: 5, cost: 3 },
  { id: 'carrot', name: 'Carrot', emoji: '🥕', type: 'fruit', hungerGain: 12, happinessGain: 2, cost: 1 },
  { id: 'broccoli', name: 'Broccoli', emoji: '🥦', type: 'fruit', hungerGain: 16, happinessGain: 3, cost: 2 },
  { id: 'corn', name: 'Corn', emoji: '🌽', type: 'fruit', hungerGain: 18, happinessGain: 4, cost: 2 },
  { id: 'peach', name: 'Peach', emoji: '🍑', type: 'fruit', hungerGain: 17, happinessGain: 5, cost: 3 },

  // Drinks (5)
  { id: 'juice', name: 'Juice', emoji: '🧃', type: 'drink', hungerGain: 8, happinessGain: 6, cost: 2 },
  { id: 'smoothie', name: 'Smoothie', emoji: '🥤', type: 'drink', hungerGain: 14, happinessGain: 8, cost: 4 },
  { id: 'coffee', name: 'Coffee', emoji: '☕', type: 'drink', hungerGain: 5, happinessGain: 9, cost: 3 },
  { id: 'milk', name: 'Milk', emoji: '🥛', type: 'drink', hungerGain: 10, happinessGain: 5, cost: 2 },
  { id: 'tea', name: 'Tea', emoji: '🍵', type: 'drink', hungerGain: 4, happinessGain: 7, cost: 2 },
];

interface FoodMenuProps {
  onClose: () => void;
  onFeed: (food: FoodItem) => void;
}

export const FoodMenu = ({ onClose, onFeed }: FoodMenuProps) => {
  const { calmCoins } = useWellMindStore();

  const categories = [
    { type: 'snack', label: 'Snacks', description: '12 quick snacks', icon: '🥨' },
    { type: 'meal', label: 'Meals', description: '16 filling meals', icon: '🍔' },
    { type: 'treat', label: 'Treats', description: '14 special treats', icon: '🍰' },
    { type: 'fruit', label: 'Fruits & Veggies', description: '8 healthy options', icon: '🍎' },
    { type: 'drink', label: 'Drinks', description: '5 beverages', icon: '☕' },
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
        {categories.map(({ type, label, description, icon }) => (
          <div key={type} className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">{icon} {label}</h3>
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
