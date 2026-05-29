import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWellMindStore } from '@/stores/wellmindStore';
import type { PetMood, PetSkin, PetAccessory } from '@/types/wellmind';

interface BuddyCharacterProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isInteracting?: boolean;
  mood?: PetMood;
  showAccessory?: boolean;
  onClick?: () => void;
}

// Talking Tom-style expressions with animated faces
const moodFaces: Record<PetMood, string[]> = {
  thriving: ['(◕‿◕)', '(✿◠‿◠)', '★‿★', '(ノ◕ヮ◕)ノ*:・゚✧'],
  happy: ['(◕ᴗ◕✿)', '(◠‿◠)', '(◕‿◕)', 'ヽ(>∀<☆)'],
  content: ['(◡‿◡)', '(•◡•)', '(◕‿◕)', '(ᵔᴥᵔ)'],
  tired: ['(︶︿︶)', '(-.-)zzZ', '(◞‸◟)', '(´〜`)'],
  sad: ['(´;ω;`)', '(╥﹏╥)', '(ಥ_ಥ)', '(。•́︿•̀。)'],
  sick: ['(×_×)', '(＞﹏＜)', '(๑′°︿°๑)', '(´Д`)'],
  sleeping: ['(￣o￣) zzZ', '(-_-) zzZ', '(︶.︶)zzZ', '(u‿u)💤'],
};

// Body colors based on skin
const skinStyles: Record<PetSkin, { body: string; glow: string }> = {
  default: { 
    body: 'from-primary/40 via-primary/30 to-primary/20', 
    glow: 'shadow-[0_0_30px_hsl(var(--primary)/0.3)]' 
  },
  golden: { 
    body: 'from-honey/50 via-honey/40 to-honey/30', 
    glow: 'shadow-[0_0_30px_hsl(var(--honey)/0.4)]' 
  },
  rainbow: { 
    body: 'from-coral/40 via-lavender/40 to-sky/40', 
    glow: 'shadow-[0_0_30px_hsl(var(--lavender)/0.3)]' 
  },
  ninja: { 
    body: 'from-foreground/30 via-foreground/20 to-foreground/10', 
    glow: 'shadow-[0_0_20px_hsl(var(--foreground)/0.2)]' 
  },
  angel: { 
    body: 'from-sky/40 via-white/30 to-lavender/20', 
    glow: 'shadow-[0_0_40px_hsl(var(--sky)/0.4)]' 
  },
  devil: { 
    body: 'from-destructive/40 via-coral/30 to-destructive/20', 
    glow: 'shadow-[0_0_30px_hsl(var(--destructive)/0.3)]' 
  },
};

// Accessory positions and icons
const accessoryData: Record<PetAccessory, { emoji: string; position: string }> = {
  none: { emoji: '', position: '' },
  hat: { emoji: '🎩', position: '-top-8 left-1/2 -translate-x-1/2' },
  glasses: { emoji: '🕶️', position: 'top-1/4 left-1/2 -translate-x-1/2' },
  bowtie: { emoji: '🎀', position: 'bottom-2 left-1/2 -translate-x-1/2' },
  crown: { emoji: '👑', position: '-top-10 left-1/2 -translate-x-1/2' },
  scarf: { emoji: '🧣', position: 'bottom-0 left-1/2 -translate-x-1/2' },
};

const sizeStyles = {
  sm: { container: 'w-16 h-16', face: 'text-xs', accessory: 'text-sm' },
  md: { container: 'w-24 h-24', face: 'text-sm', accessory: 'text-lg' },
  lg: { container: 'w-32 h-32', face: 'text-base', accessory: 'text-xl' },
  xl: { container: 'w-40 h-40', face: 'text-lg', accessory: 'text-2xl' },
};

export const BuddyCharacter = ({ 
  size = 'lg', 
  isInteracting = false,
  mood: overrideMood,
  showAccessory = true,
  onClick,
}: BuddyCharacterProps) => {
  const { pet, getPetMood } = useWellMindStore();
  const [currentFaceIndex, setCurrentFaceIndex] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  
  const mood = overrideMood || getPetMood();
  const faces = moodFaces[mood] || moodFaces.content;
  const skinStyle = skinStyles[pet.skin] || skinStyles.default;
  const accessory = accessoryData[pet.accessory] || accessoryData.none;
  const sizeStyle = sizeStyles[size];

  // Rotate faces periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFaceIndex(prev => (prev + 1) % faces.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [faces.length]);

  // Blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 4000);
    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <motion.div
      className={`relative ${sizeStyle.container} cursor-pointer select-none`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Glow effect */}
      <motion.div
        className={`absolute inset-0 rounded-full ${skinStyle.glow} blur-xl`}
        animate={{
          scale: isInteracting ? [1, 1.2, 1] : [1, 1.05, 1],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Body */}
      <motion.div
        className={`relative w-full h-full rounded-full bg-gradient-to-br ${skinStyle.body} flex items-center justify-center overflow-hidden border-4 border-white/30`}
        animate={{
          y: pet.isSleeping ? 0 : [0, -5, 0],
          rotate: mood === 'thriving' ? [-2, 2, -2] : 0,
          scale: isInteracting ? [1, 1.03, 1] : 1,
        }}
        transition={{
          y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 0.5, repeat: Infinity },
          scale: { duration: 0.3, repeat: isInteracting ? Infinity : 0 },
        }}
      >
        {/* Inner gradient */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-b from-white/20 to-transparent" />
        
        {/* Face */}
        <motion.span 
          className={`relative z-10 font-mono ${sizeStyle.face} font-bold text-foreground`}
          animate={{
            opacity: isBlinking ? 0.5 : 1,
            scaleY: isBlinking ? 0.1 : 1,
          }}
          transition={{ duration: 0.1 }}
        >
          {faces[currentFaceIndex]}
        </motion.span>

        {/* Cheeks (blush) */}
        {(mood === 'happy' || mood === 'thriving' || mood === 'content') && (
          <>
            <motion.div
              className="absolute bottom-1/4 left-2 w-3 h-2 rounded-full bg-coral/40"
              animate={{ opacity: [0.4, 0.6, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-1/4 right-2 w-3 h-2 rounded-full bg-coral/40"
              animate={{ opacity: [0.4, 0.6, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </>
        )}
      </motion.div>

      {/* Accessory */}
      {showAccessory && pet.accessory !== 'none' && (
        <motion.div
          className={`absolute ${accessory.position} ${sizeStyle.accessory}`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {accessory.emoji}
        </motion.div>
      )}

      {/* Sleeping Zs */}
      <AnimatePresence>
        {mood === 'sleeping' && (
          <motion.div
            className="absolute -top-4 -right-2 text-2xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0, 1, 0], y: [-10, -20, -30] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            💤
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level indicator */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
        Lv.{pet.level}
      </div>
    </motion.div>
  );
};
