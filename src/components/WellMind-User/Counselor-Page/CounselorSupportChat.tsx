import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { useCounselorChatStore } from '@/stores/counselorChatStore';
import { useWellMindStore } from '@/stores/wellmindStore';
import { useAuthStore } from '@/stores/authStore';
import { CounselorBrowseView } from './CounselorBrowseView';
import { CounselorChatView } from './CounselorChatView';
import { CounselorSetupView } from './CounselorSetupView';
import type { ChatAttachment, CounselorUser } from '@/types/wellmind';

interface CounselorSupportChatProps {
  onClose?: () => void;
  embedded?: boolean;
}

type View = 'setup' | 'counselors' | 'chat';

export const CounselorSupportChat = ({ onClose: _onClose, embedded = false }: CounselorSupportChatProps) => {
  const user = useWellMindStore((state) => state.user);
  const authUser = useAuthStore((state) => state.getCurrentUser());
  const {
    counselorProfile,
    availableCounselors,
    chats,
    appointments,
    cancelAppointment,
    createCounselorProfile,
    updateCounselorProfile,
    loadAvailableCounselors,
    loadUserConversations,
    loadUserAppointments,
    subscribeRealtime,
    startChat,
    sendMessage,
    getChat,
    requestCounsellorSession,
  } = useCounselorChatStore();

  const [view, setView] = useState<View>(counselorProfile ? 'counselors' : 'setup');
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [isAnonymous, setIsAnonymous] = useState(counselorProfile?.isAnonymous ?? true);
  const [bio, setBio] = useState(counselorProfile?.bio || '');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [bookingCounselor, setBookingCounselor] = useState<CounselorUser | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const routeConversationId = searchParams.get('callConversationId') || searchParams.get('conversationId');

  useEffect(() => {
    loadAvailableCounselors();
  }, [loadAvailableCounselors]);

  useEffect(() => {
    if (!counselorProfile && authUser?.id) {
      createCounselorProfile(user?.name || authUser.email?.split('@')[0] || 'Anonymous', true, undefined, undefined, authUser.id);
    }
  }, [authUser?.id, authUser?.email, counselorProfile, createCounselorProfile, user?.name]);

  useEffect(() => {
    if (!counselorProfile) return;
    void loadUserConversations().catch((error) => {
      toast.error(error instanceof Error ? error.message : 'Could not load chats');
    });
    void loadUserAppointments().catch(() => {});
    return subscribeRealtime();
  }, [counselorProfile, loadUserAppointments, loadUserConversations, subscribeRealtime]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatId, chats]);

  useEffect(() => {
    if (!routeConversationId) return;
    const targetChat = chats.find((chat) => chat.id === routeConversationId);
    if (!targetChat) return;

    setActiveChatId(routeConversationId);
    setView('chat');
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete('callConversationId');
      next.delete('conversationId');
      return next;
    }, { replace: true });
  }, [routeConversationId, chats, setSearchParams]);

  const handleSetupComplete = async () => {
    if (!displayName.trim() && !isAnonymous) {
      toast.error('Please enter a display name');
      return;
    }

    const preferredName = displayName.trim() || user?.name || 'Anonymous';
    if (!counselorProfile) {
      createCounselorProfile(preferredName, isAnonymous, bio, undefined, authUser?.id);
    } else {
      await updateCounselorProfile({
        isAnonymous,
        displayName: isAnonymous ? 'Anonymous' : preferredName,
        bio,
      });
    }

    toast.success('Profile saved. You can now connect with counselors.');
    setView('counselors');
  };

  const handleStartChat = async (counselor: CounselorUser) => {
    if (!counselorProfile) {
      const fallbackName = user?.name || 'Anonymous';
      createCounselorProfile(fallbackName, true, undefined, undefined, authUser?.id);
    }

    try {
      const chatId = await startChat(counselor.id);
      if (chatId) {
        setActiveChatId(chatId);
        setView('chat');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not start chat');
    }
  };

  const handleSendMessage = async (attachment?: ChatAttachment) => {
    if ((!messageInput.trim() && !attachment) || !activeChatId) return;
    const nextMessage = messageInput;
    setMessageInput('');
    try {
      await sendMessage(activeChatId, nextMessage, attachment);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Message could not be sent');
    }
  };

  const activeChat = activeChatId ? getChat(activeChatId) : null;
  const chatCounselor = activeChat ? availableCounselors.find((p) => activeChat.participants.includes(p.id)) : null;
  const visibleAppointments = appointments.filter((a) => a.status !== 'cancelled');
  const onlineNow = availableCounselors.filter((p) => p.status === 'online').length;

  if (view === 'setup') {
    return (
      <CounselorSetupView
        embedded={embedded}
        userName={user?.name}
        counselorProfile={counselorProfile}
        displayName={displayName}
        isAnonymous={isAnonymous}
        bio={bio}
        onDisplayNameChange={setDisplayName}
        onIsAnonymousChange={setIsAnonymous}
        onBioChange={setBio}
        onGoBack={() => setView('counselors')}
        onSubmit={handleSetupComplete}
      />
    );
  }

  if (view === 'chat' && activeChat && chatCounselor) {
    return (
      <CounselorChatView
        embedded={embedded}
        activeChat={activeChat}
        chatCounselor={chatCounselor}
        counselorProfile={counselorProfile}
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        handleSendMessage={handleSendMessage}
        onBack={() => setView('counselors')}
        messagesEndRef={messagesEndRef}
      />
    );
  }

  return (
    <CounselorBrowseView
      embedded={embedded}
      userName={user?.name}
      counselorProfile={counselorProfile}
      onlineNow={onlineNow}
      visibleAppointments={visibleAppointments}
      chats={chats}
      availableCounselors={availableCounselors}
      bookingCounselor={bookingCounselor}
      setActiveChatId={setActiveChatId}
      setView={setView}
      handleStartChat={handleStartChat}
      setBookingCounselor={setBookingCounselor}
      cancelAppointment={cancelAppointment}
      onBooked={(counselor) => {
        requestCounsellorSession(counselor.id);
        setBookingCounselor(null);
      }}
    />
  );
};

export default CounselorSupportChat;
