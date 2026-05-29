import { motion } from 'framer-motion';
import { X, Sparkles, Check } from 'lucide-react';
import { useWellMindStore } from '@/stores/wellmindStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { PetSkin, PetAccessory } from '@/types/wellmind';

interface ShopItemData {
  id: string;
  name: string;
  icon: string;
  price: number;
  type: 'skin' | 'accessory';
  value: PetSkin | PetAccessory;
}

const shopItems: ShopItemData[] = [
  // Skins
  { id: 'skin_golden', name: 'Golden Glow', icon: '✨', price: 100, type: 'skin', value: 'golden' },
  { id: 'skin_rainbow', name: 'Rainbow Dream', icon: '🌈', price: 150, type: 'skin', value: 'rainbow' },
  { id: 'skin_ninja', name: 'Shadow Ninja', icon: '🥷', price: 200, type: 'skin', value: 'ninja' },
  { id: 'skin_angel', name: 'Angel Wings', icon: '😇', price: 250, type: 'skin', value: 'angel' },
  { id: 'skin_devil', name: 'Little Devil', icon: '😈', price: 250, type: 'skin', value: 'devil' },
  // Accessories
  { id: 'acc_hat', name: 'Top Hat', icon: '🎩', price: 50, type: 'accessory', value: 'hat' },
  { id: 'acc_glasses', name: 'Cool Shades', icon: '🕶️', price: 60, type: 'accessory', value: 'glasses' },
  { id: 'acc_bowtie', name: 'Cute Bowtie', icon: '🎀', price: 40, type: 'accessory', value: 'bowtie' },
  { id: 'acc_crown', name: 'Royal Crown', icon: '👑', price: 300, type: 'accessory', value: 'crown' },
  { id: 'acc_scarf', name: 'Cozy Scarf', icon: '🧣', price: 45, type: 'accessory', value: 'scarf' },
];

interface PetShopProps {
  onClose: () => void;
}

export const PetShop = ({ onClose }: PetShopProps) => {
  const { 
    calmCoins, pet, unlockedSkins, unlockedAccessories,
    purchaseSkin, purchaseAccessory, setPetSkin, setPetAccessory
  } = useWellMindStore();

  const handlePurchase = (item: ShopItemData) => {
    if (item.type === 'skin') {
      if (unlockedSkins.includes(item.value as PetSkin)) {
        setPetSkin(item.value as PetSkin);
        toast.success(`Equipped ${item.name}!`);
      } else {
        const success = purchaseSkin(item.value as PetSkin, item.price);
        if (success) {
          setPetSkin(item.value as PetSkin);
          toast.success(`Purchased ${item.name}!`);
        } else {
          toast.error('Not enough coins!');
        }
      }
    } else {
      if (unlockedAccessories.includes(item.value as PetAccessory)) {
        setPetAccessory(item.value as PetAccessory);
        toast.success(`Equipped ${item.name}!`);
      } else {
        const success = purchaseAccessory(item.value as PetAccessory, item.price);
        if (success) {
          setPetAccessory(item.value as PetAccessory);
          toast.success(`Purchased ${item.name}!`);
        } else {
          toast.error('Not enough coins!');
        }
      }
    }
  };

  const isOwned = (item: ShopItemData) => {
    if (item.type === 'skin') {
      return unlockedSkins.includes(item.value as PetSkin);
    }
    return unlockedAccessories.includes(item.value as PetAccessory);
  };

  const isEquipped = (item: ShopItemData) => {
    if (item.type === 'skin') {
      return pet.skin === item.value;
    }
    return pet.accessory === item.value;
  };

  const skins = shopItems.filter(i => i.type === 'skin');
  const accessories = shopItems.filter(i => i.type === 'accessory');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-lg bg-card rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Pet Shop</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 px-3 py-1 bg-honey/20 rounded-full">
              <Sparkles className="w-4 h-4 text-honey" />
              <span className="font-medium text-foreground">{calmCoins}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Skins */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Skins</h3>
          <div className="grid grid-cols-3 gap-3">
            {skins.map((item, index) => (
              <ShopItemCard
                key={item.id}
                item={item}
                owned={isOwned(item)}
                equipped={isEquipped(item)}
                canAfford={calmCoins >= item.price}
                onPurchase={() => handlePurchase(item)}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Accessories */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Accessories</h3>
          <div className="grid grid-cols-3 gap-3">
            {accessories.map((item, index) => (
              <ShopItemCard
                key={item.id}
                item={item}
                owned={isOwned(item)}
                equipped={isEquipped(item)}
                canAfford={calmCoins >= item.price}
                onPurchase={() => handlePurchase(item)}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Remove Accessory */}
        {pet.accessory !== 'none' && (
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => {
              setPetAccessory('none');
              toast.success('Accessory removed');
            }}
          >
            Remove Accessory
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
};

const ShopItemCard = ({
  item,
  owned,
  equipped,
  canAfford,
  onPurchase,
  index,
}: {
  item: ShopItemData;
  owned: boolean;
  equipped: boolean;
  canAfford: boolean;
  onPurchase: () => void;
  index: number;
}) => (
  <motion.button
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05 }}
    onClick={onPurchase}
    disabled={!owned && !canAfford}
    className={`relative p-3 rounded-xl border text-center transition-all ${
      equipped
        ? 'border-primary bg-primary/10'
        : owned
        ? 'border-border bg-card hover:border-primary/50'
        : canAfford
        ? 'border-border bg-card hover:border-honey/50'
        : 'border-border bg-muted/50 opacity-60'
    }`}
  >
    {equipped && (
      <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
        <Check className="w-3 h-3 text-primary-foreground" />
      </div>
    )}
    <div className="text-2xl mb-1">{item.icon}</div>
    <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
    <p className="text-[10px] text-muted-foreground">
      {owned ? (equipped ? 'Equipped' : 'Owned') : `${item.price} 🪙`}
    </p>
  </motion.button>
);
