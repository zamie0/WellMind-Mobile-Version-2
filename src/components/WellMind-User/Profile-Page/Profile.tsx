import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { useWellMindStore } from '@/stores/wellmindStore';
import { useAuthStore } from '@/stores/authStore';
import {
  User, Bell, Shield, Heart, HelpCircle, ChevronRight,
  LogOut, KeyRound, Settings, Pencil, LayoutList, Palette
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import PinSetup from '@/components/WellMind-User/Profile-Page/PinSetup';
import NotificationsSettings from '@/components/WellMind-User/Profile-Page/NotificationsSettings';
import PrivacySettings from '@/components/WellMind-User/Profile-Page/PrivacySettings';
import CrisisSupport from '@/components/WellMind-User/Profile-Page/CrisisSupport';
import HelpFAQ from '@/components/WellMind-User/Profile-Page/HelpFAQ';
import ProfileSettings from '@/components/WellMind-User/Profile-Page/ProfileSettings';

type ActiveScreen = 'main' | 'profileSettings' | 'pin' | 'notifications' | 'privacy' | 'crisis' | 'help';

/* ── Helpers ────────────────────────────────────────────────────── */
const SectionHeading = ({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) => (
  <div className="flex items-center gap-2 mb-3 px-0.5">
    {icon}
    <h2 className="text-base font-bold" style={{ color: '#1a2b38', letterSpacing: '-0.01em' }}>
      {children}
    </h2>
  </div>
);

/* ── Page ───────────────────────────────────────────────────────── */
export const Profile = () => {
  const user = useWellMindStore((s) => s.user);
  const { logout, hasPin } = useAuthStore();
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('main');
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  /* ── Sub-screens ─────────────────────────────────────────────── */
  if (activeScreen === 'profileSettings') return <ProfileSettings onClose={() => setActiveScreen('main')} />;
  if (activeScreen === 'pin') return (
    <PinSetup
      onComplete={() => { setActiveScreen('main'); toast.success('PIN updated successfully!'); }}
      onSkip={() => setActiveScreen('main')}
    />
  );
  if (activeScreen === 'notifications') return <NotificationsSettings onClose={() => setActiveScreen('main')} />;
  if (activeScreen === 'privacy')       return <PrivacySettings       onClose={() => setActiveScreen('main')} />;
  if (activeScreen === 'crisis')        return <CrisisSupport         onClose={() => setActiveScreen('main')} />;
  if (activeScreen === 'help')          return <HelpFAQ               onClose={() => setActiveScreen('main')} />;

  /* ── Menu items ──────────────────────────────────────────────── */
  const menuItems = [
    {
      Icon: KeyRound,
      label: hasPin() ? 'Change PIN' : 'Set Up PIN',
      description: hasPin() ? 'Update your quick access PIN' : 'Enable quick PIN login',
      accent: '#6bab9e',
      screen: 'pin' as ActiveScreen,
    },
    {
      Icon: Bell,
      label: 'Notifications',
      description: 'Manage your reminders',
      accent: '#f59e0b',
      screen: 'notifications' as ActiveScreen,
    },
    {
      Icon: Shield,
      label: 'Privacy',
      description: 'Data and security settings',
      accent: '#39a89b',
      screen: 'privacy' as ActiveScreen,
    },
    {
      Icon: Heart,
      label: 'Crisis Support',
      description: 'Emergency resources',
      accent: '#e8735a',
      screen: 'crisis' as ActiveScreen,
    },
    {
      Icon: HelpCircle,
      label: 'Help & FAQ',
      description: 'Get support and answers',
      accent: '#8fa3b1',
      screen: 'help' as ActiveScreen,
    },
  ];

  return (
    <div
      className="min-h-screen pb-28"
      style={{ background: 'linear-gradient(180deg, #f0f7f5 0%, #f7faf9 60%, #ffffff 100%)' }}
    >
      {/* ── Hero ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden px-5 pt-10 pb-8"
      >
        {/* Background rings */}
        <div
          className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(57,168,155,0.13) 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute top-10 -left-16 w-56 h-56 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(232,115,90,0.08) 0%, transparent 70%)' }}
        />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          {/* Badge */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#39a89b' }}>
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#39a89b' }}>
              Profile
            </span>
          </div>

          {/* Profile row */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #39a89b, #6bab9e)',
                  boxShadow: '0 4px 16px rgba(57,168,155,0.3)',
                }}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-9 w-9 text-white" />
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveScreen('profileSettings')}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2"
                style={{
                  background: 'white',
                  borderColor: '#f0f7f5',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                }}
                aria-label="Edit profile"
              >
                <Pencil className="h-3 w-3" style={{ color: '#39a89b' }} />
              </button>
            </div>

            {/* Name + sub */}
            <div className="flex-1 min-w-0">
              <h1
                className="text-[1.6rem] font-bold leading-tight mb-1"
                style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}
              >
                {user?.name || 'Friend'}
              </h1>
              <p className="text-sm" style={{ color: '#5f7585' }}>Your wellness journey</p>
            </div>

            {/* Settings icon */}
            <button
              type="button"
              onClick={() => setActiveScreen('profileSettings')}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}
              aria-label="Profile settings"
            >
              <Settings className="h-5 w-5" style={{ color: '#5f7585' }} />
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Main ──────────────────────────────────────────────── */}
      <main className="px-5 space-y-6">

        {/* Menu */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <SectionHeading icon={<LayoutList className="h-4 w-4" style={{ color: '#39a89b' }} />}>
            Account Settings
          </SectionHeading>

          <div className="space-y-3">
            {menuItems.map(({ Icon, label, description, accent, screen }, i) => (
              <motion.button
                key={label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.22 + i * 0.07 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveScreen(screen)}
                className="w-full rounded-3xl overflow-hidden text-left"
                style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
              >
                {/* Accent line */}
                <div
                  className="h-1 w-full"
                  style={{ background: `linear-gradient(90deg, ${accent}, ${accent}99)` }}
                />
                <div className="flex items-center gap-4 px-4 py-3.5">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${accent}18` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: accent }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm" style={{ color: '#1a2b38' }}>{label}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#8fa3b1' }}>{description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: '#c5d3da' }} />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Logout */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.58 }}>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full rounded-3xl overflow-hidden flex items-center justify-center gap-2.5 py-4 font-bold text-sm"
            style={{
              background: 'white',
              color: '#e8735a',
              boxShadow: '0 4px 20px rgba(232,115,90,0.12)',
            }}
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </motion.button>
        </motion.div>

        <div className=''/>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;