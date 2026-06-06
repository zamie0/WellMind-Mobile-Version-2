import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Phone, 
  MessageCircle, 
  Globe, 
  Heart,
  AlertTriangle,
  ExternalLink,
  Siren,
} from 'lucide-react';

interface CrisisSupportProps {
  onClose: () => void;
}

const crisisResources = [
  {
    name: 'Emergency Services (Malaysia)',
    number: '999',
    description: 'Immediate emergency assistance',
    type: 'call',
    color: 'bg-destructive/10',
    iconColor: 'text-destructive',
  },
  {
    name: 'Befrienders (KL & Nationwide)',
    number: '03-7627 2929',
    description: '24/7 emotional support and suicide prevention',
    type: 'call',
    color: 'bg-sky-light',
    iconColor: 'text-sky',
  },
  {
    name: 'Befrienders Penang',
    number: '04-291 0100',
    description: 'Emotional support helpline (Penang)',
    type: 'call',
    color: 'bg-sage-light',
    iconColor: 'text-sage',
  },
  {
    name: 'Befrienders Johor Bahru',
    number: '07-762 7292',
    description: 'Support for Johor region',
    type: 'call',
    color: 'bg-lavender-light',
    iconColor: 'text-lavender',
  },
  {
    name: 'Talian Kasih',
    number: '15999',
    description: 'Social and mental health crisis support',
    type: 'call',
    color: 'bg-coral-light',
    iconColor: 'text-coral',
  },
];

const copingStrategies = [
  { title: 'Ground Yourself',  description: 'Use the 5-4-3-2-1 technique: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.', emoji: '🌍', color: 'bg-sky-light' },
  { title: 'Breathe Deeply',   description: 'Take slow, deep breaths. Inhale for 4 counts, hold for 4, exhale for 6. Repeat several times.',                  emoji: '🌬️', color: 'bg-sage-light' },
  { title: 'Reach Out',        description: 'Call or text someone you trust. You don\'t have to go through this alone.',                                      emoji: '📱', color: 'bg-lavender-light' },
  { title: 'Move Your Body',   description: 'Take a short walk, stretch, or do some light movement to release tension.',                                      emoji: '🚶', color: 'bg-honey-light' },
  { title: 'Write It Down',    description: 'Put your thoughts and feelings on paper. It can help process overwhelming emotions.',                             emoji: '✍️', color: 'bg-coral-light' },
];

export const CrisisSupport = ({ onClose }: CrisisSupportProps) => {
  const handleCall = (number: string) => {
    const cleanNumber = number.replace(/[^0-9]/g, '');
    if (cleanNumber) window.open(`tel:${cleanNumber}`, '_self');
  };

  return (
    <div className="min-h-screen bg-background pb-10">

      {/* Header */}
      <header className="gradient-sage px-5 pt-safe-top pb-8 rounded-b-[2rem]">
        <div className="pt-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="mb-2 -ml-2 text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Heart className="h-6 w-6 text-coral" />
              Crisis Support
            </h1>
            <p className="text-muted-foreground">You're not alone — help is available</p>
          </motion.div>
        </div>
      </header>

      <main className="px-5 py-6 space-y-6">

        {/* Emergency Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-destructive/10 rounded-2xl overflow-hidden shadow-soft"
        >
          {/* Red top strip */}
          <div className="bg-destructive px-5 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-destructive-foreground/20 flex items-center justify-center">
              <Siren className="h-4 w-4 text-destructive-foreground" />
            </div>
            <p className="text-destructive-foreground font-semibold text-sm">
              If you're in immediate danger
            </p>
          </div>
          <div className="p-5">
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Call emergency services or go to the nearest hospital emergency department immediately.
            </p>
            <Button
              onClick={() => handleCall('999')}
              className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl gap-2 py-5"
            >
              <Phone className="h-4 w-4" />
              Call 999 — Emergency Services
            </Button>
          </div>
        </motion.div>

        {/* Crisis Hotlines */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1 mb-3">
            Crisis Hotlines
          </p>

          <div className="bg-card rounded-2xl shadow-soft overflow-hidden divide-y divide-border">
            {crisisResources.map((resource, index) => (
              <motion.div
                key={resource.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 + index * 0.06 }}
                className="flex items-center gap-3 px-4 py-4 hover:bg-muted/40 transition-colors"
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl ${resource.color} ${resource.iconColor} flex items-center justify-center shrink-0`}>
                  <Phone className="h-4 w-4" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-snug">{resource.name}</p>
                  <p className={`text-xs font-bold ${resource.iconColor}`}>{resource.number}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{resource.description}</p>
                </div>

                {/* Call button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCall(resource.number)}
                  className="rounded-xl shrink-0 gap-1.5 text-xs"
                >
                  <Phone className="h-3 w-3" />
                  Call
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Coping Strategies */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1 mb-3">
            Coping Strategies
          </p>

          <div className="space-y-2">
            {copingStrategies.map((strategy, index) => (
              <motion.div
                key={strategy.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + index * 0.06 }}
                className="bg-card rounded-2xl p-4 shadow-soft flex items-start gap-3"
              >
                <div className={`w-11 h-11 rounded-2xl ${strategy.color} flex items-center justify-center text-xl shrink-0`}>
                  {strategy.emoji}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{strategy.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{strategy.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-sage-light rounded-2xl p-4 flex items-start gap-3"
        >
          <Heart className="h-4 w-4 text-sage shrink-0 mt-0.5" />
          <p className="text-xs text-foreground/70 leading-relaxed">
            Remember — reaching out is a sign of strength, not weakness. You deserve support and care. 💚
          </p>
        </motion.div>

      </main>
    </div>
  );
};

export default CrisisSupport;