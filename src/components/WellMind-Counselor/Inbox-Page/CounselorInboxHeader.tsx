import { motion } from 'framer-motion';
import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { UserRound } from 'lucide-react';
import type { ChatConversation } from '@/lib/realtimeCounselorChat';

interface CounselorInboxHeaderProps {
  activeConversation: ChatConversation;
  onBack: () => void;
  onVideoCall?: () => void;
  onAudioCall?: () => void;
}

export const CounselorInboxHeader = ({
  activeConversation,
  onBack,
  onVideoCall,
  onAudioCall,
}: CounselorInboxHeaderProps) => {
  return (
    <header
      className="flex items-center gap-3 px-4"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 14px)',
        paddingBottom: 12,
        background: 'rgba(238,244,247,0.96)',
        borderBottom: '0.5px solid rgba(74,144,164,0.16)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Back button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={onBack}
        className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        aria-label="Back to inbox"
      >
        <ArrowLeft className="h-4 w-4" style={{ color: '#5f7585' }} />
      </motion.button>

      {/* Avatar */}
      <div
        className="h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: '#eaf3f7' }}
      >
        <UserRound className="h-5 w-5" style={{ color: '#4a90a4' }} />
      </div>

      {/* User info */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold truncate" style={{ color: '#1a2b38' }}>
          {activeConversation.userName}
        </p>
        <p className="text-[11px] font-semibold" style={{ color: '#4a90a4' }}>
          Active chat
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {onAudioCall && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onAudioCall}
            className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: 'rgba(74,144,164,0.12)',
            }}
            aria-label="Start audio call"
          >
            <Phone className="h-4 w-4" style={{ color: '#4a90a4' }} />
          </motion.button>
        )}

        {onVideoCall && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onVideoCall}
            className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: 'rgba(74,144,164,0.12)',
            }}
            aria-label="Start video call"
          >
            <Video className="h-4 w-4" style={{ color: '#4a90a4' }} />
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: 'rgba(74,144,164,0.12)',
          }}
          aria-label="More options"
        >
          <MoreVertical className="h-4 w-4" style={{ color: '#4a90a4' }} />
        </motion.button>
      </div>
    </header>
  );
};

export default CounselorInboxHeader;
