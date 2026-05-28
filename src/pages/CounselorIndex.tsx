import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import CounselorDashboard from '@/components/wellmind/CounselorDashboard';
import PeerSupportChat from '@/components/wellmind/PeerSupportChat';

const CounselorIndex = () => {
  const { currentSession } = useAuthStore();
  const navigate = useNavigate();

  // Show peer support chat for user portal access
  if (!currentSession.isAuthenticated || currentSession.userRole !== 'counselor') {
    return <PeerSupportChat onClose={() => navigate(-1)} />;
  }

  // User is authenticated as counselor, show dashboard
  if (currentSession.userRole === 'counselor') {
    return (
      <CounselorDashboard
        onLogout={() => {
          navigate('/');
        }}
      />
    );
  }

  return <PeerSupportChat onClose={() => navigate(-1)} />;
};

export default CounselorIndex;
