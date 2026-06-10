import { Send, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface CounselorInboxInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void | Promise<void>;
  onAttachFile?: () => void;
  disabled?: boolean;
}

export const CounselorInboxInput = ({
  input,
  onInputChange,
  onSend,
  onAttachFile,
  disabled = false,
}: CounselorInboxInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && input.trim()) {
        void onSend();
      }
    }
  };

  return (
    <footer
      className="px-4"
      style={{
        paddingTop: 10,
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)',
        background: 'rgba(238,244,247,0.97)',
        borderTop: '0.5px solid rgba(74,144,164,0.16)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div
        className="flex items-center gap-2 rounded-full px-4 py-1.5"
        style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
      >
        {onAttachFile && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onAttachFile}
            disabled={disabled}
            className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity"
            style={{
              opacity: disabled ? 0.4 : 0.7,
            }}
            aria-label="Attach file"
          >
            <Plus className="h-4 w-4" style={{ color: '#4a90a4' }} />
          </motion.button>
        )}

        <input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Reply to client..."
          disabled={disabled}
          className="flex-1 bg-transparent border-none outline-none text-sm py-2"
          style={{ color: '#1a2b38' }}
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => void onSend()}
          disabled={!input.trim() || disabled}
          className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity"
          style={{
            background: 'linear-gradient(135deg,#4a90a4,#7bbccc)',
            opacity: input.trim() && !disabled ? 1 : 0.4,
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
