import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  ArrowLeft,
  Users,
  MessageCircle,
  Send,
  User,
  Eye,
  EyeOff,
  Clock,
  CalendarPlus,
  Video,
  CalendarDays,
  X,
  Briefcase,
  Star,
  BellRing,
  Mail,
  Smartphone,
} from 'lucide-react';
import { useCounselorChatStore, type ConsultationType, type CounsellorAppointment } from '@/stores/counselorChatStore';
import { useWellMindStore } from '@/stores/wellmindStore';
import { toast } from 'sonner';
import type { CounselorMessage, CounselorUser } from '@/types/wellmind';
import { BottomNav } from '@/components/WellMind-User/BottomNav';

interface CounselorSupportChatProps {
  onClose?: () => void;
  embedded?: boolean;
}

type View = 'setup' | 'counselors' | 'chat';

const DEFAULT_REMINDERS = { push: true, email: false, local: true };

const COUNSELOR_AVATAR: Record<string, string> = {
  'counselor-1': '/khoo.jpeg',
  'counselor-2': 'https://api.dicebear.com/9.x/lorelei/svg?seed=AinaYusuf',
  'counselor-3': 'https://api.dicebear.com/9.x/lorelei/svg?seed=DanielTan',
  'counselor-4': 'https://api.dicebear.com/9.x/lorelei/svg?seed=MeiLin',
  'counselor-5': 'https://api.dicebear.com/9.x/lorelei/svg?seed=RaviNair',
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });

const formatDateTime = (iso: string, slot: string) => `${formatDate(iso)} · ${slot}`;

const formatTime = (date: Date) =>
  new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

const formatMessageContent = (content: CounselorMessage['content']) =>
  typeof content === 'string' ? content : 'Encrypted message';

const getStatusColor = (status: CounselorUser['status']) => {
  switch (status) {
    case 'online':
      return 'bg-green-500';
    case 'away':
      return 'bg-amber-500';
    default:
      return 'bg-red-500';
  }
};

const getStatusPillClass = (status: CounselorUser['status']) => {
  if (status === 'online') return 'bg-green-100 text-green-700';
  if (status === 'away') return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
};

const CounselorAvatar = ({ counselor, size = 'md' }: { counselor: CounselorUser; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClass = size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-16 h-16' : 'w-12 h-12';
  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-7 w-7' : 'h-5 w-5';
  const src = COUNSELOR_AVATAR[counselor.id];

  return (
    <div className={`${sizeClass} rounded-full bg-sage-light flex items-center justify-center overflow-hidden flex-shrink-0`}>
      {src ? (
        <img src={src} alt={counselor.displayName} className="w-full h-full object-cover" />
      ) : counselor.isAnonymous ? (
        <EyeOff className={`${iconSize} text-sage`} />
      ) : (
        <User className={`${iconSize} text-sage`} />
      )}
    </div>
  );
};

interface BookingModalProps {
  counselor: CounselorUser;
  onClose: () => void;
  onBooked: () => void;
}

const BookingModal = ({ counselor, onClose, onBooked }: BookingModalProps) => {
  const { getAvailableSlots, bookSession } = useCounselorChatStore();

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowIso = tomorrowDate.toISOString().split('T')[0];

  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [consultationType, setConsultationType] = useState<ConsultationType>('chat');
  const [notes, setNotes] = useState('');
  const [reminders, setReminders] = useState(DEFAULT_REMINDERS);

  const slots = date ? getAvailableSlots(counselor.id, date) : [];

  const handleSubmit = () => {
    if (!date || !slot) {
      toast.error('Please select a date and time slot.');
      return;
    }

    const id = bookSession(counselor.id, date, slot, consultationType, reminders, notes);
    if (!id) {
      toast.error('That slot is no longer available.');
      return;
    }

    toast.success(`Session requested with ${counselor.displayName}`);
    onBooked();
    onClose();
  };

  const toggleReminder = (key: keyof typeof reminders) =>
    setReminders((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <CounselorAvatar counselor={counselor} size="sm" />
            <div>
              <p className="font-semibold text-foreground text-sm">{counselor.displayName}</p>
              <p className="text-xs text-muted-foreground">{counselor.specialization}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <h3 className="font-semibold text-foreground">Book a Session</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Preferred Date</label>
              <Input
                type="date"
                min={tomorrowIso}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSlot('');
                }}
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Consultation Type</label>
              <select
                value={consultationType}
                onChange={(e) => setConsultationType(e.target.value as ConsultationType)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {(!counselor.consultationMethods || counselor.consultationMethods.includes('chat')) && (
                  <option value="chat">Chat</option>
                )}
                {(!counselor.consultationMethods || counselor.consultationMethods.includes('video')) && (
                  <option value="video">Video</option>
                )}
              </select>
            </div>
          </div>

          {date && (
            <div>
              <label className="text-xs text-muted-foreground block mb-2">Available Time Slots</label>
              {slots.length === 0 ? (
                <p className="text-xs text-muted-foreground">No slots available for this date.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSlot(s)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${slot === s ? 'bg-sage text-white border-sage' : 'bg-background text-foreground border-border hover:border-sage/50'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="text-xs text-muted-foreground block mb-1">Notes (optional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Briefly share what you'd like support with..."
              rows={2}
              className="resize-none text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-2">Reminders</label>
            <div className="flex gap-2">
              {([
                ['push', <BellRing className="h-3 w-3" />, 'Push'] as const,
                ['email', <Mail className="h-3 w-3" />, 'Email'] as const,
                ['local', <Smartphone className="h-3 w-3" />, 'Local'] as const,
              ]).map(([key, icon, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleReminder(key)}
                  className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1 transition-colors ${reminders[key] ? 'bg-sage-light text-sage border-sage/30' : 'bg-background text-muted-foreground border-border'}`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-border flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!date || !slot} className="flex-1 bg-coral hover:bg-coral/90 text-white">
            Confirm Booking
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export const CounselorSupportChat = ({ onClose: _onClose, embedded = false }: CounselorSupportChatProps) => {
  const user = useWellMindStore((state) => state.user);
  const {
    counselorProfile,
    availableCounselors,
    chats,
    appointments,
    cancelAppointment,
    createCounselorProfile,
    updateCounselorProfile,
    loadAvailableCounselors,
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

  useEffect(() => {
    loadAvailableCounselors();
  }, [loadAvailableCounselors]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatId, chats]);

  const handleSetupComplete = () => {
    if (!displayName.trim() && !isAnonymous) {
      toast.error('Please enter a display name');
      return;
    }

    const preferredName = displayName.trim() || user?.name || 'Anonymous';
    if (!counselorProfile) {
      createCounselorProfile(preferredName, isAnonymous, bio);
    } else {
      updateCounselorProfile({
        isAnonymous,
        displayName: isAnonymous ? 'Anonymous' : preferredName,
        bio,
      });
    }

    toast.success('Profile saved. You can now connect with counselors.');
    setView('counselors');
  };

  const handleStartChat = (counselor: CounselorUser) => {
    if (!counselorProfile) {
      const fallbackName = user?.name || 'Anonymous';
      createCounselorProfile(fallbackName, true);
    }
    const chatId = startChat(counselor.id);
    if (chatId) {
      setActiveChatId(chatId);
      setView('chat');
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeChatId) return;
    sendMessage(activeChatId, messageInput);
    setMessageInput('');
  };

  const activeChat = activeChatId ? getChat(activeChatId) : null;
  const chatCounselor = activeChat ? availableCounselors.find((p) => activeChat.participants.includes(p.id)) : null;
  const visibleAppointments = appointments.filter((a) => a.status !== 'cancelled');
  const onlineNow = availableCounselors.filter((p) => p.status === 'online').length;

  if (view === 'setup') {
    return (
      <div className={embedded ? 'bg-gradient-to-b from-cream-100 to-sage-50' : 'min-h-screen bg-gradient-to-b from-cream-100 to-sage-50 pb-24'}>
        <header className="relative bg-gradient-to-br from-sage to-sage-dark text-white px-5 pt-10 pb-12 rounded-b-[2rem] shadow-lg overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-coral/20 rounded-full blur-2xl" />

          <div className="relative">
            {!!counselorProfile && (
              <Button variant="ghost" size="icon" onClick={() => setView('counselors')} className="text-white hover:bg-white/20 -ml-2 mb-3">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}

            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold leading-tight">Set Up Your Profile</h1>
                <p className="text-sm opacity-90">Join the counselor support community</p>
              </div>
            </motion.div>
          </div>
        </header>

        <main className="px-5 -mt-6 pb-10 space-y-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-3xl p-6 shadow-card border border-border/40">
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                key={isAnonymous ? 'anon' : 'named'}
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coral/20 to-coral/10 flex items-center justify-center"
              >
                {isAnonymous ? <EyeOff className="h-8 w-8 text-coral" /> : <User className="h-8 w-8 text-coral" />}
              </motion.div>
              <div className="flex-1">
                <h2 className="font-semibold text-foreground">Choose Your Identity</h2>
                <p className="text-sm text-muted-foreground">Choose how your profile appears when chatting with counselors.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => setIsAnonymous(true)}
                  className={`w-full text-left rounded-2xl border p-4 transition-colors ${isAnonymous ? 'border-sage bg-sage-light/40' : 'border-border bg-background hover:bg-muted/40'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sage/20 flex items-center justify-center shrink-0">
                      <EyeOff className="h-5 w-5 text-sage-dark" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">Stay Anonymous</p>
                      <p className="text-xs text-muted-foreground mt-1">Only Anonymous is shown. Your name and personal details stay hidden.</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAnonymous(false)}
                  className={`w-full text-left rounded-2xl border p-4 transition-colors ${!isAnonymous ? 'border-coral/60 bg-coral-light/40' : 'border-border bg-background hover:bg-muted/40'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-coral/15 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-coral" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">Public / Standard Profile</p>
                      <p className="text-xs text-muted-foreground mt-1">Your display name is visible to supporters for a more personal connection.</p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-muted/40 rounded-xl border border-border/50">
                <p className="text-sm text-foreground font-medium">Privacy Mode</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{isAnonymous ? 'Anonymous' : 'Public'}</span>
                  <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                </div>
              </div>

              <AnimatePresence>
                {!isAnonymous && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <label className="text-sm font-medium text-foreground block mb-2">Display Name</label>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="How should others call you?"
                      className="bg-background rounded-xl py-6"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="rounded-xl border border-dashed border-border p-3 bg-background">
                <p className="text-xs font-medium text-foreground mb-1">Profile Preview</p>
                <p className="text-sm text-muted-foreground">
                  Others will see: <span className="font-medium text-foreground">{isAnonymous ? 'Anonymous' : (displayName.trim() || user?.name || 'You')}</span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Short Bio <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a little about yourself or why you're here..."
                  className="bg-background resize-none rounded-xl"
                  rows={3}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-honey-light/60 rounded-2xl p-5 border border-honey-light"
          >
            <h3 className="font-medium text-foreground mb-1 flex items-center gap-2">💡 About Counselor Support</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connect with trained counselors who understand what you are going through. All conversations are private and
              confidential.
            </p>
          </motion.div>

          <Button onClick={handleSetupComplete} className="w-full py-6 rounded-2xl bg-coral hover:bg-coral/90 text-white shadow-card">
            <Users className="h-5 w-5 mr-2" />
            Find Counselors
          </Button>
        </main>

        {!embedded && <BottomNav />}
      </div>
    );
  }

  if (view === 'chat' && activeChat && chatCounselor) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur px-5 py-4 border-b border-border" style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setView('counselors')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                <CounselorAvatar counselor={chatCounselor} size="sm" />
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(chatCounselor.status)}`} />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">{chatCounselor.displayName}</h1>
                <p className="text-xs text-muted-foreground capitalize">{chatCounselor.status}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-4 space-y-4 pb-24">
          {activeChat.messages.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-sage-light mx-auto mb-4 flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-sage" />
              </div>
              <p className="text-muted-foreground">Start the conversation. Share what is on your mind.</p>
            </motion.div>
          )}

          <AnimatePresence>
            {activeChat.messages.map((message, index) => {
              const isOwn = message.senderId === counselorProfile?.id;
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${isOwn ? 'bg-coral text-white rounded-br-md' : 'bg-sage-light text-foreground rounded-bl-md'}`}>
                    <p className="text-sm">{formatMessageContent(message.content)}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-muted-foreground'}`}>{formatTime(message.timestamp)}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </main>

        <footer className="sticky bottom-16 bg-background border-t border-border px-5 py-4">
          <div className="flex gap-3">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-card"
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage} disabled={!messageInput.trim()} className="bg-coral hover:bg-coral/90 text-white">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </footer>

        {!embedded && <BottomNav />}
      </div>
    );
  }

  return (
    <div className={embedded ? '' : 'min-h-screen bg-background pb-24'}>
      <main className="px-4 py-4 space-y-5" style={!embedded ? { paddingTop: 'max(env(safe-area-inset-top), 1rem)' } : undefined}>
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] bg-gradient-to-br from-[#cfe3dd] via-[#c8ded8] to-[#bfd6d0] p-5 shadow-soft border border-[#a8c5bd]"
        >
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#39a89b] flex items-center justify-center text-white shrink-0">
              <Users className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl leading-tight font-bold text-[#1f2d3d]">Counselor Support</h1>
              <p className="text-[15px] text-[#4f6271] leading-snug mt-1">
                You are not alone - connect with someone who gets it
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { value: onlineNow, label: 'Online now' },
              { value: chats.length, label: 'Chats' },
              { value: visibleAppointments.length, label: 'Sessions' },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl bg-white/85 px-3 py-4 text-center shadow-sm">
                <p className="text-2xl font-semibold text-[#233142] leading-none">{item.value}</p>
                <p className="text-xs text-[#607484] mt-2">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between px-1">
          <p className="text-sm text-muted-foreground">
            {counselorProfile?.isAnonymous ? 'Chatting as Anonymous' : `Chatting as ${counselorProfile?.displayName || user?.name || 'User'}`}
          </p>
          <Button variant="ghost" size="sm" onClick={() => setView('setup')} className="text-sm font-medium text-foreground px-2">
            <Eye className="h-4 w-4 mr-1.5" />
            Edit Profile
          </Button>
        </motion.section>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[15px] leading-relaxed text-[#5f7280] px-1">
          Connect with someone who understands. All conversations are confidential.
        </motion.p>

        {chats.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-lg font-semibold text-foreground mb-3 px-1">Your Conversations</h2>
            <div className="space-y-3">
              {chats.map((chat) => {
                const counselor = availableCounselors.find((p) => chat.participants.includes(p.id));
                if (!counselor) return null;
                const lastMessage = chat.messages[chat.messages.length - 1];

                return (
                  <motion.button
                    key={chat.id}
                    onClick={() => {
                      setActiveChatId(chat.id);
                      setView('chat');
                    }}
                    className="w-full bg-card rounded-2xl p-4 shadow-soft flex items-center gap-4 hover:shadow-card transition-all text-left border border-border/40"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative">
                      <CounselorAvatar counselor={counselor} size="md" />
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${getStatusColor(counselor.status)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{counselor.displayName}</p>
                      {lastMessage && <p className="text-sm text-muted-foreground truncate">{formatMessageContent(lastMessage.content)}</p>}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(chat.lastMessageAt)}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.section>
        )}

        {visibleAppointments.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2 px-1">
              <CalendarDays className="h-4 w-4 text-coral" />
              Your Sessions
            </h2>
            <div className="space-y-3">
              {visibleAppointments
                .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
                .map((appt) => {
                  const counselor = availableCounselors.find((p) => p.id === appt.counselorId);
                  if (!counselor) return null;
                  return (
                    <div key={appt.id} className="bg-card rounded-2xl p-4 shadow-soft flex items-start gap-3 border border-border/40">
                      <div className="w-10 h-10 rounded-full bg-coral/15 flex items-center justify-center shrink-0">
                        {appt.consultationType === 'video' ? <Video className="h-5 w-5 text-coral" /> : <MessageCircle className="h-5 w-5 text-coral" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{counselor.displayName}</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(appt.appointmentDate, appt.slot)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {appt.consultationType === 'video' ? 'Video session' : 'Private chat'}
                        </p>
                        <span className="inline-block mt-1 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          {appt.status}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          cancelAppointment(appt.id);
                          toast.success('Session cancelled');
                        }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
            </div>
          </motion.section>
        )}

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-3xl font-semibold text-[#1f2d3d] mb-3 px-1">Available Counselors</h2>
          <div className="space-y-3">
            {availableCounselors.map((counselor, index) => (
              <motion.div
                key={counselor.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.07 }}
                className="bg-card rounded-3xl p-5 shadow-soft border border-border/60"
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <CounselorAvatar counselor={counselor} size="lg" />
                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-card ${getStatusColor(counselor.status)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-3xl font-semibold text-[#1f2d3d] leading-none">{counselor.displayName}</h3>
                      <span className={`text-sm capitalize px-3 py-1 rounded-full ${getStatusPillClass(counselor.status)}`}>{counselor.status}</span>
                    </div>
                    {counselor.specialization && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {counselor.bio || counselor.specialization}
                      </p>
                    )}
                    {!counselor.specialization && counselor.bio && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {counselor.bio}
                      </p>
                    )}
                    {counselor.specialization && (
                      <p className="text-xs text-coral mb-2 flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {counselor.specialization}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      {counselor.rating !== undefined && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {counselor.rating.toFixed(1)}
                        </span>
                      )}
                      {counselor.experienceYears !== undefined && <span>{counselor.experienceYears} yrs exp.</span>}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {counselor.supportTopics.map((topic) => (
                        <span key={topic} className="text-sm px-3 py-1 bg-sage-light/60 text-sage rounded-full">
                          {topic}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Button
                        size="sm"
                        onClick={() => handleStartChat(counselor)}
                        disabled={counselor.status === 'busy'}
                        className="h-12 w-full sm:w-auto sm:min-w-[140px] rounded-full bg-coral hover:bg-coral/90 text-white text-sm font-semibold shadow-md disabled:bg-muted disabled:text-muted-foreground"
                      >
                        <MessageCircle className="h-4 w-4 mr-1.5" />
                        Start Chat
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setBookingCounselor(counselor)}
                        className="h-12 w-full sm:w-auto sm:min-w-[140px] rounded-full border-coral/40 text-coral hover:bg-coral/10 text-sm font-semibold"
                      >
                        <CalendarPlus className="h-4 w-4 mr-1.5" />
                        Book Session
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>

      <AnimatePresence>
        {bookingCounselor && (
          <BookingModal
            counselor={bookingCounselor}
            onClose={() => setBookingCounselor(null)}
            onBooked={() => {
              requestCounsellorSession(bookingCounselor.id);
              setBookingCounselor(null);
            }}
          />
        )}
      </AnimatePresence>

      {!embedded && <BottomNav />}
    </div>
  );
};

export default CounselorSupportChat;
