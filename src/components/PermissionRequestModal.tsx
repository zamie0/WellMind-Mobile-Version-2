import { motion } from 'framer-motion';
import { Camera, Mic, Bell, HardDrive, Image, ChevronRight, X } from 'lucide-react';
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
  color: string;
}> = [
  {
    type: 'camera',
    label: 'Camera',
    description: 'For video calls with counselors',
    icon: <Camera className="h-6 w-6" />,
    color: '#e8735a',
  },
  {
    type: 'microphone',
    label: 'Microphone',
    description: 'For audio calls and consultations',
    icon: <Mic className="h-6 w-6" />,
    color: '#4a90a4',
  },
  {
    type: 'notifications',
    label: 'Notifications',
    description: 'Get updates about appointments and messages',
    icon: <Bell className="h-6 w-6" />,
    color: '#6bab9e',
  },
  {
    type: 'storage',
    label: 'Storage',
    description: 'Save your data and offline access',
    icon: <HardDrive className="h-6 w-6" />,
    color: '#c97d1a',
  },
  {
    type: 'photos',
    label: 'Photos',
    description: 'Share photos in consultations',
    icon: <Image className="h-6 w-6" />,
    color: '#39a89b',
  },
];

export const PermissionRequestModal = ({
  isOpen,
  onRequestPermissions,
  onClose,
}: PermissionRequestModalProps) => {
  const [selectedPermissions, setSelectedPermissions] = useState<Set<PermissionType>>(
    new Set(['camera', 'microphone', 'notifications'])
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleTogglePermission = (type: PermissionType) => {
    const newSet = new Set(selectedPermissions);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    setSelectedPermissions(newSet);
  };

  const handleRequestAll = async () => {
    setIsLoading(true);
    try {
      await onRequestPermissions(Array.from(selectedPermissions));
      onClose();
    } catch (error) {
      console.error('Failed to request permissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="mx-4 w-full max-w-sm rounded-3xl overflow-hidden"
        style={{ background: 'white', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
      >
        {/* Header */}
        <div
          className="px-6 pt-6 pb-4"
          style={{
            background: 'linear-gradient(135deg, #4a90a4, #7bbccc)',
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-xl font-bold text-white">App Permissions</h2>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255, 255, 255, 0.2)' }}
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
          <p className="text-sm text-white/80">
            Enable these permissions to get the best experience with WellMind
          </p>
        </div>

        {/* Permissions list */}
        <div className="px-6 py-4 space-y-3 max-h-96 overflow-y-auto">
          {PERMISSIONS_LIST.map((perm) => (
            <motion.button
              key={perm.type}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => handleTogglePermission(perm.type)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-colors"
              style={{
                background: selectedPermissions.has(perm.type)
                  ? `${perm.color}15`
                  : 'transparent',
                borderColor: selectedPermissions.has(perm.type)
                  ? perm.color
                  : '#e5e7eb',
              }}
            >
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `${perm.color}25`,
                  color: perm.color,
                }}
              >
                {perm.icon}
              </div>

              <div className="flex-1 text-left">
                <p
                  className="font-semibold text-sm"
                  style={{ color: '#1a2b38' }}
                >
                  {perm.label}
                </p>
                <p className="text-xs" style={{ color: '#8fa3b1' }}>
                  {perm.description}
                </p>
              </div>

              <div
                className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                style={{
                  background: selectedPermissions.has(perm.type)
                    ? perm.color
                    : '#e5e7eb',
                }}
              >
                {selectedPermissions.has(perm.type) && (
                  <ChevronRight className="h-4 w-4 text-white" />
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t"
          style={{ borderColor: '#e5e7eb' }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleRequestAll}
            disabled={isLoading || selectedPermissions.size === 0}
            className="w-full py-3 rounded-xl font-semibold text-white transition-opacity"
            style={{
              background:
                selectedPermissions.size > 0
                  ? 'linear-gradient(135deg, #4a90a4, #7bbccc)'
                  : '#ccc',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? 'Requesting permissions...' : 'Continue'}
          </motion.button>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl font-semibold transition-colors"
            style={{
              background: 'transparent',
              color: '#4a90a4',
              border: '2px solid #4a90a4',
            }}
          >
            Skip for now
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PermissionRequestModal;
