import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Phone, 
  MessageCircle, 
  Globe, 
  Heart,
  AlertTriangle,
  ExternalLink
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
    color: 'bg-destructive/10 text-destructive',
  },
  {
    name: 'Befrienders (KL & Nationwide)',
    number: '03-7627 2929',
    description: '24/7 emotional support and suicide prevention',
    type: 'call',
    color: 'bg-sky-light text-sky',
  },
  {
    name: 'Befrienders Penang',
    number: '04-291 0100',
    description: 'Emotional support helpline (Penang)',
    type: 'call',
    color: 'bg-sage-light text-sage',
  },
  {
    name: 'Befrienders Johor Bahru',
    number: '07-762 7292',
    description: 'Support for Johor region',
    type: 'call',
    color: 'bg-lavender-light text-lavender',
  },
  {
    name: 'Talian Kasih',
    number: '15999',
    description: 'Social and mental health crisis support',
    type: 'call',
    color: 'bg-coral-light text-coral',
  },
];

const copingStrategies = [
  {
    title: 'Ground Yourself',
    description: 'Use the 5-4-3-2-1 technique: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.',
    emoji: '🌍',
  },
  {
    title: 'Breathe Deeply',
    description: 'Take slow, deep breaths. Inhale for 4 counts, hold for 4, exhale for 6. Repeat several times.',
    emoji: '🌬️',
  },
  {
    title: 'Reach Out',
    description: 'Call or text someone you trust. You don\'t have to go through this alone.',
    emoji: '📱',
  },
  {
    title: 'Move Your Body',
    description: 'Take a short walk, stretch, or do some light movement to release tension.',
    emoji: '🚶',
  },
  {
    title: 'Write It Down',
    description: 'Put your thoughts and feelings on paper. It can help process overwhelming emotions.',
    emoji: '✍️',
  },
];

export const CrisisSupport = ({ onClose }: CrisisSupportProps) => {
  const handleCall = (number: string) => {
    // Clean the number for tel: link
    const cleanNumber = number.replace(/[^0-9]/g, '');
    if (cleanNumber) {
      window.open(`tel:${cleanNumber}`, '_self');
    }
  };

  const handleText = (instruction: string) => {
    // For SMS, this would typically open the messaging app
    window.open('sms:741741?body=HOME', '_self');
  };

  const handleWeb = (url: string) => {
    window.open(`https://${url}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur px-5 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">Crisis Support</h1>
        </div>
      </header>

      <main className="px-5 py-6 space-y-6">
        {/* Emergency Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 border border-destructive/30 rounded-2xl p-5"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground mb-1">
                If you're in immediate danger
              </h2>
              <p className="text-sm text-muted-foreground mb-3">
                Call emergency services (999 in Malaysia) or go to the nearest hospital emergency department.
              </p>
              <Button
                onClick={() => handleCall('999')}
                className="bg-destructive hover:bg-destructive/90 text-white"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call 999
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Crisis Hotlines */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Crisis Hotlines
          </h2>
          <div className="space-y-3">
            {crisisResources.map((resource, index) => (
              <motion.div
                key={resource.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl p-4 shadow-soft"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${resource.color} flex items-center justify-center flex-shrink-0`}>
                    {resource.type === 'call' && <Phone className="h-6 w-6" />}
                    {resource.type === 'text' && <MessageCircle className="h-6 w-6" />}
                    {resource.type === 'web' && <Globe className="h-6 w-6" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{resource.name}</h3>
                    <p className="text-sm font-semibold text-coral">{resource.number}</p>
                    <p className="text-xs text-muted-foreground">{resource.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (resource.type === 'call') handleCall(resource.number);
                      else if (resource.type === 'text') handleText(resource.number);
                      else handleWeb(resource.number);
                    }}
                  >
                    {resource.type === 'call' && 'Call'}
                    {resource.type === 'text' && 'Text'}
                    {resource.type === 'web' && <ExternalLink className="h-4 w-4" />}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Coping Strategies */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Coping Strategies
          </h2>
          <div className="space-y-3">
            {copingStrategies.map((strategy, index) => (
              <motion.div
                key={strategy.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="bg-card rounded-xl p-4 shadow-soft"
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{strategy.emoji}</div>
                  <div>
                    <h3 className="font-medium text-foreground">{strategy.title}</h3>
                    <p className="text-sm text-muted-foreground">{strategy.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Supportive Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-sage/20 to-sage-light/50 rounded-2xl p-6 text-center"
        >
          <Heart className="h-10 w-10 text-coral mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-2">You Are Not Alone</h3>
          <p className="text-sm text-muted-foreground">
            Whatever you're going through, there are people who care and want to help. 
            Reaching out for support is a sign of strength, not weakness. 
            You matter, and things can get better.
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default CrisisSupport;
