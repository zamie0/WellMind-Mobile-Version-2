import { useAuthStore } from '@/stores/authStore';
import CounselorDashboard from './CounselorDashboard';

const CounselorIndex = () => {
  const { currentSession, logout } = useAuthStore();

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  if (!currentSession.isAuthenticated || currentSession.userRole !== 'counselor') return null;

  return (
    <CounselorDashboard onLogout={handleLogout} />
  );
};

export default CounselorIndex;
