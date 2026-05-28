import { motion } from 'framer-motion';
import { BarChart3, CalendarCheck2, CheckCircle2, Clock, MessageSquare, Users } from 'lucide-react';
import { useCounselorStore } from '@/stores/counselorStore';

export const CounselorReports = () => {
  const { getAllClients, getActiveSessions, getSessionHistory, appointments } = useCounselorStore();
  const clients = getAllClients();
  const activeSessions = getActiveSessions();
  const completedSessions = getSessionHistory();
  const completedAppointments = appointments.filter((appointment) => appointment.status === 'completed').length;
  const requestedAppointments = appointments.filter((appointment) => appointment.status === 'requested').length;
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
      className="space-y-4"
    >
      <section>
        <h2 className="text-2xl font-bold">Reports</h2>
        <p className="text-sm text-muted-foreground">Quick operational summary for counselor activity.</p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border border-border bg-card p-4">
            <metric.icon className={`mb-3 h-5 w-5 ${metric.color}`} />
            <p className="text-2xl font-bold">{metric.value}</p>
            <p className="text-xs text-muted-foreground">{metric.label}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Session Completion</h3>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(completionRate, 100)}%` }} />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{completionRate}% completion rate across tracked sessions.</p>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <CalendarCheck2 className="h-5 w-5 text-coral" />
          <h3 className="font-semibold">Workload Snapshot</h3>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>{totalSessions} total live or completed sessions.</p>
          <p>{appointments.length} appointments tracked locally.</p>
          <p>{clients.filter((client) => !!client.notes?.trim()).length} clients have saved notes.</p>
        </div>
      </section>
    </motion.div>
  );
};

export default CounselorReports;
