import { Camera, File, FileText, Image, Paperclip, Send, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import type { ChatAttachment } from '@/types/wellmind';
import type { ChangeEvent, KeyboardEvent } from 'react';

interface CounselorInboxInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: (attachment?: ChatAttachment) => void | Promise<void>;
  disabled?: boolean;
}

const ATTACH_OPTIONS = [
  { id: 'image', label: 'Image', icon: Image, accent: '#39a89b', bg: 'rgba(57,168,155,0.12)' },
  { id: 'camera', label: 'Camera', icon: Camera, accent: '#4a90a4', bg: 'rgba(74,144,164,0.12)' },
  { id: 'file', label: 'File', icon: FileText, accent: '#7c6fa0', bg: 'rgba(124,111,160,0.12)' },
] as const;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageMime(mime: string) {
  return mime.startsWith('image/');
}

function fallbackMimeType(file: globalThis.File, attachmentType: 'image' | 'file') {
  if (file.type) return file.type;
  if (attachmentType === 'image') return 'image/jpeg';
  return 'application/octet-stream';
}

export const CounselorInboxInput = ({
  input,
  onInputChange,
  onSend,
  disabled = false,
}: CounselorInboxInputProps) => {
  const [showAttach, setShowAttach] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<ChatAttachment | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = (e: ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxMb = 5;
    if (file.size > maxMb * 1024 * 1024) {
      toast.error(`File too large. Max ${maxMb} MB allowed.`);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPendingAttachment({
        id: crypto.randomUUID(),
        name: file.name,
        type: isImageMime(file.type) ? 'image' : 'file',
        mimeType: fallbackMimeType(file, type),
        base64: reader.result as string,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
    setShowAttach(false);
  };

  const triggerInput = (id: string) => {
    if (id === 'image') imageInputRef.current?.click();
    else if (id === 'camera') cameraInputRef.current?.click();
    else if (id === 'file') fileInputRef.current?.click();
    setShowAttach(false);
  };

  const handleSend = () => {
    if (disabled || (!input.trim() && !pendingAttachment)) return;
    void onSend(pendingAttachment ?? undefined);
    setPendingAttachment(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = input.trim().length > 0 || pendingAttachment !== null;

  return (
    <footer
      className="px-4 relative"
      style={{
        paddingTop: 10,
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)',
        background: 'rgba(238,244,247,0.97)',
        borderTop: '0.5px solid rgba(74,144,164,0.16)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => handleFileSelected(e, 'image')} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => handleFileSelected(e, 'image')} />
      <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.xls,.xlsx" className="hidden"
        onChange={(e) => handleFileSelected(e, 'file')} />

      <AnimatePresence>
        {showAttach && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10"
              onClick={() => setShowAttach(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="absolute left-4 right-4 z-20 rounded-3xl overflow-hidden"
              style={{
                bottom: 'calc(100% + 8px)',
                background: 'white',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: '0.5px solid rgba(74,144,164,0.15)',
              }}
            >
              <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg,#4a90a4,#7bbccc)' }} />
              <div className="p-3 flex gap-3">
                {ATTACH_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <motion.button
                      key={opt.id}
                      whileTap={{ scale: 0.94 }}
                      type="button"
                      onClick={() => triggerInput(opt.id)}
                      className="flex-1 flex flex-col items-center gap-2 py-3 rounded-2xl"
                      style={{ background: opt.bg }}
                    >
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                        style={{ background: 'white', boxShadow: `0 2px 8px ${opt.accent}22` }}>
                        <Icon className="h-5 w-5" style={{ color: opt.accent }} strokeWidth={1.75} />
                      </div>
                      <span className="text-[11px] font-semibold" style={{ color: opt.accent }}>
                        {opt.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingAttachment && (
          <motion.div
            initial={{ opacity: 0, y: 8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 8, height: 0 }}
            className="mb-2 overflow-hidden"
          >
            <div
              className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5"
              style={{ background: 'white', border: '1px solid rgba(74,144,164,0.20)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            >
              {pendingAttachment.type === 'image' ? (
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={pendingAttachment.base64} alt={pendingAttachment.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(124,111,160,0.10)' }}>
                  <File className="h-5 w-5" style={{ color: '#7c6fa0' }} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: '#1a2b38' }}>{pendingAttachment.name}</p>
                <p className="text-[10px] mt-0.5" style={{ color: '#8fa3b1' }}>{formatBytes(pendingAttachment.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => setPendingAttachment(null)}
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(232,115,90,0.12)' }}
                aria-label="Remove attachment"
              >
                <X className="h-3.5 w-3.5" style={{ color: '#e8735a' }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="flex items-center gap-2 rounded-full px-4 py-1.5"
        style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
      >
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => setShowAttach((value) => !value)}
          disabled={disabled}
          className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity"
          style={{ background: showAttach ? '#1a2b38' : 'rgba(143,163,177,0.12)', opacity: disabled ? 0.4 : 1 }}
          aria-label="Attach file"
        >
          <Paperclip className="h-4 w-4" style={{ color: showAttach ? 'white' : '#4a90a4' }} />
        </motion.button>

        <input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={pendingAttachment ? 'Add a caption...' : 'Reply to client...'}
          disabled={disabled}
          className="flex-1 bg-transparent border-none outline-none text-sm py-2"
          style={{ color: '#1a2b38' }}
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleSend}
          disabled={!canSend || disabled}
          className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity"
          style={{
            background: 'linear-gradient(135deg,#4a90a4,#7bbccc)',
            opacity: canSend && !disabled ? 1 : 0.4,
          }}
          aria-label="Send reply"
        >
          <Send className="h-4 w-4 text-white" />
        </motion.button>
      </div>
    </footer>
  );
};

export default CounselorInboxInput;
