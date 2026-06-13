import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Camera, Trash2, Save } from 'lucide-react';
import { useWellMindStore } from '@/stores/wellmindStore';
import { toast } from 'sonner';

interface ProfileSettingsProps {
  onClose: () => void;
}

export default function ProfileSettings({ onClose }: ProfileSettingsProps) {
  const user = useWellMindStore((state) => state.user);
  const updateUser = useWellMindStore((state) => state.updateUser);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Please pick one under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatar(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = () => {
    updateUser({ name, email, avatar });
    toast.success('Profile updated!');
    onClose();
  };

  // Initials fallback
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <div
      className="min-h-screen pb-28"
      style={{ background: 'linear-gradient(180deg, #f0f7f5 0%, #f7faf9 60%, #ffffff 100%)' }}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImagePick}
      />

      {/* ── Header ── */}
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
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" style={{ color: '#5f7585' }} />
          </motion.button>

          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #39a89b, #6bab9e)',
                boxShadow: '0 2px 8px rgba(57,168,155,0.3)',
              }}
            >
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: '#1a2b38' }}>Profile Settings</p>
              <p className="text-[11px] font-semibold" style={{ color: '#39a89b' }}>
                Update your personal info
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden px-5 pt-8 pb-6">
        <div
          className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(57,168,155,0.13) 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute top-8 -left-12 w-48 h-48 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(107,171,158,0.08) 0%, transparent 70%)' }}
        />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h2
            className="text-[1.75rem] font-bold leading-tight mb-1.5"
            style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}
          >
            Your Profile.
          </h2>
          <p className="text-[14px] leading-relaxed" style={{ color: '#5f7585' }}>
            How WellMind knows you.
          </p>
        </motion.div>
      </div>

      <main className="px-5 space-y-4 pb-6">

        {/* ── Avatar card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, type: 'spring', stiffness: 280, damping: 26 }}
          className="rounded-3xl overflow-hidden"
          style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
        >
          <div
            className="h-0.5 w-full"
            style={{ background: 'linear-gradient(90deg, #39a89b, #39a89b88)' }}
          />
          <div className="p-5 flex flex-col items-center gap-4">
            {/* Avatar ring */}
            <div className="relative">
              <div
                className="w-24 h-24 rounded-3xl overflow-hidden flex items-center justify-center"
                style={{
                  background: avatar ? 'transparent' : 'linear-gradient(135deg, #39a89b, #6bab9e)',
                  boxShadow: '0 4px 20px rgba(57,168,155,0.25)',
                }}
              >
                {avatar ? (
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-white">{initials}</span>
                )}
              </div>

              {/* Camera button */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-9 h-9 rounded-2xl flex items-center justify-center"
                style={{
                  background: '#1a2b38',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                }}
                aria-label="Change photo"
              >
                <Camera className="h-4 w-4 text-white" />
              </motion.button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(57,168,155,0.10)', color: '#39a89b' }}
              >
                {avatar ? 'Change photo' : 'Upload photo'}
              </motion.button>

              {avatar && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5"
                  style={{ background: 'rgba(232,115,90,0.10)', color: '#e8735a' }}
                >
                  <Trash2 className="h-3 w-3" />
                  Remove
                </motion.button>
              )}
            </div>

            <p className="text-[10px]" style={{ color: '#8fa3b1' }}>
              JPG, PNG or GIF · Max 5 MB
            </p>
          </div>
        </motion.div>

        {/* ── Name field ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.13, type: 'spring', stiffness: 280, damping: 26 }}
          className="rounded-3xl overflow-hidden"
          style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
        >
          <div
            className="h-0.5 w-full"
            style={{ background: 'linear-gradient(90deg, #4a90a4, #4a90a488)' }}
          />
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(74,144,164,0.10)' }}
              >
                <User className="h-[18px] w-[18px]" style={{ color: '#4a90a4' }} strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#1a2b38' }}>Display Name</p>
                <p className="text-[11px]" style={{ color: '#8fa3b1' }}>How you appear in the app</p>
              </div>
            </div>

            <div
              className="h-px w-full mb-3"
              style={{ background: 'rgba(143,163,177,0.15)' }}
            />

            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
              style={{
                background: 'rgba(74,144,164,0.06)',
                color: '#1a2b38',
                border: '1px solid rgba(74,144,164,0.15)',
              }}
            />
          </div>
        </motion.div>

        {/* ── Email field ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, type: 'spring', stiffness: 280, damping: 26 }}
          className="rounded-3xl overflow-hidden"
          style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
        >
          <div
            className="h-0.5 w-full"
            style={{ background: 'linear-gradient(90deg, #7c6fa0, #7c6fa088)' }}
          />
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(124,111,160,0.10)' }}
              >
                <Mail className="h-[18px] w-[18px]" style={{ color: '#7c6fa0' }} strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#1a2b38' }}>Email Address</p>
                <p className="text-[11px]" style={{ color: '#8fa3b1' }}>For account recovery and alerts</p>
              </div>
            </div>

            <div
              className="h-px w-full mb-3"
              style={{ background: 'rgba(143,163,177,0.15)' }}
            />

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
              style={{
                background: 'rgba(124,111,160,0.06)',
                color: '#1a2b38',
                border: '1px solid rgba(124,111,160,0.15)',
              }}
            />
          </div>
        </motion.div>

        {/* ── Save button ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, type: 'spring', stiffness: 280, damping: 26 }}
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold text-white"
            style={{
              background: name.trim()
                ? 'linear-gradient(135deg, #39a89b, #6bab9e)'
                : '#c8d5db',
              boxShadow: name.trim() ? '0 4px 16px rgba(57,168,155,0.35)' : 'none',
              opacity: name.trim() ? 1 : 0.7,
            }}
          >
            <Save className="h-4 w-4" />
            Save Changes
          </motion.button>
        </motion.div>

      </main>
    </div>
  );
}