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
      // Request native Android permissions first
      if (isNative) {
        try {
          const result = await Camera.requestPermissions({
            permissions: ['camera', 'photos'],
          });

          if (result.camera !== 'granted') {
            toast.error(
              'Camera permission denied. Please enable it in Settings > Apps > WellMind > Permissions > Camera.',
            );
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
        // Web fallback
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

  return (
    <AnimatePresence>
      {incomingCall && (
        <motion.div
          key="incoming-call"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 left-0 right-0 z-[9999] mx-4 mt-6"
        >
          <div
            className="rounded-2xl shadow-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #39a89b 0%, #6bab9e 100%)',
            }}
          >
            <div className="px-6 py-5 flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white text-sm font-semibold">
                  Incoming {incomingCall.mode} call
                </p>
                <p className="text-white/90 text-xs mt-1">
                  {incomingCall.callerName}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReject}
                  className="h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(220, 38, 38, 0.9)' }}
                  aria-label="Reject call"
                >
                  <PhoneOff className="h-5 w-5 text-white" />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAccept}
                  className="h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(34, 197, 94, 0.9)' }}
                  aria-label="Accept call"
                >
                  {incomingCall.mode === 'video' ? (
                    <Video className="h-5 w-5 text-white" />
                  ) : (
                    <Phone className="h-5 w-5 text-white" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IncomingCallNotification;
