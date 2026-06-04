import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Pause } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { SOUNDS, play, stop, setVolume, getActive, type SoundId } from '@/lib/ambientSounds';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const AmbientSoundsSheet = ({ open, onClose }: Props) => {
  const [active, setActive] = useState<SoundId | null>(getActive());
  const [volume, setVol] = useState(0.5);

  useEffect(() => {
    if (open) setActive(getActive());
  }, [open]);

  const toggle = async (id: SoundId) => {
    if (active === id) {
      stop();
      setActive(null);
    } else {
      await play(id);
      setActive(id);
    }
  };

  const handleVolume = (v: number[]) => {
    const val = v[0] / 100;
    setVol(val);
    setVolume(val);
  };

  return (
    <AnimatePresence>
      {open && (
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
            className="w-full max-w-md bg-card rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Ambient Sounds</h2>
                <p className="text-sm text-muted-foreground">Calm soundscapes to relax</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {SOUNDS.map((sound) => {
                const isActive = active === sound.id;
                return (
                  <motion.button
                    key={sound.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggle(sound.id)}
                    className={`flex flex-col items-center justify-center aspect-square rounded-2xl transition-all relative ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-glow'
                        : 'bg-muted hover:bg-muted/70'
                    }`}
                  >
                    <span className="text-3xl mb-1">{sound.emoji}</span>
                    <span className="text-xs font-medium">{sound.label}</span>
                    {isActive && (
                      <Pause className="absolute top-2 right-2 w-3 h-3" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="bg-muted/40 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Volume</span>
                <span className="text-xs text-muted-foreground ml-auto">{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                value={[volume * 100]}
                onValueChange={handleVolume}
                max={100}
                step={1}
              />
            </div>

            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              🎧 Plays in the background when the screen is locked or the tab is minimized.
              For playback after fully closing the app, install it as a native app.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
