import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  HandHeart,
  Trophy,
  GraduationCap,
  Calendar,
  UserPlus,
  Gamepad2,
  Music2,
  ClipboardCheck,
  CalendarHeart,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}

interface QuickActionsProps {
  onJournalClick: () => void;
  onGamesClick: () => void;
  onSoundsClick: () => void;
}

export const QuickActions = ({ onJournalClick, onGamesClick, onSoundsClick }: QuickActionsProps) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const actions: QuickAction[] = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      label: 'Journal',
      color: 'bg-lavender-light text-lavender',
      onClick: onJournalClick,
    },
    {
      icon: <CalendarHeart className="h-6 w-6" />,
      label: 'Wellness Plan',
      color: 'bg-primary/10 text-primary',
      onClick: () => navigate('/wellness-plan'),
    },
    {
      icon: <ClipboardCheck className="h-6 w-6" />,
      label: 'Assessments',
      color: 'bg-sky-light text-sky',
      onClick: () => navigate('/self-assessment'),
    },
    {
      icon: <Gamepad2 className="h-6 w-6" />,
      label: 'Games',
      color: 'bg-sage-light text-sage-dark',
      onClick: onGamesClick,
    },
    {
      icon: <Music2 className="h-6 w-6" />,
      label: 'Sounds',
      color: 'bg-primary/10 text-primary',
      onClick: onSoundsClick,
    },
    {
      icon: <Users className="h-6 w-6" />,
      label: 'Community',
      color: 'bg-sky-light text-sky',
      onClick: () => navigate('/community'),
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      label: 'Events',
      color: 'bg-coral-light text-coral',
      onClick: () => navigate('/events'),
    },
    {
      icon: <GraduationCap className="h-6 w-6" />,
      label: 'Resources',
      color: 'bg-honey-light text-honey',
      onClick: () => navigate('/resources'),
    },
    {
      icon: <HandHeart className="h-6 w-6" />,
      label: 'Volunteer',
      color: 'bg-sage-light text-sage-dark',
      onClick: () => navigate('/volunteering'),
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      label: 'Programs',
      color: 'bg-coral-light text-coral',
      onClick: () => navigate('/programs'),
    },
    {
      icon: <UserPlus className="h-6 w-6" />,
      label: 'Mentorship',
      color: 'bg-lavender-light text-lavender',
      onClick: () => navigate('/mentorship'),
    },
  ];

  const visible = expanded ? actions : actions.slice(0, 4);

  return (
    <div>
      <div className="grid grid-cols-4 gap-3">
        {visible.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={action.onClick}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl ${action.color} transition-all`}
          >
            {action.icon}
            <span className="text-xs font-medium mt-2 text-foreground text-center leading-tight">
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 w-full flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
      >
        {expanded ? (
          <>
            Show less <ChevronUp className="h-4 w-4" />
          </>
        ) : (
          <>
            More <ChevronDown className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
};
