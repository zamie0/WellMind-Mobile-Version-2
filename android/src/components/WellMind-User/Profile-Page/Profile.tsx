import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { useWellMindStore } from '@/stores/wellmindStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Bell, 
  Shield, 
  Heart, 
  HelpCircle, 
  ChevronRight,
  Flame,
  Calendar,
  Sparkles,
  LogOut,
  KeyRound
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import PinSetup from '@/components/WellMind-User/Profile-Page/PinSetup';
import NotificationsSettings from '@/components/WellMind-User/Profile-Page/NotificationsSettings';
import PrivacySettings from '@/components/WellMind-User/Profile-Page/PrivacySettings';
import CrisisSupport from '@/components/WellMind-User/Profile-Page/CrisisSupport';
import HelpFAQ from '@/components/WellMind-User/Profile-Page/HelpFAQ';

type ActiveScreen = 'main' | 'pin' | 'notifications' | 'privacy' | 'crisis' | 'help';

export const Profile = () => {
  const user = useWellMindStore((state) => state.user);
  const currentStreak = useWellMindStore((state) => state.currentStreak);
  const moodEntries = useWellMindStore((state) => state.moodEntries);
  const { logout, hasPin } = useAuthStore();
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('main');
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  // Render sub-screens
  if (activeScreen === 'pin') {
    return (
      <PinSetup 
        onComplete={() => {
          setActiveScreen('main');
          toast.success('PIN updated successfully!');
        }}
        onSkip={() => setActiveScreen('main')}
      />
    );
  }

  if (activeScreen === 'notifications') {
    return <NotificationsSettings onClose={() => setActiveScreen('main')} />;
  }

  if (activeScreen === 'privacy') {
    return <PrivacySettings onClose={() => setActiveScreen('main')} />;
  }

  if (activeScreen === 'crisis') {
    return <CrisisSupport onClose={() => setActiveScreen('main')} />;
  }

  if (activeScreen === 'help') {
    return <HelpFAQ onClose={() => setActiveScreen('main')} />;
  }

  const menuItems = [
    {
      icon: <KeyRound className="h-5 w-5" />,
      label: hasPin() ? 'Change PIN' : 'Set Up PIN',
      description: hasPin() ? 'Update your quick access PIN' : 'Enable quick PIN login',
      color: 'bg-sage-light text-sage',
      screen: 'pin' as ActiveScreen,
    },
    {
      icon: <Bell className="h-5 w-5" />,
      label: 'Notifications',
      description: 'Manage your reminders',
      color: 'bg-honey-light text-honey',
      screen: 'notifications' as ActiveScreen,
    },
    {
      icon: <Shield className="h-5 w-5" />,
      label: 'Privacy',
      description: 'Data and security settings',
      color: 'bg-sky-light text-sky',
      screen: 'privacy' as ActiveScreen,
    },
    {
      icon: <Heart className="h-5 w-5" />,
      label: 'Crisis Support',
      description: 'Emergency resources',
      color: 'bg-destructive/10 text-destructive',
      screen: 'crisis' as ActiveScreen,
    },
    {
      icon: <HelpCircle className="h-5 w-5" />,
      label: 'Help & FAQ',
      description: 'Get support and answers',
      color: 'bg-lavender-light text-lavender',
      screen: 'help' as ActiveScreen,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="gradient-sage px-5 pt-safe-top pb-8 rounded-b-[2rem]">
        <div className="pt-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-20 h-20 rounded-full gradient-hero flex items-center justify-center shadow-card">
              <User className="h-10 w-10 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {user?.name || 'Friend'}
              </h1>
              <p className="text-muted-foreground">Your wellness journey</p>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="px-5 py-6 space-y-6">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-card rounded-2xl p-4 shadow-soft text-center">
            <Flame className="h-6 w-6 text-coral mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{currentStreak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-soft text-center">
            <Calendar className="h-6 w-6 text-sage mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{moodEntries.length}</p>
            <p className="text-xs text-muted-foreground">Check-ins</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-soft text-center">
            <Sparkles className="h-6 w-6 text-honey mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {Math.min(moodEntries.length, 5)}
            </p>
            <p className="text-xs text-muted-foreground">Badges</p>
          </div>
        </motion.div>

        {/* Achievements Preview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-5 shadow-soft"
        >
          <h2 className="font-semibold text-foreground mb-4">Recent Achievements</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {currentStreak >= 1 && (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-coral-light flex items-center justify-center text-2xl mb-1">
                  🌱
                </div>
                <span className="text-xs text-muted-foreground">First Step</span>
              </div>
            )}
            {currentStreak >= 3 && (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-sage-light flex items-center justify-center text-2xl mb-1">
                  🔥
                </div>
                <span className="text-xs text-muted-foreground">3 Day Streak</span>
              </div>
            )}
            {currentStreak >= 7 && (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-honey-light flex items-center justify-center text-2xl mb-1">
                  ⭐
                </div>
                <span className="text-xs text-muted-foreground">Week Warrior</span>
              </div>
            )}
            {moodEntries.length >= 10 && (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-lavender-light flex items-center justify-center text-2xl mb-1">
                  💪
                </div>
                <span className="text-xs text-muted-foreground">Dedicated</span>
              </div>
            )}
            {currentStreak < 1 && moodEntries.length < 10 && (
              <div className="flex flex-col items-center opacity-50">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-2xl mb-1">
                  🔒
                </div>
                <span className="text-xs text-muted-foreground">Keep going!</span>
              </div>
            )}
          </div>
        </motion.section>

        {/* Menu Items */}
        <section className="space-y-3">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              onClick={() => setActiveScreen(item.screen)}
              className="w-full bg-card rounded-2xl p-4 shadow-soft flex items-center gap-4 hover:shadow-card transition-all"
            >
              <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center`}>
                {item.icon}
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </motion.button>
          ))}
        </section>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full py-6 rounded-2xl border-coral/30 text-coral hover:bg-coral/10 gap-2"
          >
            <LogOut className="h-5 w-5" />
            Log Out
          </Button>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center pt-4"
        >
          <p className="text-sm text-muted-foreground">WellMind v1.0.0</p>
          <p className="text-xs text-muted-foreground mt-1">
            Made with 💚 for your mental wellness
          </p>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;
