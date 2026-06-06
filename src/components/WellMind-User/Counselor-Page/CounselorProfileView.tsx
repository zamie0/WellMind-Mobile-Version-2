import { AnimatePresence, motion } from 'framer-motion';
import { CounselorAvatar, getStatusColor, getStatusPillStyle } from './CounselorAvatar';
import { MessageCircle, Star, Video, X } from 'lucide-react';
import type { CounselorUser } from '@/types/wellmind';

interface CounselorProfileViewProps {
  counselor: CounselorUser;
  onClose: () => void;
}

export const CounselorProfileView = ({ counselor, onClose }: CounselorProfileViewProps) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(26,43,56,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-full max-w-lg rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #f0f7f5 0%, #ffffff 100%)', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          className="px-5 py-4"
          style={{
            background: 'rgba(240,247,245,0.97)',
            backdropFilter: 'blur(12px)',
            borderBottom: '0.5px solid rgba(57,168,155,0.15)',
          }}
        >
          <div className="flex items-center gap-3">
            {/* Avatar with status dot */}
            <div className="relative flex-shrink-0">
              <CounselorAvatar counselor={counselor} size="lg" />
              <div
                className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 ${getStatusColor(counselor.status)}`}
                style={{ borderColor: '#f0f7f5' }}
              />
            </div>

            {/* Name + status */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base truncate" style={{ color: '#1a2b38' }}>
                {counselor.displayName}
              </p>
              <span
                className="inline-block text-[11px] font-semibold capitalize px-2 py-0.5 rounded-full mt-0.5"
                style={getStatusPillStyle(counselor.status)}
              >
                {counselor.status}
              </span>
            </div>

            {/* Close */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
              aria-label="Close"
            >
              <X className="h-4 w-4" style={{ color: '#5f7585' }} />
            </motion.button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">

          {/* Specialization */}
          {counselor.specialization && (
            <div
              className="rounded-2xl px-4 py-3"
              style={{ background: 'rgba(57,168,155,0.07)', border: '0.5px solid rgba(57,168,155,0.2)' }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#8fa3b1' }}>
                Specialization
              </p>
              <p className="text-sm font-semibold" style={{ color: '#1a2b38' }}>
                {counselor.specialization}
              </p>
            </div>
          )}

          {/* Bio */}
          <div
            className="rounded-2xl px-4 py-3"
            style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#8fa3b1' }}>
              About
            </p>
            {counselor.bio ? (
              <p className="text-sm leading-relaxed" style={{ color: '#1a2b38' }}>
                {counselor.bio}
              </p>
            ) : (
              <p className="text-sm" style={{ color: '#8fa3b1' }}>No public bio available.</p>
            )}
          </div>

          {/* Rating + Experience */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-2xl px-4 py-3"
              style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#8fa3b1' }}>
                Rating
              </p>
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold" style={{ color: '#1a2b38' }}>
                  {counselor.rating?.toFixed(1) ?? 'N/A'}
                </span>
              </div>
            </div>
            <div
              className="rounded-2xl px-4 py-3"
              style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#8fa3b1' }}>
                Experience
              </p>
              <p className="text-sm font-bold" style={{ color: '#1a2b38' }}>
                {counselor.experienceYears ? `${counselor.experienceYears} yrs` : 'Not listed'}
              </p>
            </div>
          </div>

          {/* Topics */}
          <div
            className="rounded-2xl px-4 py-3"
            style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-2.5" style={{ color: '#8fa3b1' }}>
              Topics
            </p>
            {counselor.supportTopics.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {counselor.supportTopics.map((topic) => (
                  <span
                    key={topic}
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: 'rgba(57,168,155,0.1)', color: '#39a89b' }}
                  >
                    {topic}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: '#8fa3b1' }}>No topics listed.</p>
            )}
          </div>

          {/* Consultation methods */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-2xl px-4 py-3 flex items-center gap-3"
              style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(57,168,155,0.1)' }}
              >
                <MessageCircle className="h-4 w-4" style={{ color: '#39a89b' }} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#8fa3b1' }}>Chat</p>
                <p className="text-xs font-bold mt-0.5" style={{ color: '#1a2b38' }}>Available</p>
              </div>
            </div>
            <div
              className="rounded-2xl px-4 py-3 flex items-center gap-3"
              style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(57,168,155,0.1)' }}
              >
                <Video className="h-4 w-4" style={{ color: '#39a89b' }} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#8fa3b1' }}>Video</p>
                <p className="text-xs font-bold mt-0.5" style={{ color: '#1a2b38' }}>
                  {counselor.consultationMethods?.includes('video') ? 'Supported' : 'Not available'}
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #39a89b, #6bab9e)',
              boxShadow: '0 4px 14px rgba(57,168,155,0.35)',
            }}
          >
            <MessageCircle className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Back to Chat</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);