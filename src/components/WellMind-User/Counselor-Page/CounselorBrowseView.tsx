import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import {
  Briefcase,
  CalendarDays,
  CalendarPlus,
  Info,
  MessageCircle,
  Pencil,
  Shield,
  Star,
  Users,
  Video,
  X,
  ChevronRight,
} from 'lucide-react';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { CounselorAvatar, getStatusColor } from './CounselorAvatar';
import { BookingModal } from './BookingModal';
import { CounselorProfileView } from './CounselorProfileView';
import { formatDateTime, formatMessageContent, formatTime } from './CounselorSupportChat.utils';
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

type Tab = 'conversations' | 'sessions' | 'counselors';

const statusLabel: Record<string, string> = {
  online: 'Available',
  away: 'Away',
  busy: 'In Session',
};

// ── Appointment status badge ──────────────────────────────────────────────────
const AppointmentStatusBadge = ({ status }: { status: string }) => {
  const styleMap: Record<string, React.CSSProperties> = {
    requested: { background: 'rgba(251,191,36,0.12)', color: '#d97706' },
    confirmed: { background: 'rgba(57,168,155,0.12)', color: '#39a89b' },
    completed: { background: 'rgba(0,0,0,0.06)', color: '#8fa3b1' },
    cancelled: { background: 'rgba(239,68,68,0.1)', color: '#dc2626' },
    missed: { background: 'rgba(232,115,90,0.1)', color: '#e8735a' },
  };
  const s = styleMap[status] ?? styleMap.requested;
  return (
    <span
      className="inline-block text-[10px] uppercase tracking-widest font-semibold px-2.5 py-0.5 rounded-full"
      style={s}
    >
      {status}
    </span>
  );
};

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'conversations', label: 'Chats', icon: <MessageCircle className="h-3.5 w-3.5" /> },
  { id: 'sessions',      label: 'Sessions', icon: <CalendarDays className="h-3.5 w-3.5" /> },
  { id: 'counselors',    label: 'Counselors', icon: <Users className="h-3.5 w-3.5" /> },
];

// ── Main component ────────────────────────────────────────────────────────────
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
}: CounselorBrowseViewProps) => {
  const [selectedCounselor, setSelectedCounselor] = useState<CounselorUser | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('counselors');

  const tabCounts: Record<Tab, number> = {
    conversations: chats.length,
    sessions: visibleAppointments.length,
    counselors: availableCounselors.length,
  };

  return (
    <div
      className={embedded ? '' : 'min-h-screen pb-28'}
      style={{ background: 'linear-gradient(180deg, #f0f7f5 0%, #f7faf9 60%, #ffffff 100%)' }}
    >
      {/* ── Hero banner ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden px-5 pt-10 pb-8"
      >
        {/* Soft background rings */}
        <div
          className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(57,168,155,0.13) 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute top-10 -left-16 w-56 h-56 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(232,115,90,0.08) 0%, transparent 70%)' }}
        />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#39a89b' }}>
                <Users className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#39a89b' }}>
                Counselor Support
              </span>
            </div>

            {/* Identity pill */}
            <button
              onClick={() => setView('setup')}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{ background: 'rgba(57,168,155,0.1)', border: '0.5px solid rgba(57,168,155,0.2)' }}
            >
              <Shield className="h-3 w-3" style={{ color: '#39a89b' }} />
              <span className="text-[11px] font-semibold truncate max-w-[90px]" style={{ color: '#39a89b' }}>
                {counselorProfile?.isAnonymous
                  ? 'Anonymous'
                  : counselorProfile?.displayName || userName || 'You'}
              </span>
              <Pencil className="h-2.5 w-2.5" style={{ color: '#39a89b' }} />
            </button>
          </div>

          <h1 className="text-[2rem] font-bold leading-tight mb-2" style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}>
            You are not alone.
          </h1>
          <p className="text-[15px] leading-relaxed mb-6" style={{ color: '#5f7585' }}>
            Connect with a trained counselor — private, safe, and judgment-free.
          </p>

          {/* Stats row */}
          <div className="flex gap-3">
            {[
              { value: onlineNow, label: 'Online now', accent: '#39a89b' },
              { value: chats.length, label: 'Active chats', accent: '#e8735a' },
              { value: visibleAppointments.length, label: 'Sessions', accent: '#6bab9e' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.07 }}
                className="flex-1 rounded-2xl px-3 py-4 text-center"
                style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
              >
                <p className="text-2xl font-bold leading-none mb-1" style={{ color: item.accent }}>{item.value}</p>
                <p className="text-[11px] font-medium" style={{ color: '#8fa3b1' }}>{item.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* ── Sticky tab bar ── */}
      <div
        className="sticky top-0 z-20 px-5"
        style={{
          background: 'rgba(240,247,245,0.96)',
          backdropFilter: 'blur(14px)',
          borderBottom: '0.5px solid rgba(57,168,155,0.15)',
        }}
      >
        <div className="flex gap-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors"
                style={{ color: isActive ? '#39a89b' : '#8fa3b1' }}
              >
                {tab.icon}
                {tab.label}
                {tabCounts[tab.id] > 0 && (
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                    style={{
                      background: isActive ? '#39a89b' : 'rgba(143,163,177,0.2)',
                      color: isActive ? 'white' : '#8fa3b1',
                    }}
                  >
                    {tabCounts[tab.id]}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg, #39a89b, #6bab9e)' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab content ────────────────────────────────────────────────────── */}
      <main className="px-5 py-5">
        <AnimatePresence mode="wait">
          {/* ── Conversations tab ── */}
          {activeTab === 'conversations' && (
            <motion.div
              key="conversations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-2.5"
            >
              {chats.length === 0 ? (
                <EmptyState
                  icon={<MessageCircle className="h-6 w-6" style={{ color: '#39a89b' }} />}
                  title="No conversations yet"
                  desc="Start a chat with a counselor from the Counselors tab."
                />
              ) : (
                chats.map((chat, i) => {
                  const counselor = availableCounselors.find((p) => chat.participants.includes(p.id));
                  if (!counselor) return null;
                  const lastMessage = chat.messages[chat.messages.length - 1];
                  return (
                    <motion.button
                      key={chat.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => { setActiveChatId(chat.id); setView('chat'); }}
                      whileTap={{ scale: 0.985 }}
                      className="w-full rounded-2xl p-4 flex items-center gap-3.5 text-left"
                      style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.055)' }}
                    >
                      <div className="relative flex-shrink-0">
                        <CounselorAvatar counselor={counselor} size="md" />
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(counselor.status)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm" style={{ color: '#1a2b38' }}>{counselor.displayName}</p>
                        {lastMessage && (
                          <p className="text-xs truncate mt-0.5" style={{ color: '#8fa3b1' }}>
                            {formatMessageContent(lastMessage.content)}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className="text-[11px]" style={{ color: '#b0c0cc' }}>
                          {formatTime(chat.lastMessageAt)}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5" style={{ color: '#c8d8e0' }} />
                      </div>
                    </motion.button>
                  );
                })
              )}
            </motion.div>
          )}

          {/* ── Sessions tab ── */}
          {activeTab === 'sessions' && (
            <motion.div
              key="sessions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-2.5"
            >
              {visibleAppointments.length === 0 ? (
                <EmptyState
                  icon={<CalendarDays className="h-6 w-6" style={{ color: '#39a89b' }} />}
                  title="No upcoming sessions"
                  desc="Book a session from the Counselors tab."
                />
              ) : (
                [...visibleAppointments]
                  .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
                  .map((appt, i) => {
                    const counselor = availableCounselors.find((p) => p.id === appt.counselorId);
                    if (!counselor) return null;
                    return (
                      <motion.div
                        key={appt.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-2xl p-4 flex items-center gap-3.5"
                        style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.055)' }}
                      >
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            background: appt.consultationType === 'video'
                              ? 'rgba(107,171,158,0.12)'
                              : 'rgba(232,115,90,0.1)',
                          }}
                        >
                          {appt.consultationType === 'video'
                            ? <Video className="h-5 w-5" style={{ color: '#6bab9e' }} />
                            : <MessageCircle className="h-5 w-5" style={{ color: '#e8735a' }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm mb-0.5" style={{ color: '#1a2b38' }}>
                            {counselor.displayName}
                          </p>
                          <p className="text-xs mb-1.5" style={{ color: '#8fa3b1' }}>
                            {formatDateTime(appt.appointmentDate, appt.slot)}
                          </p>
                          <AppointmentStatusBadge status={appt.status} />
                        </div>
                        <button
                          onClick={() => cancelAppointment(appt.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(239,68,68,0.06)', color: '#e8735a' }}
                          aria-label="Cancel appointment"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </motion.div>
                    );
                  })
              )}
            </motion.div>
          )}

          {/* ── Counselors tab ── */}
          {activeTab === 'counselors' && (
            <motion.div
              key="counselors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              {availableCounselors.map((counselor, index) => {
                const isOnline = counselor.status === 'online';
                const isBusy = counselor.status === 'busy';

                return (
                  <motion.div
                    key={counselor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 + index * 0.07, type: 'spring', stiffness: 280, damping: 26 }}
                    className="rounded-3xl overflow-hidden"
                    style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
                  >
                    {/* Accent line */}
                    <div
                      className="h-0.5 w-full"
                      style={{
                        background: isOnline
                          ? 'linear-gradient(90deg, #39a89b, #6bab9e)'
                          : isBusy
                          ? 'linear-gradient(90deg, #e8735a, #f0957f)'
                          : 'linear-gradient(90deg, #c8d8e0, #dce8ed)',
                      }}
                    />

                    <div className="p-4">
                      {/* Header row */}
                      <div className="flex items-start gap-3.5 mb-3">
                        <div className="relative flex-shrink-0">
                          <CounselorAvatar counselor={counselor} size="lg" />
                          <div
                            className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(counselor.status)}`}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <h3 className="text-base font-bold leading-tight" style={{ color: '#1a2b38' }}>
                              {counselor.displayName}
                            </h3>
                            <span
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                background: isOnline
                                  ? 'rgba(57,168,155,0.1)'
                                  : isBusy
                                  ? 'rgba(232,115,90,0.1)'
                                  : 'rgba(0,0,0,0.05)',
                                color: isOnline ? '#39a89b' : isBusy ? '#e8735a' : '#8fa3b1',
                              }}
                            >
                              {statusLabel[counselor.status] ?? counselor.status}
                            </span>
                          </div>

                          {counselor.specialization && (
                            <p className="text-xs flex items-center gap-1 mb-1" style={{ color: '#e8735a' }}>
                              <Briefcase className="h-3 w-3 flex-shrink-0" />
                              {counselor.specialization}
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-xs" style={{ color: '#8fa3b1' }}>
                            {counselor.rating !== undefined && (
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span className="font-semibold" style={{ color: '#5f7585' }}>
                                  {counselor.rating.toFixed(1)}
                                </span>
                              </span>
                            )}
                            {counselor.experienceYears !== undefined && counselor.experienceYears > 0 && (
                              <span>{counselor.experienceYears} yrs exp</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Topic chips */}
                      {counselor.supportTopics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {counselor.supportTopics.map((topic) => (
                            <span
                              key={topic}
                              className="text-[10px] px-2.5 py-1 rounded-full font-semibold"
                              style={{ background: 'rgba(57,168,155,0.09)', color: '#3d7a72' }}
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="grid grid-cols-3 gap-2">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleStartChat(counselor)}
                          disabled={isBusy}
                          className="col-span-1 flex flex-col items-center justify-center gap-1 h-14 rounded-2xl text-[11px] font-bold disabled:opacity-40 transition-all"
                          style={{
                            background: isBusy
                              ? '#f0f4f6'
                              : 'linear-gradient(135deg, #e8735a, #d45f47)',
                            color: isBusy ? '#9ab0bc' : 'white',
                            boxShadow: isBusy ? 'none' : '0 4px 12px rgba(232,115,90,0.3)',
                          }}
                        >
                          <MessageCircle className="h-4 w-4" />
                          {isBusy ? 'Busy' : 'Chat'}
                        </motion.button>

                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedCounselor(counselor)}
                          className="col-span-1 flex flex-col items-center justify-center gap-1 h-14 rounded-2xl text-[11px] font-bold transition-all"
                          style={{
                            background: 'rgba(57,168,155,0.07)',
                            border: '1px solid rgba(57,168,155,0.2)',
                            color: '#39a89b',
                          }}
                        >
                          <Info className="h-4 w-4" />
                          Profile
                        </motion.button>

                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setBookingCounselor(counselor)}
                          className="col-span-1 flex flex-col items-center justify-center gap-1 h-14 rounded-2xl text-[11px] font-bold transition-all"
                          style={{
                            background: 'rgba(57,168,155,0.07)',
                            border: '1px solid rgba(57,168,155,0.2)',
                            color: '#39a89b',
                          }}
                        >
                          <CalendarPlus className="h-4 w-4" />
                          Book
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-4" />
      </main>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedCounselor && (
          <CounselorProfileView counselor={selectedCounselor} onClose={() => setSelectedCounselor(null)} />
        )}
        {bookingCounselor && (
          <BookingModal
            counselor={bookingCounselor}
            onClose={() => setBookingCounselor(null)}
            onBooked={() => onBooked(bookingCounselor)}
          />
        )}
      </AnimatePresence>

      {!embedded && <BottomNav />}
    </div>
  );
};

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 gap-3 text-center"
  >
    <div
      className="w-14 h-14 rounded-full flex items-center justify-center"
      style={{ background: 'rgba(57,168,155,0.1)' }}
    >
      {icon}
    </div>
    <p className="text-sm font-semibold" style={{ color: '#1a2b38' }}>{title}</p>
    <p className="text-xs leading-relaxed max-w-[220px]" style={{ color: '#8fa3b1' }}>{desc}</p>
  </motion.div>
);