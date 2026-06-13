import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Minimize2, Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

interface CounselorVideoCallProps {
  remoteUserName: string;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'failed';
  onHangup: () => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
}

export const CounselorVideoCall = ({
  remoteUserName,
  localStream,
  remoteStream,
  isAudioEnabled,
  isVideoEnabled,
  connectionState,
  onHangup,
  onMinimize,
  isMinimized = false,
  onToggleAudio,
  onToggleVideo,
}: CounselorVideoCallProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-24 right-4 w-24 h-32 rounded-2xl overflow-hidden cursor-pointer"
        onClick={onMinimize}
        style={{
          zIndex: 100001,
          background: 'linear-gradient(135deg, #4a90a4, #7bbccc)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        }}
      >
        <video
          ref={localVideoRef}
          autoPlay
          muted
          className="w-full h-full object-cover"
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      key="video-call"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      className="fixed inset-0 flex flex-col bg-black"
      style={{ zIndex: 100001 }}
    >
      <div className="flex-1 relative bg-gray-900">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        <motion.div
          className="absolute bottom-20 right-4 w-32 h-48 rounded-2xl overflow-hidden border-2"
          style={{ borderColor: '#4a90a4', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
        >
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </motion.div>

        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">{remoteUserName}</p>
              <p className="text-white/70 text-xs">
                {connectionState === 'connecting' && 'Connecting...'}
                {connectionState === 'connected' && 'Connected'}
                {connectionState === 'failed' && 'Connection failed'}
              </p>
            </div>
            {onMinimize && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onMinimize}
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.2)' }}
              >
                <Minimize2 className="h-5 w-5 text-white" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      <div
        className="px-4 py-6 flex items-center justify-center gap-4"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleAudio}
          className="h-14 w-14 rounded-full flex items-center justify-center"
          style={{
            background: isAudioEnabled ? 'rgba(255,255,255,0.2)' : 'rgba(255, 107, 107, 0.6)',
          }}
        >
          {isAudioEnabled ? (
            <Mic className="h-6 w-6 text-white" />
          ) : (
            <MicOff className="h-6 w-6 text-white" />
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleVideo}
          className="h-14 w-14 rounded-full flex items-center justify-center"
          style={{
            background: isVideoEnabled ? 'rgba(255,255,255,0.2)' : 'rgba(255, 107, 107, 0.6)',
          }}
        >
          {isVideoEnabled ? (
            <Video className="h-6 w-6 text-white" />
          ) : (
            <VideoOff className="h-6 w-6 text-white" />
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onHangup}
          className="h-14 w-14 rounded-full flex items-center justify-center"
          style={{ background: 'rgb(220, 38, 38)' }}
        >
          <PhoneOff className="h-6 w-6 text-white" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CounselorVideoCall;
