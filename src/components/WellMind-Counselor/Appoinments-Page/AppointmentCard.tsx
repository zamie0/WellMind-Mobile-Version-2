import { motion } from 'framer-motion';
import {
  CalendarCheck2,
  CheckCircle2,
  Clock,
  MessageSquare,
  Timer,
  Video,
  XCircle,
  User,
  MapPin,
} from 'lucide-react';
import type { CounsellorAppointment } from '@/stores/counselorChatStore';
import type { AppointmentStatus } from '@/stores/counselorChatStore';

/* ── Status config ──────────────────────────────────────────────── */
const statusConfig: Record<AppointmentStatus, { bg: string; color: string; label: string; stripe: string }> = {
  requested: {
    bg:     'rgba(232,179,90,0.13)',
    color:  '#c97d1a',
    label:  'Requested',
    stripe: 'linear-gradient(90deg, #e8b35a, #f0c97a)',
  },
  confirmed: {
    bg:     'rgba(57,168,155,0.12)',
    color:  '#2a8f84',
    label:  'Confirmed',
    stripe: 'linear-gradient(90deg, #39a89b, #6bab9e)',
  },
  completed: {
    bg:     'rgba(107,171,158,0.13)',
    color:  '#3d7a72',
    label:  'Completed',
    stripe: 'linear-gradient(90deg, #6bab9e, #8fc4bb)',
  },
  cancelled: {
    bg:     'rgba(232,115,90,0.12)',
    color:  '#c0502f',
    label:  'Cancelled',
    stripe: 'linear-gradient(90deg, #e8735a, #e89b7a)',
  },
  missed: {
    bg:     'rgba(143,163,177,0.13)',
    color:  '#6b87a0',
    label:  'Missed',
    stripe: 'linear-gradient(90deg, #8fa3b1, #b0c4ce)',
  },
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-MY', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

interface AppointmentCardProps {
  appointment: CounsellorAppointment;
  client?: { displayName?: string; email?: string } | undefined;
  index: number;
  onConfirm:      () => void;
  onComplete:     () => void;
  onCancel:       () => void;
  onOpenSession:  () => void;
}

export const AppointmentCard = ({
  appointment,
  client,
  index,
  onConfirm,
  onComplete,
  onCancel,
  onOpenSession,
}: AppointmentCardProps) => {
  const cfg     = statusConfig[appointment.status];
  const isVideo = appointment.consultationType === 'video';
  const isPast  = new Date(appointment.appointmentDate) < new Date(new Date().toDateString());
  const canAct  = appointment.status !== 'completed' && appointment.status !== 'cancelled';
  const canOpen = appointment.status === 'confirmed' || appointment.status === 'requested';

  /* Icon & tint for consultation type */
  const typeAccent = isVideo ? '#8fa3b1' : '#39a89b';
  const typeBg     = isVideo ? 'rgba(143,163,177,0.12)' : 'rgba(57,168,155,0.12)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.28 + index * 0.06 }}
      className="rounded-3xl overflow-hidden"
      style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
    >
      {/* ── Status stripe ───────────────────────────────────── */}
      <div className="h-1 w-full" style={{ background: cfg.stripe }} />

      <div className="px-4 pt-4 pb-4">

        {/* ── Top section: avatar + client info + status badge ── */}
        <div className="flex items-start gap-3 mb-3">

          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: typeBg }}
          >
            <User className="h-5 w-5" style={{ color: typeAccent }} />
          </div>

          {/* Name + badge */}
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-bold text-[15px]" style={{ color: '#1a2b38' }}>
                {client?.displayName || 'Unknown client'}
              </span>
              <span
                className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                style={{ background: cfg.bg, color: cfg.color }}
              >
                {cfg.label}
              </span>
            </div>
            {client?.email && (
              <p className="text-xs truncate" style={{ color: '#8fa3b1' }}>
                {client.email}
              </p>
            )}
          </div>

          {/* Consultation type pill — top right */}
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 flex-shrink-0"
            style={{ background: typeBg }}
          >
            {isVideo
              ? <Video      className="h-3.5 w-3.5" style={{ color: typeAccent }} />
              : <MessageSquare className="h-3.5 w-3.5" style={{ color: typeAccent }} />
            }
            <span className="text-[11px] font-bold" style={{ color: typeAccent }}>
              {isVideo ? 'Video' : 'Chat'}
            </span>
          </div>
        </div>

        {/* ── Date / time info row ─────────────────────────── */}
        <div
          className="flex items-center gap-3 rounded-2xl px-3 py-2.5 mb-3"
          style={{ background: 'rgba(240,247,245,0.75)' }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(57,168,155,0.12)' }}
          >
            <CalendarCheck2 className="h-4 w-4" style={{ color: '#39a89b' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold" style={{ color: '#1a2b38' }}>
              {formatDate(appointment.appointmentDate)}
            </p>
            <p className="text-[11px]" style={{ color: '#5f7585' }}>
              {appointment.slot}
              {isPast && (
                <span
                  className="ml-2 font-semibold px-1.5 py-0.5 rounded-md text-[10px]"
                  style={{ background: 'rgba(232,115,90,0.12)', color: '#c0502f' }}
                >
                  Past
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-1" style={{ color: '#8fa3b1' }}>
            <Timer className="h-3.5 w-3.5" />
            <span className="text-[11px]">
              {isVideo ? 'Video' : 'Chat'} session
            </span>
          </div>
        </div>

        {/* ── Notes ───────────────────────────────────────── */}
        {appointment.notes && (
          <div
            className="rounded-2xl px-3 py-2.5 mb-3 text-xs leading-relaxed"
            style={{ background: 'rgba(240,247,245,0.8)', color: '#5f7585' }}
          >
            <span className="font-semibold" style={{ color: '#3d7a72' }}>Note · </span>
            {appointment.notes}
          </div>
        )}

        {/* ── Action buttons ───────────────────────────────── */}
        {canAct && (
          <div style={{ borderTop: '0.5px solid var(--color-border-tertiary, #e5e7eb)', paddingTop: 12, marginTop: 12 }}>

            {/* Primary actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              {appointment.status === 'requested' && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={onConfirm}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    fontSize: 13, fontWeight: 500, padding: '10px 0', borderRadius: 10,
                    border: 'none', cursor: 'pointer', width: '100%',
                    background: '#e1f5ee', color: '#085041',
                  }}
                >
                  <CheckCircle2 size={15} /> Confirm
                </motion.button>
              )}

              {canOpen && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={onOpenSession}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    fontSize: 13, fontWeight: 500, padding: '10px 0', borderRadius: 10,
                    border: 'none', cursor: 'pointer', width: '100%',
                    // span full width when Confirm is absent (confirmed status)
                    gridColumn: appointment.status === 'confirmed' ? '1 / -1' : undefined,
                    background: '#e6f1fb', color: '#0c447c',
                  }}
                >
                  <MessageSquare size={15} /> Open session
                </motion.button>
              )}
            </div>

            {/* Secondary actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onComplete}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  fontSize: 13, fontWeight: 500, padding: '10px 0', borderRadius: 10,
                  cursor: 'pointer', width: '100%',
                  background: 'var(--color-background-secondary)',
                  border: '0.5px solid var(--color-border-secondary)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <Clock size={15} /> Complete
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onCancel}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  fontSize: 13, fontWeight: 500, padding: '10px 0', borderRadius: 10,
                  border: 'none', cursor: 'pointer', width: '100%',
                  background: '#fcebeb', color: '#791f1f',
                }}
              >
                <XCircle size={15} /> Cancel
              </motion.button>
            </div>

          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AppointmentCard;