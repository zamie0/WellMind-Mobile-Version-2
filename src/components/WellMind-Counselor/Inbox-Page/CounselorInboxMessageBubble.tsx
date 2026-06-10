import { memo } from 'react';
import { motion } from 'framer-motion';
import type { ChatMessage } from '@/lib/realtimeCounselorChat';

interface CounselorMessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  index: number;
}

export const CounselorMessageBubble = memo(({
  message,
  isOwn,
  index,
}: CounselorMessageBubbleProps) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: Math.min(index * 0.01, 0.12) }}
    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
  >
    <div
      className="max-w-[78%] px-4 py-3 rounded-2xl"
      style={
        isOwn
          ? {
              background: message.failed
                ? '#c0502f'
                : 'linear-gradient(135deg,#4a90a4,#7bbccc)',
              color: 'white',
              borderBottomRightRadius: 5,
              opacity: message.optimistic ? 0.78 : 1,
            }
          : {
              background: 'white',
              color: '#1a2b38',
              borderBottomLeftRadius: 5,
              boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
            }
      }
    >
      <p className="text-sm leading-relaxed">{message.text}</p>
      <p
        className="text-[10px] mt-1"
        style={{
          color: isOwn ? 'rgba(255,255,255,0.72)' : '#8fa3b1',
          textAlign: isOwn ? 'right' : 'left',
        }}
      >
        {message.failed
          ? 'Failed'
          : message.optimistic
            ? 'Sending...'
            : new Date(message.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
      </p>
    </div>
  </motion.div>
));

CounselorMessageBubble.displayName = 'CounselorMessageBubble';

export default CounselorMessageBubble;
