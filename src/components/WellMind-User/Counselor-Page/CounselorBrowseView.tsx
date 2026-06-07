import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import {
  CalendarDays,
  MessageCircle,
  Pencil,
  Shield,
  Users,
} from 'lucide-react';
import { BottomNav } from '@/components/WellMind-User/BottomNav';
import { BookingModal } from './BookingModal';
import { CounselorProfileView } from './CounselorProfileView';
import { CounselorBrowseChats } from './CounselorBrowseView-Chats';
import { CounselorBrowseSessions } from './CounselorBrowseView-Sessions';
import { CounselorBrowseCounselors } from './CounselorBrowseView-Counselors';
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

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'conversations', label: 'Chats',     icon: <MessageCircle className="h-3.5 w-3.5" /> },
  { id: 'sessions',      label: 'Sessions',  icon: <CalendarDays  className="h-3.5 w-3.5" /> },
  { id: 'counselors',    label: 'Counselors', icon: <Users        className="h-3.5 w-3.5" /> },
];

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
              { value: onlineNow,                    label: 'Online now',   accent: '#39a89b' },
              { value: chats.length,                 label: 'Active chats', accent: '#e8735a' },
              { value: visibleAppointments.length,   label: 'Sessions',     accent: '#6bab9e' },
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

      {/* ── Tab content ── */}
      <main className="px-5 py-5">
        <AnimatePresence mode="wait">
          {activeTab === 'conversations' && (
            <motion.div
              key="conversations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <CounselorBrowseChats
                chats={chats}
                availableCounselors={availableCounselors}
                setActiveChatId={setActiveChatId}
                setView={setView}
              />
            </motion.div>
          )}

          {activeTab === 'sessions' && (
            <motion.div
              key="sessions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <CounselorBrowseSessions
                visibleAppointments={visibleAppointments}
                availableCounselors={availableCounselors}
                cancelAppointment={cancelAppointment}
              />
            </motion.div>
          )}

          {activeTab === 'counselors' && (
            <motion.div
              key="counselors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <CounselorBrowseCounselors
                availableCounselors={availableCounselors}
                handleStartChat={handleStartChat}
                setSelectedCounselor={setSelectedCounselor}
                setBookingCounselor={setBookingCounselor}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-4" />
      </main>

      {/* ── Modals ── */}
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