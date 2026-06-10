import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useAppPermissions } from "@/hooks/useAppPermissions";
import { useGlobalCallListener } from "@/hooks/useGlobalCallListener";
import { PermissionRequestModal } from "@/components/PermissionRequestModal";
import { IncomingCallNotification } from "@/components/IncomingCallNotification";
import Community from "./components/WellMind-User/Home-Page/Quick Actions/Community";
import Volunteering from "./components/WellMind-User/Home-Page/Quick Actions/Volunteering";
import Programs from "./components/WellMind-User/Home-Page/Quick Actions/Programs";
import Resources from "./components/WellMind-User/Home-Page/Quick Actions/Resources";
import Events from "./components/WellMind-User/Home-Page/Quick Actions/Events";
import Mentorship from "./components/WellMind-User/Home-Page/Quick Actions/Mentorship";
import SelfAssessment from "./components/WellMind-User/Home-Page/Quick Actions/SelfAssessment";
import WellnessPlan from "./components/WellMind-User/Home-Page/Quick Actions/WellnessPlan";
import Index from "./components/WellMind-User/Index";
import Insights from "./components/WellMind-User/Insight-Page/Insights";
import Mindfulness from "./components/WellMind-User/Mindful-Page/Mindfulness";
import MindBuddy from "./components/WellMind-User/MindBuddy-Page/MindBuddy";
import AchievementsPage from "./components/WellMind-User/MindBuddy-Page/AchievementsPage";
import Profile from "./components/WellMind-User/Profile-Page/Profile";
import NotFound from "./pages/NotFound";
import CounselorIndex from "./components/WellMind-Counselor/CounselorIndex";
import EmotionDashboard from "./components/WellMind-User/MindBuddy-Page/MindBuddy/MindBuddy-Chat/EmotionDashboard";
import Auth from "./pages/Auth";
import CounselorSupportChat from "./components/WellMind-User/Counselor-Page/CounselorSupportChat";
import { useAuthStore } from "./stores/authStore";
import { startNotificationScheduler } from "./lib/notificationScheduler";

const queryClient = new QueryClient();

const UserCounselorSupportRoute = () => {
  const navigate = useNavigate();
  return <CounselorSupportChat onClose={() => navigate("/", { replace: true })} />;
};

const RootNavigator = () => {
  const { currentSession } = useAuthStore();

  if (!currentSession.isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<Auth />} />
      </Routes>
    );
  }

  if (currentSession.userRole === "counselor") {
    return (
      <Routes>
        <Route path="/counselor" element={<CounselorIndex />} />
        <Route path="*" element={<Navigate to="/counselor" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/emotion-dashboard" element={<EmotionDashboard />} />
      <Route path="/insights" element={<Insights />} />
      <Route path="/mindfulness" element={<Mindfulness />} />
      <Route path="/MindBuddy" element={<MindBuddy />} />
      <Route path="/achievements" element={<AchievementsPage />} />
      <Route path="/Counselor" element={<UserCounselorSupportRoute />} />
      <Route path="/community" element={<Community />} />
      <Route path="/volunteering" element={<Volunteering />} />
      <Route path="/programs" element={<Programs />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/events" element={<Events />} />
      <Route path="/mentorship" element={<Mentorship />} />
      <Route path="/self-assessment" element={<SelfAssessment />} />
      <Route path="/wellness-plan" element={<WellnessPlan />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/counselor" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  const { isFirstLaunch, requestPermissions } = useAppPermissions();
  const [showPermissionModal, setShowPermissionModal] = useState(isFirstLaunch);

  // Listen for incoming calls globally, regardless of which screen the user is on
  useGlobalCallListener();

  useEffect(() => {
    startNotificationScheduler();
  }, []);

  useEffect(() => {
    setShowPermissionModal(isFirstLaunch);
  }, [isFirstLaunch]);

  const handleRequestPermissions = async (types: any[]) => {
    await requestPermissions(types);
    setShowPermissionModal(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <IncomingCallNotification />
        <PermissionRequestModal
          isOpen={showPermissionModal}
          onRequestPermissions={handleRequestPermissions}
          onClose={() => setShowPermissionModal(false)}
        />
        <BrowserRouter>
          <RootNavigator />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
