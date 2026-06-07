import { motion } from 'framer-motion';
import {
  CalendarCheck2,
  CheckCircle2,
  Clock,
  MessageSquare,
  Timer,
  Video,
  XCircle,
  CalendarDays,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCounselorStore } from '@/stores/counselorStore';
import type { AppointmentStatus, CounsellorAppointment } from '@/stores/counselorChatStore';
import { toast } from 'sonner';

/* ── Status config ──────────────────────────────────────────────── */
const statusConfig: Record<
  AppointmentStatus,
  { bg: string; color: string; label: string }
> = {
  requested: { bg: 'rgba(232,179,90,0.15)', color: '#c97d1a',  label: 'Requested' },
  confirmed:  { bg: 'rgba(57,168,155,0.13)', color: '#2a8f84',  label: 'Confirmed'  },
  completed:  { bg: 'rgba(107,171,158,0.15)', color: '#3d7a72', label: 'Completed'  },
  cancelled:  { bg: 'rgba(232,115,90,0.13)', color: '#c0502f',  label: 'Cancelled'  },
  missed:     { bg: 'rgba(143,163,177,0.15)', color: '#6b87a0', label: 'Missed'     },
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

interface CounselorAppointmentsProps {
  onOpenChat: (chatId: string) => void;
}

/* ── Component ──────────────────────────────────────────────────── */
export const CounselorAppointments = ({ onOpenChat }: CounselorAppointmentsProps) => {
  const {
    appointments,
    getClientById,
    updateAppointmentStatus,
    getActiveSessions,
    startSession,
  } = useCounselorStore();

  const sortedAppointments = [...appointments].sort(
    (a, b) =>
      new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
  );

  const statusCounts = {
    requested: appointments.filter((a) => a.status === 'requested').length,
    confirmed:  appointments.filter((a) => a.status === 'confirmed').length,
    completed:  appointments.filter((a) => a.status === 'completed').length,
  };

  const handleStatus = (
    appointment: CounsellorAppointment,
    status: 'confirmed' | 'completed' | 'cancelled'
  ) => {
    updateAppointmentStatus(appointment.id, status);
    toast.success(`Appointment ${status}.`);
  };

  const handleOpenSession = (appointment: CounsellorAppointment) => {
    const client = appointment.clientId
      ? getClientById(appointment.clientId)
      : undefined;
    if (!client) { toast.error('Client not found.'); return; }

    const existing = getActiveSessions().find(
      (s) => s.clientId === client.id && s.type === appointment.consultationType
    );
    const sessionId =
      existing?.id ||
      startSession(client.id, client.displayName, appointment.consultationType);
    onOpenChat(sessionId);
  };

  const metrics = [
    {
      label: 'Requested',
      value: statusCounts.requested,
      icon: Clock,
      accent: '#e8b35a',
    },
    {
      label: 'Confirmed',
      value: statusCounts.confirmed,
      icon: CalendarCheck2,
      accent: '#39a89b',
    },
    {
      label: 'Completed',
      value: statusCounts.completed,
      icon: CheckCircle2,
      accent: '#6bab9e',
    },
  ];

  return (
    <motion.div
      key="appointments"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-5"
    >
      {/* ── Hero header ─────────────────────────────────────── */}
      <div className="relative overflow-hidden px-1 pt-2 pb-1">
        {/* Ambient rings */}
        <div
          className="pointer-events-none absolute -top-12 -right-12 w-52 h-52 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(57,168,155,0.11) 0%, transparent 70%)',
          }}
        />
        <div
          className="pointer-events-none absolute top-4 -left-10 w-40 h-40 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(232,115,90,0.07) 0%, transparent 70%)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: '#39a89b' }}
            >
              <CalendarDays className="h-3.5 w-3.5 text-white" />
            </div>
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: '#39a89b' }}
            >
              Appointments
            </span>
          </div>

          <h1
            className="text-[1.75rem] font-bold leading-tight mb-1"
            style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}
          >
            Your Schedule
          </h1>
          <p className="text-[14px] leading-relaxed" style={{ color: '#5f7585' }}>
            Review requests, confirm sessions, and open live support rooms.
          </p>
        </motion.div>
      </div>

      {/* ── Metrics row ─────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {metrics.map(({ label, value, icon: Icon, accent }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.07 }}
            className="rounded-3xl overflow-hidden"
            style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
          >
            <div
              className="h-1 w-full"
              style={{
                background: `linear-gradient(90deg, ${accent}, ${accent}99)`,
              }}
            />
            <div className="px-3 py-3 text-center">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{ background: `${accent}18` }}
              >
                <Icon className="h-4 w-4" style={{ color: accent }} />
              </div>
              <p
                className="text-xl font-bold leading-none mb-0.5"
                style={{ color: accent }}
              >
                {value}
              </p>
              <p className="text-[11px] font-medium" style={{ color: '#8fa3b1' }}>
                {label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Appointment cards ────────────────────────────────── */}
      {sortedAppointments.length ? (
        <div className="space-y-3">
          {sortedAppointments.map((appointment, i) => {
            const client = appointment.clientId
              ? getClientById(appointment.clientId)
              : undefined;
            const canOpen =
              appointment.status === 'confirmed' ||
              appointment.status === 'requested';
            const isPast =
              new Date(appointment.appointmentDate) <
              new Date(new Date().toDateString());

            const cfg = statusConfig[appointment.status];
            const isVideo = appointment.consultationType === 'video';

            return (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 + i * 0.06 }}
                className="rounded-3xl overflow-hidden"
                style={{
                  background: 'white',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
                }}
              >
                {/* Accent bar */}
                <div
                  className="h-1 w-full"
                  style={{
                    background: isVideo
                      ? 'linear-gradient(90deg, #8fa3b1, #b0c4ce)'
                      : 'linear-gradient(90deg, #39a89b, #6bab9e)',
                  }}
                />

                <div className="px-4 pt-4 pb-3">
                  {/* Top row */}
                  <div className="flex items-start gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isVideo
                          ? 'rgba(143,163,177,0.12)'
                          : 'rgba(57,168,155,0.12)',
                      }}
                    >
                      {isVideo ? (
                        <Video
                          className="h-5 w-5"
                          style={{ color: '#8fa3b1' }}
                        />
                      ) : (
                        <MessageSquare
                          className="h-5 w-5"
                          style={{ color: '#39a89b' }}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className="font-bold text-sm"
                          style={{ color: '#1a2b38' }}
                        >
                          {client?.displayName || 'Unknown client'}
                        </span>
                        <span
                          className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                          style={{ background: cfg.bg, color: cfg.color }}
                        >
                          {cfg.label}
                        </span>
                      </div>

                      <p
                        className="flex items-center gap-1.5 text-xs mb-0.5"
                        style={{ color: '#5f7585' }}
                      >
                        <CalendarCheck2 className="h-3.5 w-3.5" />
                        {formatDate(appointment.appointmentDate)} · {appointment.slot}
                      </p>
                      <p
                        className="flex items-center gap-1.5 text-xs"
                        style={{ color: '#8fa3b1' }}
                      >
                        <Timer className="h-3.5 w-3.5" />
                        {isVideo ? 'Video consultation' : 'Chat consultation'}
                        {isPast ? ' · Past date' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  {appointment.notes && (
                    <div
                      className="mt-3 rounded-2xl px-3 py-2.5 text-xs leading-relaxed"
                      style={{
                        background: 'rgba(240,247,245,0.8)',
                        color: '#5f7585',
                      }}
                    >
                      {appointment.notes}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {appointment.status === 'requested' && (
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleStatus(appointment, 'confirmed')}
                        className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full"
                        style={{
                          background:
                            'linear-gradient(135deg, #39a89b, #6bab9e)',
                          color: 'white',
                          boxShadow: '0 2px 8px rgba(57,168,155,0.3)',
                        }}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Confirm
                      </motion.button>
                    )}

                    {canOpen && (
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleOpenSession(appointment)}
                        className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full"
                        style={{
                          background:
                            'linear-gradient(135deg, #e8735a, #e89b7a)',
                          color: 'white',
                          boxShadow: '0 2px 8px rgba(232,115,90,0.3)',
                        }}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Open Session
                      </motion.button>
                    )}

                    {appointment.status !== 'completed' &&
                      appointment.status !== 'cancelled' && (
                        <>
                          <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={() =>
                              handleStatus(appointment, 'completed')
                            }
                            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full"
                            style={{
                              background: 'rgba(107,171,158,0.12)',
                              color: '#3d7a72',
                            }}
                          >
                            <Clock className="h-3.5 w-3.5" />
                            Complete
                          </motion.button>

                          <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={() =>
                              handleStatus(appointment, 'cancelled')
                            }
                            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full"
                            style={{
                              background: 'rgba(232,115,90,0.1)',
                              color: '#c0502f',
                            }}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Cancel
                          </motion.button>
                        </>
                      )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* ── Empty state ──────────────────────────────────────── */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl overflow-hidden"
          style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
        >
          <div
            className="h-1 w-full"
            style={{
              background: 'linear-gradient(90deg, #8fa3b1, #b0c4ce)',
            }}
          />
          <div className="flex flex-col items-center py-12 px-6 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(143,163,177,0.12)' }}
            >
              <CalendarCheck2
                className="h-6 w-6"
                style={{ color: '#8fa3b1' }}
              />
            </div>
            <p
              className="font-bold text-sm mb-1"
              style={{ color: '#1a2b38' }}
            >
              No appointments yet
            </p>
            <p className="text-xs" style={{ color: '#8fa3b1' }}>
              Client-requested sessions will appear here.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CounselorAppointments;