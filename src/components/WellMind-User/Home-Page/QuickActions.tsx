import { motion } from 'framer-motion';
import { Wind, BookOpen, MessageCircle, Sparkles } from 'lucide-react';

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}

interface QuickActionsProps {
  onBreathingClick: () => void;
  onJournalClick: () => void;
  onChatClick: () => void;
  onAffirmationClick: () => void;
}

export const QuickActions = ({
  onBreathingClick,
  onJournalClick,
  onChatClick,
  onAffirmationClick,
}: QuickActionsProps) => {
  const actions: QuickAction[] = [
    {
      icon: <Wind className="h-6 w-6" />,
      label: 'Breathe',
      color: 'bg-sky-light text-sky',
      onClick: onBreathingClick,
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      label: 'Journal',
      color: 'bg-lavender-light text-lavender',
      onClick: onJournalClick,
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      label: 'MindBuddy',
      color: 'bg-coral-light text-coral',
      onClick: onChatClick,
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      label: 'Affirm',
      color: 'bg-honey-light text-honey',
      onClick: onAffirmationClick,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action, index) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          className={`flex flex-col items-center justify-center p-4 rounded-2xl ${action.color} transition-all`}
        >
          {action.icon}
          <span className="text-xs font-medium mt-2 text-foreground">{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
};
