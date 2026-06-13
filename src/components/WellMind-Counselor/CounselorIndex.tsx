import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import CounselorHome from './Home-Page/CounselorHome';
import CounselorAppointments from './Appoinments-Page/CounselorAppointments';
import CounselorClients from './Clients-Page/CounselorClients';
import CounselorNotes from './Notes-Page/CounselorNotes';
import CounselorReports from './Reports-Page/CounselorReports';
import CounselorProfile from './Profile-Page/CounselorProfile';
import CounselorInbox from './Inbox-Page/CounselorInbox';
import { BottomNav } from './BottomNav';
import Auth from '../../pages/Auth';
import PinSetup from '@/components/WellMind-User/Profile-Page/PinSetup';
import PinVerify from '@/pages/PinVerify';
import { AnimatePresence } from 'framer-motion';
import {
  getChatSocket,
  identifyChatParticipant,
  listConversations,
  type ChatConversation,
} from '@/lib/realtimeCounselorChat';
import { useCounselorStore } from '@/stores/counselorStore';

const Index = () => {
  const { currentSession, hasPin, logout } = useAuthStore();
  const upsertClientsFromConversations = useCounselorStore((state) => state.upsertClientsFromConversations);
  const loadAppointments = useCounselorStore((state) => state.loadAppointments);
  const upsertAppointments = useCounselorStore((state) => state.upsertAppointments);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [activeView, setActiveView] = useState<
    'home' | 'inbox' | 'appointments' | 'clients' | 'notes' | 'reports' | 'profile'
  >('home');
  const [openingConversationId, setOpeningConversationId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const routeConversationId = searchParams.get('callConversationId') || searchParams.get('conversationId');

  useEffect(() => {
    if (currentSession.isAuthenticated && currentSession.userRole === 'counselor' && currentSession.currentUserId) {
      identifyChatParticipant('counselor', currentSession.currentUserId);
    }
  }, [currentSession.currentUserId, currentSession.isAuthenticated, currentSession.userRole]);

  useEffect(() => {
    if (!currentSession.isAuthenticated || currentSession.userRole !== 'counselor' || !currentSession.currentUserId) return;

    const counselorId = currentSession.currentUserId;
    const loadWorkspace = async () => {
      const { conversations } = await listConversations('counselor', counselorId);
      upsertClientsFromConversations(conversations);
      await loadAppointments(counselorId);
    };

    void loadWorkspace().catch(() => {});

    const socket = getChatSocket();
    const onConversationUpdated = (conversation: ChatConversation) => {
      if (conversation.counselorId !== counselorId) return;
      upsertClientsFromConversations([conversation]);
    };
    const onAppointmentUpdated = (appointment: any) => {
      if (appointment.counselorId !== counselorId) return;
      upsertAppointments([appointment]);
    };

    socket.on('conversation:updated', onConversationUpdated);
    socket.on('appointment:updated', onAppointmentUpdated);
    return () => {
      socket.off('conversation:updated', onConversationUpdated);
      socket.off('appointment:updated', onAppointmentUpdated);
    };
  }, [
    currentSession.currentUserId,
    currentSession.isAuthenticated,
    currentSession.userRole,
    loadAppointments,
    upsertAppointments,
    upsertClientsFromConversations,
  ]);

  useEffect(() => {
    if (!routeConversationId) return;
    setOpeningConversationId(routeConversationId);
    setActiveView('inbox');
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete('callConversationId');
      next.delete('conversationId');
      return next;
    }, { replace: true });
  }, [routeConversationId, setSearchParams]);

  if (!currentSession.isAuthenticated) return <Auth />;

  if (currentSession.isAuthenticated && hasPin() && !currentSession.isPinVerified)
    return <PinVerify />;

  if (
    currentSession.isAuthenticated &&
    !hasPin() &&
    showPinSetup === false
  ) {
    return (
      <PinSetup
        onComplete={() => setShowPinSetup(true)}
        onSkip={() => setShowPinSetup(true)}
      />
    );
  }

  const handleOpenChat = (chatId: string) => {
    setOpeningConversationId(chatId);
    setActiveView('inbox');
  };

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
      <main className={isHome ? '' : ''}>
        <AnimatePresence mode="wait">
          {activeView === 'home' && (
            <CounselorHome
              key="home"
              onOpenChat={handleOpenChat}
              onViewChange={setActiveView}
            />
          )}
          {activeView === 'inbox' && (
            <CounselorInbox
              key="inbox"
              initialConversationId={openingConversationId}
              onChatOpened={() => setOpeningConversationId(null)}
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
