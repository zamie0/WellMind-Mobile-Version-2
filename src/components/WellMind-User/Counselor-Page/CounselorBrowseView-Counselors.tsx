import { motion } from 'framer-motion';
import { CalendarPlus, MessageCircle, Star } from 'lucide-react';
import { CounselorAvatar, getStatusColor } from './CounselorAvatar';
import type { CounselorUser } from '@/types/wellmind';

interface CounselorBrowseCounselorsProps {
  availableCounselors: CounselorUser[];
  handleStartChat: (counselor: CounselorUser) => void;
  setSelectedCounselor: (counselor: CounselorUser) => void;
  setBookingCounselor: (counselor: CounselorUser | null) => void;
}

const statusLabel: Record<string, string> = {
  online: 'Available',
  away: 'Away',
  busy: 'In Session',
};

const statusGradient: Record<string, string> = {
  online: 'linear-gradient(90deg, #39a89b, #6bab9e)',
  busy:   'linear-gradient(90deg, #e8735a, #f0957f)',
  away:   'linear-gradient(90deg, #c8d8e0, #dce8ed)',
};

export const CounselorBrowseCounselors = ({
  availableCounselors,
  handleStartChat,
  setSelectedCounselor,
  setBookingCounselor,
}: CounselorBrowseCounselorsProps) => {
  return (
    <div className="space-y-3">
      {availableCounselors.map((counselor, index) => {
        const isOnline = counselor.status === 'online';
        const isBusy   = counselor.status === 'busy';

        // Deduplicate: hide specialization chip if it already appears in supportTopics
        const extraTopics = counselor.supportTopics.filter(
          (t) => t.toLowerCase() !== counselor.specialization?.toLowerCase(),
        );

        return (
          <motion.div
            key={counselor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 + index * 0.07, type: 'spring', stiffness: 280, damping: 26 }}
            className="rounded-3xl overflow-hidden"
            style={{ background: 'white', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}
          >
            {/* Status accent bar */}
            <div
              className="h-[3px] w-full"
              style={{ background: statusGradient[counselor.status] ?? statusGradient.away }}
            />

            <div className="p-4">
              {/* ── Top row: avatar + info ── */}
              <div className="flex items-center gap-3.5 mb-3.5">
                {/* Clickable avatar → opens profile */}
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setSelectedCounselor(counselor)}
                  className="relative flex-shrink-0 rounded-2xl focus:outline-none"
                  aria-label={`View ${counselor.displayName}'s profile`}
                >
                  <CounselorAvatar counselor={counselor} size="lg" />
                  {/* Status dot */}
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(counselor.status)}`}
                  />
                  {/* Subtle tap ring hint */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity"
                    style={{ boxShadow: '0 0 0 2px rgba(57,168,155,0.35)' }}
                  />
                </motion.button>

                {/* Name + status badge + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-[15px] font-bold leading-tight truncate" style={{ color: '#1a2b38' }}>
                      {counselor.displayName}
                    </h3>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: isOnline ? 'rgba(57,168,155,0.12)' : isBusy ? 'rgba(232,115,90,0.12)' : 'rgba(0,0,0,0.05)',
                        color:      isOnline ? '#39a89b'               : isBusy ? '#e8735a'               : '#8fa3b1',
                      }}
                    >
                      {statusLabel[counselor.status] ?? counselor.status}
                    </span>
                  </div>

                  {/* Rating + experience */}
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

              {/* ── Specialization + topic chips (unified, deduplicated) ── */}
              {(counselor.specialization || extraTopics.length > 0) && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {/* Specialization chip — always first, distinct colour */}
                  {counselor.specialization && (
                    <span
                      className="text-[10px] px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: 'rgba(232,115,90,0.1)', color: '#c0503a' }}
                    >
                      {counselor.specialization}
                    </span>
                  )}
                  {/* Remaining topics that aren't the specialization */}
                  {extraTopics.map((topic) => (
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

              {/* ── Action buttons (2-col: Chat + Book) ── */}
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleStartChat(counselor)}
                  disabled={isBusy}
                  className="flex items-center justify-center gap-2 h-12 rounded-2xl text-[12px] font-bold disabled:opacity-40 transition-all"
                  style={{
                    background: isBusy ? '#f0f4f6' : 'linear-gradient(135deg, #e8735a, #d45f47)',
                    color:      isBusy ? '#9ab0bc' : 'white',
                    boxShadow:  isBusy ? 'none'    : '0 4px 14px rgba(232,115,90,0.32)',
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  {isBusy ? 'Busy' : 'Chat'}
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setBookingCounselor(counselor)}
                  className="flex items-center justify-center gap-2 h-12 rounded-2xl text-[12px] font-bold transition-all"
                  style={{
                    background: 'rgba(57,168,155,0.08)',
                    border:     '1px solid rgba(57,168,155,0.22)',
                    color:      '#39a89b',
                  }}
                >
                  <CalendarPlus className="h-4 w-4" />
                  Book Session
                </motion.button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};