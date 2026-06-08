import { useEffect, useState } from 'react';
import { useWellMindStore } from '@/stores/wellmindStore';
import { useAuthStore } from '@/stores/authStore';
import Home from './Home-Page/Home';
import Onboarding from '../../pages/Onboarding';
import Auth from '../../pages/Auth';
import PinSetup from '@/components/WellMind-User/Profile-Page/PinSetup';
import PinVerify from '@/pages/PinVerify';

const Index = () => {
  const user = useWellMindStore((state) => state.user);
  const setUser = useWellMindStore((state) => state.setUser);
  const clearUser = useWellMindStore((state) => state.clearUser);
  const { currentSession, hasPin, getCurrentUser } = useAuthStore();
  const currentUser = getCurrentUser();
  const [showPinSetup, setShowPinSetup] = useState(false);
  const currentWellnessUser = user?.id === currentUser?.id ? user : null;

  useEffect(() => {
    if (!currentSession.isAuthenticated || currentSession.userRole !== 'user' || !currentUser) return;

    if (currentUser.onboardingCompleted && user?.id !== currentUser.id) {
      setUser({
        id: currentUser.id,
        name: currentUser.name || currentUser.email.split('@')[0],
        email: currentUser.email,
        notificationsEnabled: true,
        onboardingCompleted: true,
        streak: 0,
      });
      return;
    }

    if (!currentUser.onboardingCompleted && user?.id && user.id !== currentUser.id) {
      clearUser();
    }
  }, [clearUser, currentSession.isAuthenticated, currentSession.userRole, currentUser, setUser, user?.id]);

  // Not authenticated - show login/register
  if (!currentSession.isAuthenticated) {
    return <Auth />;
  }

  // Authenticated but PIN not verified (has PIN but needs to verify)
  if (currentSession.isAuthenticated && hasPin() && !currentSession.isPinVerified) {
    return <PinVerify />;
  }

  // First time after register - offer PIN setup
  if (currentSession.isAuthenticated && !hasPin() && showPinSetup === false && !currentUser?.onboardingCompleted && !currentWellnessUser?.onboardingCompleted) {
    // Show PIN setup after first registration, before onboarding
    return (
      <PinSetup 
        onComplete={() => setShowPinSetup(true)}
        onSkip={() => setShowPinSetup(true)}
      />
    );
  }

  // Onboarding not completed - show onboarding (including role selection)
  if (!currentUser?.onboardingCompleted && !currentWellnessUser?.onboardingCompleted) {
    return <Onboarding />;
  }

  // Offer PIN setup if authenticated user doesn't have PIN yet (returning user without PIN)
  if (currentSession.isAuthenticated && !hasPin() && !showPinSetup) {
    setShowPinSetup(true); // Skip the setup screen for existing users, they can set it in profile
  }

  return <Home />;
};

export default Index;
