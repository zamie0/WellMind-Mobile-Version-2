import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  ChevronRight,
  HelpCircle,
  KeyRound,
  LayoutList,
  LogOut,
  Pencil,
  Shield,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCounselorStore } from '@/stores/counselorStore';
import NotificationsSettings from './NotificationsSettings';
import PrivacySettings from './PrivacySettings';
import HelpFAQ from './HelpFAQ';
import ProfileSettings from './ProfileSettings';
import PinSetup from './PinSetup';
import { toast } from 'sonner';

interface CounselorProfileProps { onLogout: () => void; }

export const CounselorProfile = ({ onLogout }: CounselorProfileProps) => {
  const { getCurrentUser, hasPin } = useAuthStore();
  const { appointments } = useCounselorStore();
  const currentUser = getCurrentUser();
  const [activeScreen, setActiveScreen] = useState<'main' | 'profileSettings' | 'pin' | 'notifications' | 'privacy' | 'help'>('main');

  if (activeScreen === 'profileSettings') return <ProfileSettings onClose={() => setActiveScreen('main')} />;
  if (activeScreen === 'pin') return (
    <PinSetup
      onComplete={() => { setActiveScreen('main'); toast.success('PIN updated successfully!'); }}
      onSkip={() => setActiveScreen('main')}
    />
  );
  if (activeScreen === 'notifications') return <NotificationsSettings onClose={() => setActiveScreen('main')} />;
  if (activeScreen === 'privacy') return <PrivacySettings onClose={() => setActiveScreen('main')} />;
  if (activeScreen === 'help') return <HelpFAQ onClose={() => setActiveScreen('main')} />;

  const menuItems = [
    {
      Icon: Pencil,
      label: 'Profile Settings',
      description: 'Update your counselor profile and specialties',
      accent: '#6bab9e',
      screen: 'profileSettings' as const,
    },
    {
      Icon: KeyRound,
      label: hasPin() ? 'Change PIN' : 'Set Up PIN',
      description: 'Protect your counselor dashboard with a PIN',
      accent: '#39a89b',
      screen: 'pin' as const,
    },
    {
      Icon: Bell,
      label: 'Notifications',
      description: 'Control session and client alerts',
      accent: '#e8b35a',
      screen: 'notifications' as const,
    },
    {
      Icon: Shield,
      label: 'Privacy',
      description: 'Manage how client data and profile info are shared',
      accent: '#39a89b',
      screen: 'privacy' as const,
    },
    {
      Icon: HelpCircle,
      label: 'Help & FAQ',
      description: 'Counselor resources and workflow support',
      accent: '#8fa3b1',
      screen: 'help' as const,
    },
  ];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="profile"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        className="space-y-5 px-4 pt-6"
      >
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden px-1 pt-2 pb-1">
        <div
          className="pointer-events-none absolute -top-12 -right-12 w-52 h-52 rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(57,168,155,.11) 0%,transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute top-4 -left-10 w-40 h-40 rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(232,179,90,.08) 0%,transparent 70%)' }}
        />

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          {/* Badge */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: '#39a89b' }}
            >
              <Stethoscope className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#39a89b' }}>
              Counselor
            </span>
          </div>

          {/* Profile row */}
          <div className="flex items-center gap-4 mb-3">
            {/* Avatar */}
            <div
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg,#39a89b,#6bab9e)',
                boxShadow: '0 4px 16px rgba(57,168,155,.28)',
              }}
            >
              <Stethoscope className="h-8 w-8 text-white" />
            </div>

            {/* Name / meta */}
            <div className="flex-1 min-w-0">
              <h1
                className="text-[1.6rem] font-bold leading-tight mb-0.5"
                style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}
              >
                {currentUser?.counselorName || 'Counselor'}
              </h1>
              <p className="text-sm truncate" style={{ color: '#5f7585' }}>
                {currentUser?.email}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <ShieldCheck className="h-3.5 w-3.5" style={{ color: '#39a89b' }} />
                <span className="text-xs" style={{ color: '#39a89b' }}>
                  {currentUser?.isVerified ? 'Verified counselor' : 'Pending verification'}
                </span>
              </div>
            </div>
          </div>

          {/* Specialization pills */}
          {currentUser?.specialization?.length ? (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {currentUser.specialization.map((s) => (
                <span
                  key={s}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(57,168,155,.12)', color: '#2a8f84' }}
                >
                  {s}
                </span>
              ))}
            </div>
          ) : null}

          {/* Bio */}
          {currentUser?.bio ? (
            <p className="text-sm leading-relaxed" style={{ color: '#5f7585' }}>
              {currentUser.bio}
            </p>
          ) : null}
        </motion.div>
      </div>

      {/* ── Settings ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
      >
        <div className="flex items-center gap-2 mb-3 px-0.5">
          <LayoutList className="h-4 w-4" style={{ color: '#39a89b' }} />
          <h2 className="text-base font-bold" style={{ color: '#1a2b38', letterSpacing: '-0.01em' }}>
            Settings
          </h2>
        </div>

        <div className="space-y-3">
          {menuItems.map(({ Icon, label, description, accent, screen }, i) => (
            <motion.button
              key={label}
              type="button"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.36 + i * 0.07 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveScreen(screen)}
              className="w-full rounded-3xl overflow-hidden text-left"
              style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,.07)' }}
            >
              <div
                className="h-1 w-full"
                style={{ background: `linear-gradient(90deg,${accent},${accent}99)` }}
              />
              <div className="flex items-center gap-4 px-4 py-3.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
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

      {/* ── Logout ──────────────────────────────────────────────── */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onLogout}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.64 }}
        className="w-full rounded-3xl overflow-hidden flex items-center justify-center gap-2.5 py-4 font-bold text-sm"
        style={{ background: 'white', color: '#e8735a', boxShadow: '0 4px 20px rgba(232,115,90,.12)' }}
      >
        <LogOut className="h-4 w-4" />
        Log Out
      </motion.button>
    </motion.div>
    </AnimatePresence>
  );
};

export default CounselorProfile;