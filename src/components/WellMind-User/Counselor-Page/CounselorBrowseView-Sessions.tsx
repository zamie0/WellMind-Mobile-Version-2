import { motion } from 'framer-motion';
import { CalendarDays, MessageCircle, Video, X } from 'lucide-react';
import { formatDateTime } from './CounselorSupportChat.utils';
import type { CounselorUser } from '@/types/wellmind';
import type { CounsellorAppointment } from '@/stores/counselorChatStore';

interface CounselorBrowseSessionsProps {
  visibleAppointments: CounsellorAppointment[];
  availableCounselors: CounselorUser[];
  cancelAppointment: (id: string) => void;
}

const AppointmentStatusBadge = ({ status }: { status: string }) => {
  const styleMap: Record<string, React.CSSProperties> = {
    requested: { background: 'rgba(251,191,36,0.12)', color: '#d97706' },
    confirmed: { background: 'rgba(57,168,155,0.12)', color: '#39a89b' },
    completed: { background: 'rgba(0,0,0,0.06)', color: '#8fa3b1' },
    cancelled: { background: 'rgba(239,68,68,0.1)', color: '#dc2626' },
    missed: { background: 'rgba(232,115,90,0.1)', color: '#e8735a' },
  };
  const s = styleMap[status] ?? styleMap.requested;
  return (
    <span
      className="inline-block text-[10px] uppercase tracking-widest font-semibold px-2.5 py-0.5 rounded-full"
      style={s}
    >
      {status}
    </span>
  );
};

const EmptyState = ({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 gap-3 text-center"
  >
    <div
      className="w-14 h-14 rounded-full flex items-center justify-center"
      style={{ background: 'rgba(57,168,155,0.1)' }}
    >
      {icon}
    </div>
    <p className="text-sm font-semibold" style={{ color: '#1a2b38' }}>{title}</p>
    <p className="text-xs leading-relaxed max-w-[220px]" style={{ color: '#8fa3b1' }}>{desc}</p>
  </motion.div>
);

export const CounselorBrowseSessions = ({
  visibleAppointments,
  availableCounselors,
  cancelAppointment,
}: CounselorBrowseSessionsProps) => {
  if (visibleAppointments.length === 0) {
    return (
      <EmptyState
        icon={<CalendarDays className="h-6 w-6" style={{ color: '#39a89b' }} />}
        title="No upcoming sessions"
        desc="Book a session from the Counselors tab."
      />
    );
  }

  return (
    <div className="space-y-2.5">
      {[...visibleAppointments]
        .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
        .map((appt, i) => {
          const counselor = availableCounselors.find((p) => p.id === appt.counselorId);
          if (!counselor) return null;
          return (
            <motion.div
              key={appt.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl p-4 flex items-center gap-3.5"
              style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.055)' }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: appt.consultationType === 'video'
                    ? 'rgba(107,171,158,0.12)'
                    : 'rgba(232,115,90,0.1)',
                }}
              >
                {appt.consultationType === 'video'
                  ? <Video className="h-5 w-5" style={{ color: '#6bab9e' }} />
                  : <MessageCircle className="h-5 w-5" style={{ color: '#e8735a' }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm mb-0.5" style={{ color: '#1a2b38' }}>
                  {counselor.displayName}
                </p>
                <p className="text-xs mb-1.5" style={{ color: '#8fa3b1' }}>
                  {formatDateTime(appt.appointmentDate, appt.slot)}
                </p>
                <AppointmentStatusBadge status={appt.status} />
              </div>
              <button
                onClick={() => cancelAppointment(appt.id)}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(239,68,68,0.06)', color: '#e8735a' }}
                aria-label="Cancel appointment"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
    </div>
  );
};