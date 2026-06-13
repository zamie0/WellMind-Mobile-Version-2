import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';
import { useIncomingCallStore } from '@/stores/incomingCallStore';
import { useAppPermissions } from '@/hooks/useAppPermissions';

export const IncomingCallNotification = () => {
  const { incomingCall, acceptCall, rejectCall } = useIncomingCallStore();
  const { requestPermissions } = useAppPermissions();
  const isNative = Capacitor.isNativePlatform();

  const handleAccept = async () => {
    if (!incomingCall) return;
    try {
      if (isNative) {
        try {
          const result = await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
          if (result.camera !== 'granted') {
            toast.error('Camera permission denied. Enable it in Settings > Apps > WellMind > Permissions.');
            rejectCall();
            return;
          }
        } catch (error) {
          console.error('Failed to request permissions:', error);
          toast.error('Unable to access camera. Please check your phone settings.');
          rejectCall();
          return;
        }
      } else {
        await requestPermissions(['camera', 'microphone']);
      }
      acceptCall();
      toast.success(`${incomingCall.mode} call accepted`);
    } catch (error) {
      console.error('Permission request failed:', error);
      toast.error('Unable to grant permissions. Please try again.');
      rejectCall();
    }
  };

  const handleReject = () => {
    rejectCall();
    toast.info('Call rejected');
  };

  if (!incomingCall) return null;

  const isVideo = incomingCall.mode === 'video';

  return (
    <AnimatePresence>
      {incomingCall && (
        <motion.div
          key="incoming-call"
          initial={{ opacity: 0, y: -80, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -80, scale: 0.94 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="fixed top-0 left-0 right-0 z-[9999] flex justify-center"
          style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 14px)', paddingLeft: 16, paddingRight: 16 }}
        >
          <div
            className="w-full max-w-sm rounded-3xl overflow-hidden"
            style={{
              background: '#1a2b38',
              boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
            }}
          >
            <div className="px-5 py-4 flex items-center gap-4">
              {/* Avatar ring */}
              <div className="relative flex-shrink-0">
                <div
                  className="h-12 w-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(74,144,164,0.18)' }}
                >
                  <span
                    className="text-base font-bold"
                    style={{ color: '#7bbccc' }}
                  >
                    {incomingCall.callerName?.charAt(0)?.toUpperCase() ?? '?'}
                  </span>
                </div>
                {/* Pulse ring */}
                <motion.div
                  animate={{ scale: [1, 1.45], opacity: [0.4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: 'rgba(74,144,164,0.30)' }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {/* Mode pill */}
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: '#6bab9e' }}
                  />
                  <span
                    className="text-[10px] font-semibold tracking-widest uppercase"
                    style={{ color: '#6bab9e' }}
                  >
                    Incoming {isVideo ? 'video' : 'audio'} call
                  </span>
                </div>
                <p
                  className="text-sm font-bold truncate"
                  style={{ color: 'white' }}
                >
                  {incomingCall.callerName}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2.5 flex-shrink-0">
                {/* Reject */}
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={handleReject}
                  className="h-11 w-11 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(232,115,90,0.18)' }}
                  aria-label="Reject call"
                >
                  <PhoneOff className="h-4.5 w-4.5" style={{ color: '#e8735a' }} />
                </motion.button>

                {/* Accept */}
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={handleAccept}
                  className="h-11 w-11 rounded-2xl flex items-center justify-center"
                  style={{ background: '#4a90a4' }}
                  aria-label="Accept call"
                >
                  {isVideo ? (
                    <Video className="h-4.5 w-4.5 text-white" />
                  ) : (
                    <Phone className="h-4.5 w-4.5 text-white" />
                  )}
                </motion.button>
              </div>
            </div>

            {/* Bottom hint bar */}
            <div
              className="px-5 py-2 flex items-center justify-between"
              style={{ background: 'rgba(255,255,255,0.04)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.30)' }}>
                Tap accept to join
              </span>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2, ease: 'easeInOut' }}
                    className="h-1 w-1 rounded-full"
                    style={{ background: '#4a90a4' }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IncomingCallNotification;