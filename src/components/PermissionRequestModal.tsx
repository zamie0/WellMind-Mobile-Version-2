import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Mic, Bell, HardDrive, Image, X, Check } from 'lucide-react';
import { useState } from 'react';
import type { PermissionType } from '@/hooks/useAppPermissions';

interface PermissionRequestModalProps {
  isOpen: boolean;
  onRequestPermissions: (types: PermissionType[]) => Promise<void>;
  onClose: () => void;
}

const PERMISSIONS_LIST: Array<{
  type: PermissionType;
  label: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  bg: string;
}> = [
  {
    type: 'camera',
    label: 'Camera',
    description: 'Video calls with counselors',
    icon: <Camera className="h-5 w-5" />,
    accent: '#e8735a',
    bg: 'rgba(232,115,90,0.10)',
  },
  {
    type: 'microphone',
    label: 'Microphone',
    description: 'Audio calls & consultations',
    icon: <Mic className="h-5 w-5" />,
    accent: '#4a90a4',
    bg: 'rgba(74,144,164,0.10)',
  },
  {
    type: 'notifications',
    label: 'Notifications',
    description: 'Appointment & message alerts',
    icon: <Bell className="h-5 w-5" />,
    accent: '#6bab9e',
    bg: 'rgba(107,171,158,0.10)',
  },
  {
    type: 'storage',
    label: 'Storage',
    description: 'Offline access and saved app data',
    icon: <HardDrive className="h-5 w-5" />,
    accent: '#c97d1a',
    bg: 'rgba(201,125,26,0.10)',
  },
  {
    type: 'photos',
    label: 'Photos',
    description: 'Share images in counselor chats',
    icon: <Image className="h-5 w-5" />,
    accent: '#39a89b',
    bg: 'rgba(57,168,155,0.10)',
  },
];

export const PermissionRequestModal = ({
  isOpen,
  onRequestPermissions,
  onClose,
}: PermissionRequestModalProps) => {
  const [selected, setSelected] = useState<Set<PermissionType>>(
    new Set(PERMISSIONS_LIST.map((permission) => permission.type)),
  );
  const [isLoading, setIsLoading] = useState(false);

  const toggle = (type: PermissionType) => {
    const next = new Set(selected);
    next.has(type) ? next.delete(type) : next.add(type);
    setSelected(next);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onRequestPermissions(Array.from(selected));
      onClose();
    } catch {
      // errors handled by parent
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ background: 'rgba(15,25,35,0.60)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="w-full max-w-sm rounded-[2rem] overflow-hidden"
            style={{ background: '#f8fbfc' }}
          >
            {/* Dark header */}
            <div
              className="px-6 pt-7 pb-6 relative"
              style={{ background: '#1a2b38' }}
            >
              {/* Close */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-5 right-5 h-8 w-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.10)' }}
                aria-label="Close"
              >
                <X className="h-4 w-4 text-white" />
              </button>

              {/* Label pill */}
              <div
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-3"
                style={{ background: 'rgba(74,144,164,0.22)' }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#7bbccc' }}
                />
                <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: '#7bbccc' }}>
                  Permissions
                </span>
              </div>

              <h2 className="text-[1.45rem] font-bold leading-tight text-white mb-1">
                Allow WellMind access
              </h2>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Choose what the app can use. You can change these anytime.
              </p>
            </div>

            {/* Permission tiles */}
            <div className="px-5 pt-5 pb-3">
              <div className="grid grid-cols-1 gap-2.5">
                {PERMISSIONS_LIST.map((perm, i) => {
                  const isOn = selected.has(perm.type);
                  return (
                    <motion.button
                      key={perm.type}
                      type="button"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04 * i, duration: 0.22 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggle(perm.type)}
                      className="flex items-center gap-3.5 w-full text-left rounded-2xl px-4 py-3.5 transition-colors"
                      style={{
                        background: isOn ? perm.bg : 'white',
                        border: `1.5px solid ${isOn ? perm.accent : '#e2eaed'}`,
                      }}
                    >
                      {/* Icon */}
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isOn ? `${perm.accent}22` : '#f0f5f7',
                          color: isOn ? perm.accent : '#8fa3b1',
                        }}
                      >
                        {perm.icon}
                      </div>

                      {/* Label */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold"
                          style={{ color: isOn ? '#1a2b38' : '#5f7585' }}
                        >
                          {perm.label}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: '#8fa3b1' }}>
                          {perm.description}
                        </p>
                      </div>

                      {/* Toggle */}
                      <div
                        className="h-6 w-11 rounded-full flex-shrink-0 relative transition-colors"
                        style={{ background: isOn ? perm.accent : '#dde6ea' }}
                      >
                        <motion.div
                          animate={{ x: isOn ? 20 : 2 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                          className="absolute top-1 h-4 w-4 rounded-full bg-white flex items-center justify-center"
                        >
                          {isOn && (
                            <Check className="h-2.5 w-2.5" style={{ color: perm.accent }} />
                          )}
                        </motion.div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pt-3 pb-6">
              <div className="flex items-center justify-between mb-4 px-1">
                <span className="text-xs" style={{ color: '#8fa3b1' }}>
                  {selected.size === 0
                    ? 'No permissions selected'
                    : `${selected.size} of ${PERMISSIONS_LIST.length} selected`}
                </span>
                {selected.size > 0 && selected.size < PERMISSIONS_LIST.length && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelected(new Set(PERMISSIONS_LIST.map((p) => p.type)))
                    }
                    className="text-xs font-semibold"
                    style={{ color: '#4a90a4' }}
                  >
                    Select all
                  </button>
                )}
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={isLoading || selected.size === 0}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white"
                style={{
                  background:
                    selected.size > 0
                      ? 'linear-gradient(135deg,#1a2b38,#2e4a5e)'
                      : '#c8d5db',
                  opacity: isLoading ? 0.7 : 1,
                  letterSpacing: '0.01em',
                }}
              >
                {isLoading ? 'Requesting access...' : 'Allow selected'}
              </motion.button>

              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="w-full mt-2.5 py-3 rounded-2xl text-sm font-semibold"
                style={{ color: '#5f7585', background: 'transparent' }}
              >
                Skip for now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PermissionRequestModal;
