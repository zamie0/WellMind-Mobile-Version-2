import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { useWellMindStore } from '@/stores/wellmindStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { 
  User, Bell, Shield, Heart, HelpCircle, ChevronRight, LogOut, KeyRound,
  Settings, Pencil
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import PinSetup from '@/components/WellMind-User/Profile-Page/PinSetup';
import NotificationsSettings from '@/components/WellMind-User/Profile-Page/NotificationsSettings';
import PrivacySettings from '@/components/WellMind-User/Profile-Page/PrivacySettings';
import CrisisSupport from '@/components/WellMind-User/Profile-Page/CrisisSupport';
import HelpFAQ from '@/components/WellMind-User/Profile-Page/HelpFAQ';
import ProfileSettings from '@/components/WellMind-User/Profile-Page/ProfileSettings';

type ActiveScreen = 'main' | 'profileSettings' | 'pin' | 'notifications' | 'privacy' | 'crisis' | 'help' ;

export const Profile = () => {
  const user = useWellMindStore((state) => state.user);
  const { logout, hasPin } = useAuthStore();
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('main');
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (activeScreen === 'profileSettings') {
    return <ProfileSettings onClose={() => setActiveScreen('main')} />;
  } 

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
            {/* Avatar with edit badge */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full gradient-hero flex items-center justify-center shadow-card overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-primary-foreground" />
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveScreen('profileSettings')}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-card shadow-card flex items-center justify-center border-2 border-background hover:bg-muted transition-colors"
                aria-label="Edit profile"
              >
                <Pencil className="h-3.5 w-3.5 text-foreground" />
              </button>
            </div>

            {/* Name */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">
                {user?.name || 'Friend'}
              </h1>
              <p className="text-muted-foreground">Your wellness journey</p>
            </div>

            {/* Settings button */}
            <button
              type="button"
              onClick={() => setActiveScreen('profileSettings')}
              className="w-10 h-10 rounded-full bg-card/60 backdrop-blur-sm flex items-center justify-center shadow-soft hover:bg-card transition-colors"
              aria-label="Profile settings"
            >
              <Settings className="h-5 w-5 text-foreground" />
            </button>
          </motion.div>
        </div>
      </header>

      <main className="px-5 py-6 space-y-6">

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
  className="w-full py-6 rounded-2xl border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
>
  <LogOut className="h-5 w-5" />
  Log Out
</Button>
        </motion.div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Profile;
