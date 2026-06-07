import { useState } from 'react';
import { useWellMindStore } from '@/stores/wellmindStore';
import { useAuthStore } from '@/stores/authStore';
import CounselorHome from './Home-Page/CounselorHome';
import CounselorAppointments from './Appoinments-Page/CounselorAppointments';
import CounselorClients from './Clients-Page/CounselorClients';
import CounselorNotes from './Notes-Page/CounselorNotes';
import CounselorReports from './Reports-Page/CounselorReports';
import CounselorProfile from './Profile-Page/CounselorProfile';
import { BottomNav } from './BottomNav';
import Onboarding from '../../pages/Onboarding';
import Auth from '../../pages/Auth';
import PinSetup from '@/components/WellMind-User/Profile-Page/PinSetup';
import PinVerify from '@/pages/PinVerify';
import { AnimatePresence } from 'framer-motion';

const Index = () => {
  const user = useWellMindStore((state) => state.user);
  const { currentSession, hasPin, logout } = useAuthStore();
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [activeView, setActiveView] = useState<
    'home' | 'appointments' | 'clients' | 'notes' | 'reports' | 'profile'
  >('home');

  if (!currentSession.isAuthenticated) return <Auth />;

  if (currentSession.isAuthenticated && hasPin() && !currentSession.isPinVerified)
    return <PinVerify />;

  if (
    currentSession.isAuthenticated &&
    !hasPin() &&
    showPinSetup === false &&
    !user?.onboardingCompleted
  ) {
    return (
      <PinSetup
        onComplete={() => setShowPinSetup(true)}
        onSkip={() => setShowPinSetup(true)}
      />
    );
  }

  if (!user?.onboardingCompleted) return <Onboarding />;

  if (currentSession.isAuthenticated && !hasPin() && !showPinSetup) {
    setShowPinSetup(true);
  }

  const handleOpenChat = (_chatId: string) => {};

  const isHome = activeView === 'home';

  return (
    <div
      className="min-h-screen pb-24"
      style={
        isHome
          ? { background: 'linear-gradient(180deg,#eef4f7 0%,#f5f8fa 60%,#fff 100%)' }
          : undefined
      }
    >
      <main className={isHome ? '' : 'space-y-6 px-4 pt-6'}>
        <AnimatePresence mode="wait">
          {activeView === 'home' && (
            <CounselorHome
              key="home"
              onOpenChat={handleOpenChat}
              onViewChange={setActiveView}
            />
          )}
          {activeView === 'appointments' && (
            <CounselorAppointments key="appointments" onOpenChat={handleOpenChat} />
          )}
          {activeView === 'clients' && (
            <CounselorClients key="clients" onOpenChat={handleOpenChat} />
          )}
          {activeView === 'notes' && <CounselorNotes key="notes" />}
          {activeView === 'reports' && <CounselorReports key="reports" />}
          {activeView === 'profile' && <CounselorProfile key="profile" onLogout={logout} />}
        </AnimatePresence>
      </main>
      <BottomNav activeView={activeView} onViewChange={setActiveView} />
    </div>
  );
};

export default Index;