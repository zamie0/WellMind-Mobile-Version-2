import { motion } from 'framer-motion';
import { BarChart3, CalendarDays, FileText, Home, Inbox, User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', path: 'home' },
  { icon: Inbox, label: 'Inbox', path: 'inbox' },
  { icon: CalendarDays, label: 'Appts', path: 'appointments' },
  { icon: Users, label: 'Clients', path: 'clients' },
  { icon: BarChart3, label: 'Reports', path: 'reports' },
  { icon: User, label: 'Profile', path: 'profile' },
];

interface BottomNavProps {
  activeView?: string;
  onViewChange?: (view: string) => void;
}

export const BottomNav = ({ activeView, onViewChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-4">
        {navItems.map((item) => {
          const isActive = activeView === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => onViewChange && onViewChange(item.path)}
              className={cn(
                'flex flex-col items-center justify-center w-16 py-2 rounded-xl transition-all',
                'text-muted-foreground hover:text-primary',
                isActive && 'text-primary'
              )}
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0,
                }}
                className="relative"
              >
                <item.icon className="h-6 w-6" />
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className=""
                  />
                )}
              </motion.div>
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
