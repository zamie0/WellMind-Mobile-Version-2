import { motion } from 'framer-motion';
import {
  BarChart3,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  TrendingUp,
  Users,
  ClipboardList,
} from 'lucide-react';
import { useCounselorStore } from '@/stores/counselorStore';

export const CounselorReports = () => {
  const { getAllClients, getActiveSessions, getSessionHistory, appointments } = useCounselorStore();
  const clients               = getAllClients();
  const activeSessions        = getActiveSessions();
  const completedSessions     = getSessionHistory();
  const completedAppointments = appointments.filter((a) => a.status === 'completed').length;
  const requestedAppointments = appointments.filter((a) => a.status === 'requested').length;
  const confirmedAppointments = appointments.filter((a) => a.status === 'confirmed').length;
  const cancelledAppointments = appointments.filter((a) => a.status === 'cancelled').length;
  const clientsWithNotes      = clients.filter((c) => !!c.notes?.trim()).length;
  const totalSessions         = activeSessions.length + completedSessions.length;

  const completionRate = appointments.length
    ? Math.round(
        ((completedSessions.length + completedAppointments) /
          (appointments.length + completedSessions.length)) *
          100
      )
    : 0;

  const metrics = [
    { label: 'Clients',          value: clients.length,                                      icon: Users,         accent: '#39a89b' },
    { label: 'Active Sessions',  value: activeSessions.length,                               icon: MessageSquare, accent: '#8fa3b1' },
    { label: 'Completed',        value: completedSessions.length + completedAppointments,    icon: CheckCircle2,  accent: '#6bab9e' },
    { label: 'Requests',         value: requestedAppointments,                               icon: Clock,         accent: '#e8b35a' },
  ];

  const pipeline = [
    { label: 'Requested', value: requestedAppointments, accent: '#e8b35a' },
    { label: 'Confirmed',  value: confirmedAppointments, accent: '#39a89b' },
    { label: 'Completed',  value: completedAppointments, accent: '#6bab9e' },
    { label: 'Cancelled',  value: cancelledAppointments, accent: '#e8735a' },
  ];

  const workload = [
    { icon: MessageSquare,  text: `${totalSessions} total live or completed sessions.` },
    { icon: CalendarCheck2, text: `${appointments.length} appointments tracked from the database.` },
    { icon: FileText,       text: `${clientsWithNotes} clients have saved notes.` },
  ];

  return (
    <motion.div
      key="reports"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-5 px-4 pt-6"
    >
      {/* ── Hero header ─────────────────────────────────────── */}
      <div className="relative overflow-hidden px-1 pt-2 pb-1">
        <div
          className="pointer-events-none absolute -top-12 -right-12 w-52 h-52 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(57,168,155,0.11) 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute top-4 -left-10 w-40 h-40 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(232,115,90,0.07) 0%, transparent 70%)' }}
        />

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: '#39a89b' }}>
              <ClipboardList className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#39a89b' }}>
              Reports
            </span>
          </div>
          <h1
            className="text-[1.75rem] font-bold leading-tight mb-1"
            style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}
          >
            Practice Reports
          </h1>
          <p className="text-[14px] leading-relaxed" style={{ color: '#5f7585' }}>
            Quick operational summary for counselor activity.
          </p>
        </motion.div>
      </div>

      {/* ── Practice Health card ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
        className="rounded-3xl overflow-hidden"
        style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
      >
        <div
          className="h-1 w-full"
          style={{ background: 'linear-gradient(90deg, #39a89b, #6bab9e)' }}
        />
        <div className="px-4 pt-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(57,168,155,0.12)' }}
              >
                <TrendingUp className="h-4 w-4" style={{ color: '#39a89b' }} />
              </div>
              <p className="font-bold text-sm" style={{ color: '#1a2b38' }}>Practice Health</p>
            </div>
            <span
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(57,168,155,0.13)', color: '#2a8f84' }}
            >
              Stable
            </span>
          </div>

          {/* Progress bar */}
          <div
            className="h-2.5 rounded-full overflow-hidden mb-2"
            style={{ background: 'rgba(57,168,155,0.12)' }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(completionRate, 100)}%` }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #39a89b, #6bab9e)' }}
            />
          </div>
          <p className="text-xs" style={{ color: '#5f7585' }}>
            <span className="font-bold" style={{ color: '#39a89b' }}>{completionRate}%</span>
            {' '}completion rate across tracked sessions.
          </p>
        </div>
      </motion.div>

      {/* ── Metrics grid ────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {metrics.map(({ label, value, icon: Icon, accent }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 + i * 0.07 }}
            className="rounded-3xl overflow-hidden"
            style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
          >
            <div
              className="h-1 w-full"
              style={{ background: `linear-gradient(90deg, ${accent}, ${accent}99)` }}
            />
            <div className="px-4 py-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${accent}18` }}
              >
                <Icon className="h-4 w-4" style={{ color: accent }} />
              </div>
              <p className="text-xl font-bold leading-none mb-1" style={{ color: accent }}>{value}</p>
              <p className="text-xs font-semibold" style={{ color: '#1a2b38' }}>{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Appointment Pipeline ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-3xl overflow-hidden"
        style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
      >
        <div
          className="h-1 w-full"
          style={{ background: 'linear-gradient(90deg, #e8b35a, #f0c97a)' }}
        />
        <div className="px-4 pt-4 pb-4">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(232,179,90,0.12)' }}
            >
              <BarChart3 className="h-4 w-4" style={{ color: '#e8b35a' }} />
            </div>
            <p className="font-bold text-sm" style={{ color: '#1a2b38' }}>Appointment Pipeline</p>
          </div>

          <div className="space-y-3">
            {pipeline.map(({ label, value, accent }, i) => {
              const percent = appointments.length
                ? Math.round((value / appointments.length) * 100)
                : 0;
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold" style={{ color: '#1a2b38' }}>{label}</span>
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${accent}15`, color: accent }}
                    >
                      {value}
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: `${accent}15` }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ delay: 0.55 + i * 0.08, duration: 0.7, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${accent}, ${accent}cc)` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ── Workload Snapshot ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.62 }}
        className="rounded-3xl overflow-hidden"
        style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
      >
        <div
          className="h-1 w-full"
          style={{ background: 'linear-gradient(90deg, #8fa3b1, #b0c4ce)' }}
        />
        <div className="px-4 pt-4 pb-4">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(143,163,177,0.12)' }}
            >
              <CalendarCheck2 className="h-4 w-4" style={{ color: '#8fa3b1' }} />
            </div>
            <p className="font-bold text-sm" style={{ color: '#1a2b38' }}>Workload Snapshot</p>
          </div>

          <div className="space-y-2">
            {workload.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.68 + i * 0.07 }}
                className="flex items-center gap-3 rounded-2xl px-3 py-3"
                style={{ background: 'rgba(240,247,245,0.7)' }}
              >
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(57,168,155,0.12)' }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: '#39a89b' }} />
                </div>
                <span className="text-xs leading-relaxed" style={{ color: '#5f7585' }}>{text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CounselorReports;
