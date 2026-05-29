import { motion } from 'framer-motion';
import { CalendarCheck2, CheckCircle2, Clock, MessageSquare, Timer, Video, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCounselorStore } from '@/stores/counselorStore';
import type { AppointmentStatus, CounsellorAppointment } from '@/stores/peerChatStore';
import { toast } from 'sonner';

const statusClass: Record<AppointmentStatus, string> = {
  requested: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  missed: 'bg-muted text-muted-foreground',
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });

interface CounselorAppointmentsProps {
  onOpenChat: (chatId: string) => void;
}

export const CounselorAppointments = ({ onOpenChat }: CounselorAppointmentsProps) => {
  const {
    appointments,
    getClientById,
    updateAppointmentStatus,
    getActiveSessions,
    startSession,
  } = useCounselorStore();

  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
  );
  const statusCounts = {
    requested: appointments.filter((appointment) => appointment.status === 'requested').length,
    confirmed: appointments.filter((appointment) => appointment.status === 'confirmed').length,
    completed: appointments.filter((appointment) => appointment.status === 'completed').length,
  };

  const handleStatus = (appointment: CounsellorAppointment, status: 'confirmed' | 'completed' | 'cancelled') => {
    updateAppointmentStatus(appointment.id, status);
    toast.success(`Appointment ${status}.`);
  };

  const handleOpenSession = (appointment: CounsellorAppointment) => {
    const client = getClientById(appointment.peerId);
    if (!client) {
      toast.error('Client not found.');
      return;
    }

    const existing = getActiveSessions().find(
      (session) => session.clientId === client.id && session.type === appointment.consultationType
    );
    const sessionId = existing?.id || startSession(client.id, client.displayName, appointment.consultationType);
    onOpenChat(sessionId);
  };

  return (
    <motion.div
      key="appointments"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-6"
    >
      <section className="rounded-2xl bg-card p-5 shadow-soft">
        <h2 className="text-2xl font-bold">Appointments</h2>
        <p className="mt-1 text-sm text-muted-foreground">Review requests, confirm sessions, and open live support rooms.</p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: 'Requested', value: statusCounts.requested, icon: Clock, color: 'text-amber-500' },
            { label: 'Confirmed', value: statusCounts.confirmed, icon: CalendarCheck2, color: 'text-green-500' },
            { label: 'Completed', value: statusCounts.completed, icon: CheckCircle2, color: 'text-blue-500' },
          ].map((metric) => (
            <div key={metric.label} className="rounded-2xl bg-background p-3 text-center">
              <metric.icon className={`mx-auto mb-2 h-5 w-5 ${metric.color}`} />
              <p className="text-xl font-bold">{metric.value}</p>
              <p className="text-[11px] text-muted-foreground">{metric.label}</p>
            </div>
          ))}
        </div>
      </section>

      {sortedAppointments.length ? (
        <section className="space-y-3">
          {sortedAppointments.map((appointment) => {
            const client = getClientById(appointment.peerId);
            const canOpen = appointment.status === 'confirmed' || appointment.status === 'requested';
            const appointmentDate = new Date(appointment.appointmentDate);
            const isPast = appointmentDate < new Date(new Date().toDateString());

            return (
              <div key={appointment.id} className="rounded-2xl bg-card p-4 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sage-light text-sage">
                      {appointment.consultationType === 'video' ? <Video className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{client?.displayName || 'Unknown client'}</h3>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass[appointment.status]}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CalendarCheck2 className="h-4 w-4" />
                      {formatDate(appointment.appointmentDate)} at {appointment.slot}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Timer className="h-4 w-4" />
                      {appointment.consultationType === 'video' ? 'Video consultation' : 'Chat consultation'}
                      {isPast ? ' · Past date' : ''}
                    </p>
                    {appointment.notes ? (
                      <div className="mt-3 rounded-xl bg-muted/40 p-3 text-sm text-muted-foreground">{appointment.notes}</div>
                    ) : null}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {appointment.status === 'requested' ? (
                    <Button size="sm" onClick={() => handleStatus(appointment, 'confirmed')}>
                      <CheckCircle2 className="h-4 w-4" />
                      Confirm
                    </Button>
                  ) : null}
                  {canOpen ? (
                    <Button size="sm" variant="coral" onClick={() => handleOpenSession(appointment)}>
                      <MessageSquare className="h-4 w-4" />
                      Open Session
                    </Button>
                  ) : null}
                  {appointment.status !== 'completed' && appointment.status !== 'cancelled' ? (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleStatus(appointment, 'completed')}>
                        <Clock className="h-4 w-4" />
                        Complete
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleStatus(appointment, 'cancelled')}>
                        <XCircle className="h-4 w-4" />
                        Cancel
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </section>
      ) : (
        <section className="rounded-xl border border-dashed border-border p-8 text-center">
          <CalendarCheck2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No appointments yet.</p>
        </section>
      )}
    </motion.div>
  );
};

export default CounselorAppointments;
