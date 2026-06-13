import { memo } from 'react';
import { motion } from 'framer-motion';
import { Download, ExternalLink, File } from 'lucide-react';
import type { ChatMessage } from '@/lib/realtimeCounselorChat';
import type { ChatAttachment } from '@/types/wellmind';

interface CounselorMessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  index: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function openAttachment(attachment: ChatAttachment) {
  window.open(attachment.base64, '_blank', 'noopener,noreferrer');
}

function downloadAttachment(attachment: ChatAttachment) {
  const link = document.createElement('a');
  link.href = attachment.base64;
  link.download = attachment.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
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
      className="max-w-[78%] rounded-2xl overflow-hidden"
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
      {message.attachment && (
        message.attachment.type === 'image' ? (
          <div>
            <button
              type="button"
              onClick={() => openAttachment(message.attachment!)}
              className="block w-full"
              aria-label={`Open ${message.attachment.name}`}
            >
              <img
                src={message.attachment.base64}
                alt={message.attachment.name}
                className="w-full max-h-52 object-cover"
                style={{ display: 'block' }}
              />
            </button>
            <AttachmentActions attachment={message.attachment} isOwn={isOwn} />
          </div>
        ) : (
          <div
            className="flex items-center gap-2.5 px-4 py-3"
            style={{
              background: isOwn ? 'rgba(0,0,0,0.12)' : 'rgba(124,111,160,0.08)',
              borderBottom: isOwn
                ? '1px solid rgba(255,255,255,0.10)'
                : '1px solid rgba(124,111,160,0.12)',
            }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: isOwn ? 'rgba(255,255,255,0.15)' : 'rgba(124,111,160,0.12)' }}
            >
              <File className="h-4 w-4" style={{ color: isOwn ? 'rgba(255,255,255,0.9)' : '#7c6fa0' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">
                {message.attachment.name}
              </p>
              <p className="text-[10px]" style={{ color: isOwn ? 'rgba(255,255,255,0.65)' : '#8fa3b1' }}>
                {formatBytes(message.attachment.size)}
              </p>
            </div>
            <AttachmentIconButton
              label={`Open ${message.attachment.name}`}
              icon="open"
              isOwn={isOwn}
              onClick={() => openAttachment(message.attachment!)}
            />
            <AttachmentIconButton
              label={`Download ${message.attachment.name}`}
              icon="download"
              isOwn={isOwn}
              onClick={() => downloadAttachment(message.attachment!)}
            />
          </div>
        )
      )}

      {(message.text || message.attachment) && (
        <div className="px-4 py-3">
          {message.text && <p className="text-sm leading-relaxed">{message.text}</p>}
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
      )}
    </div>
  </motion.div>
));

const AttachmentActions = ({ attachment, isOwn }: { attachment: ChatAttachment; isOwn: boolean }) => (
  <div
    className="flex items-center justify-end gap-2 px-3 py-2"
    style={{
      background: isOwn ? 'rgba(0,0,0,0.10)' : 'rgba(143,163,177,0.08)',
      borderBottom: isOwn ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(143,163,177,0.12)',
    }}
  >
    <AttachmentIconButton
      label={`Open ${attachment.name}`}
      icon="open"
      isOwn={isOwn}
      onClick={() => openAttachment(attachment)}
    />
    <AttachmentIconButton
      label={`Download ${attachment.name}`}
      icon="download"
      isOwn={isOwn}
      onClick={() => downloadAttachment(attachment)}
    />
  </div>
);

const AttachmentIconButton = ({
  label,
  icon,
  isOwn,
  onClick,
}: {
  label: string;
  icon: 'open' | 'download';
  isOwn: boolean;
  onClick: () => void;
}) => {
  const Icon = icon === 'open' ? ExternalLink : Download;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-8 h-8 rounded-full inline-flex items-center justify-center flex-shrink-0"
      style={{
        background: isOwn ? 'rgba(255,255,255,0.16)' : 'rgba(124,111,160,0.12)',
        color: isOwn ? 'white' : '#7c6fa0',
      }}
      aria-label={label}
      title={label}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
};

CounselorMessageBubble.displayName = 'CounselorMessageBubble';

export default CounselorMessageBubble;
