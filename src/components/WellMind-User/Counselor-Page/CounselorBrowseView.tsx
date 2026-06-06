import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Briefcase, CalendarDays, CalendarPlus, Clock, MessageCircle, Star, Video, X } from 'lucide-react';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { CounselorAvatar, getStatusColor, getStatusPillClass } from './CounselorAvatar';
import { BookingModal } from './BookingModal';
import { formatDate, formatDateTime, formatMessageContent, formatTime } from './CounselorSupportChat.utils';
import type { CounselorChat, CounselorUser } from '@/types/wellmind';
import type { CounsellorAppointment } from '@/stores/counselorChatStore';

interface CounselorBrowseViewProps {
  embedded?: boolean;
  userName?: string;
  counselorProfile: CounselorUser | null;
  onlineNow: number;
  visibleAppointments: CounsellorAppointment[];
  chats: CounselorChat[];
  availableCounselors: CounselorUser[];
  bookingCounselor: CounselorUser | null;
  setActiveChatId: (chatId: string) => void;
  setView: (view: 'setup' | 'counselors' | 'chat') => void;
  handleStartChat: (counselor: CounselorUser) => void;
  setBookingCounselor: (counselor: CounselorUser | null) => void;
  cancelAppointment: (id: string) => void;
  onBooked: (counselor: CounselorUser) => void;
}

export const CounselorBrowseView = ({
  embedded = false,
  userName,
  counselorProfile,
  onlineNow,
  visibleAppointments,
  chats,
  availableCounselors,
  bookingCounselor,
  setActiveChatId,
  setView,
  handleStartChat,
  setBookingCounselor,
  cancelAppointment,
  onBooked,
}: CounselorBrowseViewProps) => (
  <div className={embedded ? '' : 'min-h-screen bg-background pb-24'}>
    <main className="px-4 py-4 space-y-5" style={!embedded ? { paddingTop: 'max(env(safe-area-inset-top), 1rem)' } : undefined}>
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] bg-gradient-to-br from-[#cfe3dd] via-[#c8ded8] to-[#bfd6d0] p-5 shadow-soft border border-[#a8c5bd]"
      >
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#39a89b] flex items-center justify-center text-white shrink-0">
            <MessageCircle className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl leading-tight font-bold text-[#1f2d3d]">Counselor Support</h1>
            <p className="text-[15px] text-[#4f6271] leading-snug mt-1">You are not alone - connect with someone who gets it</p>
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
          {counselorProfile?.isAnonymous ? 'Chatting as Anonymous' : `Chatting as ${counselorProfile?.displayName || userName || 'User'}`}
        </p>
        <Button variant="ghost" size="sm" onClick={() => setView('setup')} className="text-sm font-medium text-foreground px-2">
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
                      <p className="text-xs text-muted-foreground mt-1">{appt.consultationType === 'video' ? 'Video session' : 'Private chat'}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        {appt.status}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        cancelAppointment(appt.id);
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
                  {counselor.specialization && <p className="text-sm text-muted-foreground mb-2">{counselor.bio || counselor.specialization}</p>}
                  {!counselor.specialization && counselor.bio && <p className="text-sm text-muted-foreground mb-2">{counselor.bio}</p>}
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
        <BookingModal counselor={bookingCounselor} onClose={() => setBookingCounselor(null)} onBooked={() => onBooked(bookingCounselor)} />
      )}
    </AnimatePresence>

    {!embedded && <BottomNav />}
  </div>
);
