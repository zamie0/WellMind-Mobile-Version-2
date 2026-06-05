import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Community from "./components/WellMind-User/Home-Page/Community";
import Volunteering from "./components/WellMind-User/Home-Page/Volunteering";
import Programs from "./components/WellMind-User/Home-Page/Programs";
import Resources from "./components/WellMind-User/Home-Page/Resources";
import Events from "./components/WellMind-User/Home-Page/Events";
import Mentorship from "./components/WellMind-User/Home-Page/Mentorship";
import SelfAssessment from "./components/WellMind-User/Home-Page/SelfAssessment";
import WellnessPlan from "./components/WellMind-User/Home-Page/WellnessPlan";
import Index from "./components/WellMind-User/Index";
import Insights from "./components/WellMind-User/Insight-Page/Insights";
import Mindfulness from "./components/WellMind-User/Mindful-Page/Mindfulness";
import Rewards from "./components/WellMind-User/MindBuddy-Page/MindBuddy/MindBuddy";
import Profile from "./components/WellMind-User/Profile-Page/Profile";
import NotFound from "./pages/NotFound";
import CounselorIndex from "./components/WellMind-Counselor/CounselorIndex";
import EmotionDashboard from "./pages/EmotionDashboard";
import Auth from "./pages/Auth";
import PeerSupportChat from "./components/WellMind-User/Peers-Page/PeerSupportChat";
import { useAuthStore } from "./stores/authStore";
import { startNotificationScheduler } from "./lib/notificationScheduler";

const queryClient = new QueryClient();

const UserPeerSupportRoute = () => {
  const navigate = useNavigate();
  return <PeerSupportChat onClose={() => navigate("/", { replace: true })} />;
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
      <Route path="/rewards" element={<Rewards />} />
      <Route path="/counselor" element={<UserPeerSupportRoute />} />
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
  useEffect(() => {
    startNotificationScheduler();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <RootNavigator />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
