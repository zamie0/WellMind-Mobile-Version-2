import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWellMindStore } from '@/stores/wellmindStore';
import { useAuthStore } from '@/stores/authStore';
import Home from './Home';
import Onboarding from './Onboarding';
import Auth from './Auth';
import PinSetup from '@/components/wellmind/PinSetup';
import PinVerify from '@/components/wellmind/PinVerify';

const Index = () => {
  const user = useWellMindStore((state) => state.user);
  const { currentSession, hasPin } = useAuthStore();
  const navigate = useNavigate();
  const [showPinSetup, setShowPinSetup] = useState(false);

  // Redirect counselors to counselor dashboard after onboarding is confirmed
  useEffect(() => {
    // Only redirect if onboarding is EXPLICITLY completed (not undefined/null)
    if (user?.onboardingCompleted === true && currentSession.isAuthenticated && currentSession.userRole === 'counselor') {
      navigate('/counselor');
    }
  }, [user?.onboardingCompleted, currentSession.isAuthenticated, currentSession.userRole, navigate]);

  // Not authenticated - show login/register
  if (!currentSession.isAuthenticated) {
    return <Auth />;
  }

  // Authenticated but PIN not verified (has PIN but needs to verify)
  if (currentSession.isAuthenticated && hasPin() && !currentSession.isPinVerified) {
    return <PinVerify />;
  }

  // First time after register - offer PIN setup
  if (currentSession.isAuthenticated && !hasPin() && showPinSetup === false && !user?.onboardingCompleted) {
    // Show PIN setup after first registration, before onboarding
    return (
      <PinSetup 
        onComplete={() => setShowPinSetup(true)}
        onSkip={() => setShowPinSetup(true)}
      />
    );
  }

  // Onboarding not completed - show onboarding (including role selection)
  if (!user?.onboardingCompleted) {
    return <Onboarding />;
  }

  // Offer PIN setup if authenticated user doesn't have PIN yet (returning user without PIN)
  if (currentSession.isAuthenticated && !hasPin() && !showPinSetup) {
    setShowPinSetup(true); // Skip the setup screen for existing users, they can set it in profile
  }

  return <Home />;
};

export default Index;
