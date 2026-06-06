import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Users } from 'lucide-react';
import type { CounselorUser } from '@/types/wellmind';

interface CounselorSetupViewProps {
  userName?: string;
  counselorProfile: CounselorUser | null;
  displayName: string;
  isAnonymous: boolean;
  bio: string;
  onDisplayNameChange: (value: string) => void;
  onIsAnonymousChange: (value: boolean) => void;
  onBioChange: (value: string) => void;
  onGoBack: () => void;
  onSubmit: () => void;
  embedded?: boolean;
}

export const CounselorSetupView = ({
  userName,
  counselorProfile,
  displayName,
  isAnonymous,
  bio,
  onDisplayNameChange,
  onIsAnonymousChange,
  onBioChange,
  onGoBack,
  onSubmit,
  embedded = false,
}: CounselorSetupViewProps) => (
  <div
    className={embedded ? '' : 'min-h-screen'}
    style={{ background: 'linear-gradient(180deg, #f0f7f5 0%, #f7faf9 60%, #ffffff 100%)' }}
  >
    {/* ── Header ──────────────────────────────────────────────── */}
    <header
      className="sticky top-0 z-10 px-5 py-3.5"
      style={{
        background: 'rgba(240,247,245,0.96)',
        backdropFilter: 'blur(12px)',
        borderBottom: '0.5px solid rgba(57,168,155,0.15)',
        paddingTop: 'max(env(safe-area-inset-top), 14px)',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Back button */}
        {!!counselorProfile && (
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={onGoBack}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" style={{ color: '#5f7585' }} />
          </motion.button>
        )}

        {/* Title */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #39a89b, #6bab9e)', boxShadow: '0 2px 8px rgba(57,168,155,0.3)' }}
          >
            <Users className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm truncate" style={{ color: '#1a2b38' }}>
              Set Up Your Profile
            </p>
            <p className="text-[11px] font-semibold" style={{ color: '#39a89b' }}>
              Join the support community
            </p>
          </div>
        </div>
      </div>
    </header>

    {/* ── Content ─────────────────────────────────────────────── */}
    <main className="px-5 py-5 space-y-4 pb-28">

      {/* Identity card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-3xl p-5"
        style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}
      >
        {/* Card header */}
        <div className="flex items-center gap-3 mb-5">
          <motion.div
            key={isAnonymous ? 'anon' : 'named'}
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(57,168,155,0.1)' }}
          >
            {isAnonymous
              ? <EyeOff className="h-6 w-6" style={{ color: '#39a89b' }} />
              : <Eye className="h-6 w-6" style={{ color: '#39a89b' }} />
            }
          </motion.div>
          <div>
            <p className="font-bold text-sm" style={{ color: '#1a2b38' }}>Choose Your Identity</p>
            <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: '#8fa3b1' }}>
              How your profile appears to counselors
            </p>
          </div>
        </div>

        {/* Option buttons */}
        <div className="space-y-2.5">
          {/* Anonymous */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => onIsAnonymousChange(true)}
            className="w-full text-left rounded-2xl p-4 transition-all"
            style={{
              border: isAnonymous
                ? '1.5px solid #39a89b'
                : '1.5px solid rgba(57,168,155,0.12)',
              background: isAnonymous
                ? 'rgba(57,168,155,0.07)'
                : 'white',
              boxShadow: isAnonymous
                ? '0 2px 10px rgba(57,168,155,0.12)'
                : '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(57,168,155,0.12)' }}
              >
                <EyeOff className="h-4 w-4" style={{ color: '#39a89b' }} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm" style={{ color: '#1a2b38' }}>Stay Anonymous</p>
                <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: '#8fa3b1' }}>
                  Only "Anonymous" is shown. Your name and details stay hidden.
                </p>
              </div>
              {isAnonymous && (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ml-auto"
                  style={{ background: 'linear-gradient(135deg, #39a89b, #6bab9e)' }}
                >
                  <svg viewBox="0 0 10 8" className="w-2.5 h-2.5" fill="none">
                    <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          </motion.button>

          {/* Public */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => onIsAnonymousChange(false)}
            className="w-full text-left rounded-2xl p-4 transition-all"
            style={{
              border: !isAnonymous
                ? '1.5px solid #39a89b'
                : '1.5px solid rgba(57,168,155,0.12)',
              background: !isAnonymous
                ? 'rgba(57,168,155,0.07)'
                : 'white',
              boxShadow: !isAnonymous
                ? '0 2px 10px rgba(57,168,155,0.12)'
                : '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(57,168,155,0.12)' }}
              >
                <Eye className="h-4 w-4" style={{ color: '#39a89b' }} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm" style={{ color: '#1a2b38' }}>Public Profile</p>
                <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: '#8fa3b1' }}>
                  Your display name is visible for a more personal connection.
                </p>
              </div>
              {!isAnonymous && (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ml-auto"
                  style={{ background: 'linear-gradient(135deg, #39a89b, #6bab9e)' }}
                >
                  <svg viewBox="0 0 10 8" className="w-2.5 h-2.5" fill="none">
                    <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          </motion.button>
        </div>

        {/* Privacy toggle row */}
        <div
          className="flex items-center justify-between mt-3.5 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(57,168,155,0.06)', border: '0.5px solid rgba(57,168,155,0.15)' }}
        >
          <p className="text-sm font-semibold" style={{ color: '#1a2b38' }}>Privacy Mode</p>
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-medium" style={{ color: '#8fa3b1' }}>
              {isAnonymous ? 'Anonymous' : 'Public'}
            </span>
            {/* Custom toggle */}
            <button
              type="button"
              onClick={() => onIsAnonymousChange(!isAnonymous)}
              className="relative rounded-full transition-all flex-shrink-0"
              style={{
                width: 44,
                height: 26,
                background: isAnonymous
                  ? 'linear-gradient(135deg, #39a89b, #6bab9e)'
                  : 'rgba(57,168,155,0.15)',
                boxShadow: isAnonymous ? '0 2px 8px rgba(57,168,155,0.3)' : 'none',
              }}
              aria-label="Toggle privacy mode"
            >
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 rounded-full"
                style={{
                  width: 18,
                  height: 18,
                  background: 'white',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                  left: isAnonymous ? 22 : 4,
                }}
              />
            </button>
          </div>
        </div>

        {/* Display name input (shown when public) */}
        <AnimatePresence>
          {!isAnonymous && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3.5">
                <label className="text-xs font-semibold block mb-1.5" style={{ color: '#5f7585' }}>
                  Display Name
                </label>
                <div
                  className="flex items-center rounded-xl px-4"
                  style={{
                    background: 'white',
                    border: '1px solid rgba(57,168,155,0.2)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  }}
                >
                  <input
                    value={displayName}
                    onChange={(e) => onDisplayNameChange(e.target.value)}
                    placeholder="How should others call you?"
                    className="flex-1 bg-transparent border-none outline-none text-sm py-3"
                    style={{ color: '#1a2b38' }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile preview */}
        <div
          className="mt-3.5 rounded-xl px-4 py-3"
          style={{
            border: '1px dashed rgba(57,168,155,0.3)',
            background: 'rgba(57,168,155,0.03)',
          }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: '#8fa3b1' }}>
            Profile Preview
          </p>
          <p className="text-xs" style={{ color: '#5f7585' }}>
            Others will see:{' '}
            <span className="font-bold" style={{ color: '#1a2b38' }}>
              {isAnonymous ? 'Anonymous' : displayName.trim() || userName || 'You'}
            </span>
          </p>
        </div>
      </motion.div>

      {/* Bio card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl p-5"
        style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}
      >
        <label className="text-xs font-semibold block mb-1.5" style={{ color: '#5f7585' }}>
          Short Bio{' '}
          <span style={{ color: '#8fa3b1', fontWeight: 400 }}>(optional)</span>
        </label>
        <textarea
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
          placeholder="Share a little about yourself or why you're here..."
          rows={3}
          className="w-full bg-transparent border-none outline-none text-sm resize-none leading-relaxed"
          style={{ color: '#1a2b38' }}
        />
        <div
          className="mt-2 h-px w-full"
          style={{ background: 'linear-gradient(90deg, rgba(57,168,155,0.3), transparent)' }}
        />
      </motion.div>

      {/* Info banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl px-4 py-3.5"
        style={{
          background: 'rgba(57,168,155,0.07)',
          border: '0.5px solid rgba(57,168,155,0.2)',
        }}
      >
        <p className="text-xs font-semibold mb-1 flex items-center gap-1.5" style={{ color: '#1a2b38' }}>
          💡 About Counselor Support
        </p>
        <p className="text-[11px] leading-relaxed" style={{ color: '#8fa3b1' }}>
          Connect with trained counselors who understand what you are going through. All conversations are private and confidential.
        </p>
      </motion.div>
    </main>

    {/* ── Submit Footer ────────────────────────────────────────── */}
    <footer
      className="fixed px-5 py-3 left-0 right-0"
      style={{
        bottom: 0,
        background: 'rgba(240,247,245,0.97)',
        backdropFilter: 'blur(12px)',
        borderTop: '0.5px solid rgba(57,168,155,0.15)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 12px)',
      }}
    >
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onSubmit}
        className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
        style={{
          background: 'linear-gradient(135deg, #39a89b, #6bab9e)',
          boxShadow: '0 4px 14px rgba(57,168,155,0.35)',
        }}
      >
        <Users className="h-4 w-4 text-white" />
        <span className="text-sm font-bold text-white">Find Counselors</span>
      </motion.button>
    </footer>
  </div>
);