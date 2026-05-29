import { motion } from 'framer-motion';
import { BarChart3, CalendarCheck2, CheckCircle2, Clock, FileText, MessageSquare, TrendingUp, Users } from 'lucide-react';
import { useCounselorStore } from '@/stores/counselorStore';

export const CounselorReports = () => {
  const { getAllClients, getActiveSessions, getSessionHistory, appointments } = useCounselorStore();
  const clients = getAllClients();
  const activeSessions = getActiveSessions();
  const completedSessions = getSessionHistory();
  const completedAppointments = appointments.filter((appointment) => appointment.status === 'completed').length;
  const requestedAppointments = appointments.filter((appointment) => appointment.status === 'requested').length;
  const confirmedAppointments = appointments.filter((appointment) => appointment.status === 'confirmed').length;
  const cancelledAppointments = appointments.filter((appointment) => appointment.status === 'cancelled').length;
  const clientsWithNotes = clients.filter((client) => !!client.notes?.trim()).length;
  const totalSessions = activeSessions.length + completedSessions.length;

  const metrics = [
    { label: 'Clients', value: clients.length, icon: Users, color: 'text-purple-500' },
    { label: 'Active Sessions', value: activeSessions.length, icon: MessageSquare, color: 'text-blue-500' },
    { label: 'Completed', value: completedSessions.length + completedAppointments, icon: CheckCircle2, color: 'text-green-500' },
    { label: 'Requests', value: requestedAppointments, icon: Clock, color: 'text-amber-500' },
  ];

  const completionRate = appointments.length
    ? Math.round(((completedSessions.length + completedAppointments) / (appointments.length + completedSessions.length)) * 100)
    : 0;

  return (
    <motion.div
      key="reports"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-6"
    >
      <section className="rounded-2xl bg-card p-5 shadow-soft">
        <h2 className="text-2xl font-bold">Reports</h2>
        <p className="mt-1 text-sm text-muted-foreground">Quick operational summary for counselor activity.</p>
        <div className="mt-4 rounded-2xl bg-background p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <p className="font-semibold">Practice Health</p>
            </div>
            <span className="rounded-full bg-sage-light px-2.5 py-1 text-xs font-medium text-sage">Stable</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(completionRate, 100)}%` }} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{completionRate}% completion rate across tracked sessions.</p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl bg-card p-4 shadow-soft">
            <metric.icon className={`mb-3 h-5 w-5 ${metric.color}`} />
            <p className="text-2xl font-bold">{metric.value}</p>
            <p className="text-xs text-muted-foreground">{metric.label}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl bg-card p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Appointment Pipeline</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Requested', value: requestedAppointments, color: 'bg-amber-500' },
            { label: 'Confirmed', value: confirmedAppointments, color: 'bg-green-500' },
            { label: 'Completed', value: completedAppointments, color: 'bg-blue-500' },
            { label: 'Cancelled', value: cancelledAppointments, color: 'bg-red-500' },
          ].map((item) => {
            const percent = appointments.length ? Math.round((item.value / appointments.length) * 100) : 0;
            return (
              <div key={item.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="text-muted-foreground">{item.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl bg-card p-5 shadow-soft">
        <div className="mb-3 flex items-center gap-2">
          <CalendarCheck2 className="h-5 w-5 text-coral" />
          <h3 className="font-semibold">Workload Snapshot</h3>
        </div>
        <div className="space-y-3">
          {[
            { icon: MessageSquare, text: `${totalSessions} total live or completed sessions.` },
            { icon: CalendarCheck2, text: `${appointments.length} appointments tracked locally.` },
            { icon: FileText, text: `${clientsWithNotes} clients have saved notes.` },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 rounded-xl bg-background p-3 text-sm text-muted-foreground">
              <item.icon className="h-4 w-4 text-primary" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default CounselorReports;
