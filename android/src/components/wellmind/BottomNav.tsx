import { motion } from 'framer-motion';
import { Home, BarChart2, Wind, User, Sparkles } from 'lucide-react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: BarChart2, label: 'Insights', path: '/insights' },
  { icon: Wind, label: 'Mindful', path: '/mindfulness' },
  { icon: Sparkles, label: 'Rewards', path: '/rewards' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <RouterNavLink
              key={item.path}
              to={item.path}
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
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                  />
                )}
              </motion.div>
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </RouterNavLink>
          );
        })}
      </div>
    </nav>
  );
};
