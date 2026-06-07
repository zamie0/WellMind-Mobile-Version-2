import { motion } from 'framer-motion';
import {
  Activity, Calendar, CheckCircle2, ChevronRight,
  Clock, FileText, MessageSquare, Sparkles, Users, Video,
} from 'lucide-react';
import { useCounselorStore } from '@/stores/counselorStore';

interface CounselorHomeProps {
  onOpenChat: (chatId: string) => void;
  onViewChange: (view: 'appointments' | 'clients' | 'notes' | 'reports' | 'profile') => void;
}

const SectionHeading = ({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) => (
  <div className="flex items-center gap-2 mb-3 px-0.5">
    {icon}
    <h2 className="text-base font-bold" style={{ color: '#1a2b38', letterSpacing: '-0.01em' }}>
      {children}
    </h2>
  </div>
);

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

export const CounselorHome = ({ onOpenChat, onViewChange }: CounselorHomeProps) => {
  const { getActiveSessions, getAllClients, getUpcomingAppointments } = useCounselorStore();

  const activeSessions = getActiveSessions();
  const clients        = getAllClients();
  const appointments   = getUpcomingAppointments();
  const requestedCount = appointments.filter((a) => a.status === 'requested').length;
  const notedClients   = clients.filter((c) => !!c.notes?.trim()).length;

  const today = new Date().toLocaleDateString('en-MY', {
    weekday: 'long', day: 'numeric', month: 'short',
  });

  const stats = [
    {
      label: 'Active',
      value: activeSessions.length,
      icon: MessageSquare,
      bg: '#eaf3f7',
      color: '#4a90a4',
      onClick: () => onViewChange('clients'),
    },
    {
      label: 'Clients',
      value: clients.length,
      icon: Users,
      bg: '#f0eefa',
      color: '#7c6cbf',
      onClick: () => onViewChange('clients'),
    },
    {
      label: 'Requests',
      value: requestedCount,
      icon: Clock,
      bg: '#fff6ec',
      color: '#e8935a',
      onClick: () => onViewChange('appointments'),
    },
  ];

  const quickActions = [
    {
      icon: Calendar,
      label: 'Review Appointments',
      description: `${requestedCount} request${requestedCount === 1 ? '' : 's'} need attention`,
      bg: '#eaf6f0', color: '#4aad7a',
      view: 'appointments' as const,
    },
    {
      icon: Users,
      label: 'Client Directory',
      description: `${clients.length} clients currently tracked`,
      bg: '#eaf3f7', color: '#4a90a4',
      view: 'clients' as const,
    },
    {
      icon: FileText,
      label: 'Clinical Notes',
      description: `${notedClients} clients have saved notes`,
      bg: '#fffaec', color: '#c9943a',
      view: 'notes' as const,
    },
    {
      icon: Activity,
      label: 'Reports',
      description: 'Review workload and progress',
      bg: '#f2eefa', color: '#7c6cbf',
      view: 'reports' as const,
    },
  ];

  return (
    <motion.div
      key="home"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
    >
      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden px-5 pt-10 pb-7">
        {/* Decorative rings */}
        <div
          className="pointer-events-none absolute -top-12 -right-12 w-56 h-56 rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(74,144,164,0.13) 0%,transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute top-8 -left-10 w-44 h-44 rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(232,115,90,0.08) 0%,transparent 70%)' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <span
            className="text-xs font-semibold uppercase tracking-widest block mb-1"
            style={{ color: '#4a90a4' }}
          >
            {getGreeting()}
          </span>
          <h1
            className="text-[1.9rem] font-bold leading-tight"
            style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}
          >
            Dr. {/* counselor name from store if available */}
          </h1>

          <div
            className="flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full w-fit"
            style={{
              background: 'white',
              boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
              fontSize: 13,
              color: '#1a2b38',
              fontWeight: 500,
            }}
          >
            <Calendar className="h-3.5 w-3.5" style={{ color: '#4a90a4' }} />
            {today}
          </div>
        </motion.div>
      </div>

      {/* ── Main ──────────────────────────────────────────────── */}
      <main className="px-5 space-y-6 pb-6">

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {stats.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={s.onClick}
              className="rounded-2xl text-center transition-all active:scale-95"
              style={{
                background: 'white',
                padding: '16px 12px 14px',
                boxShadow: '0 3px 14px rgba(0,0,0,0.065)',
              }}
            >
              <div
                className="w-9 h-9 rounded-xl mx-auto mb-2.5 flex items-center justify-center"
                style={{ background: s.bg }}
              >
                <s.icon style={{ color: s.color, width: 18, height: 18 }} />
              </div>
              <p className="text-[22px] font-bold leading-none" style={{ color: '#1a2b38' }}>
                {s.value}
              </p>
              <p className="text-[11px] mt-1" style={{ color: '#8fa3b1', fontWeight: 500 }}>
                {s.label}
              </p>
            </button>
          ))}
        </motion.div>

        {/* Active Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
        >
          <SectionHeading
            icon={<MessageSquare className="h-4 w-4" style={{ color: '#4a90a4' }} />}
          >
            Active Sessions
          </SectionHeading>

          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'white', boxShadow: '0 3px 14px rgba(0,0,0,0.065)' }}
          >
            <div
              className="h-[3px]"
              style={{ background: 'linear-gradient(90deg,#4a90a4,#7bbccc)' }}
            />
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-bold" style={{ color: '#1a2b38' }}>Live Support</p>
                  <p className="text-xs mt-0.5" style={{ color: '#8fa3b1' }}>
                    Continue chat or video sessions
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onViewChange('clients')}
                  className="text-xs font-semibold rounded-full px-3.5 py-1.5 border-0"
                  style={{ background: '#eaf3f7', color: '#4a90a4' }}
                >
                  Clients
                </button>
              </div>

              {activeSessions.length ? (
                <div className="space-y-2">
                  {activeSessions.map((session) => (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => onOpenChat(session.id)}
                      className="flex w-full items-center gap-3 rounded-2xl text-left transition-all active:scale-[0.98]"
                      style={{ background: '#f5f8fa', padding: '12px 14px' }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background:
                            session.type === 'video'
                              ? 'linear-gradient(135deg,#f5eefa,#ddd5f5)'
                              : 'linear-gradient(135deg,#eaf3f7,#c8e0ea)',
                        }}
                      >
                        {session.type === 'video'
                          ? <Video style={{ color: '#7c6cbf', width: 16, height: 16 }} />
                          : <MessageSquare style={{ color: '#4a90a4', width: 16, height: 16 }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: '#1a2b38' }}>
                          {session.clientName}
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: '#8fa3b1' }}>
                          {session.type === 'video' ? 'Video' : 'Chat'} · started{' '}
                          {new Date(session.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <ChevronRight style={{ color: '#c4d4de', width: 16, height: 16, flexShrink: 0 }} />
                    </button>
                  ))}
                </div>
              ) : (
                <div
                  className="rounded-2xl text-center p-6"
                  style={{ border: '1.5px dashed #dce7ec' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                    style={{ background: '#edf7f0' }}
                  >
                    <CheckCircle2 style={{ color: '#5bba8f', width: 18, height: 18 }} />
                  </div>
                  <p className="text-xs" style={{ color: '#8fa3b1' }}>
                    No active sessions right now.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Today's Workflow */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
        >
          <SectionHeading
            icon={<Sparkles className="h-4 w-4" style={{ color: '#e8c45a' }} />}
          >
            Today's Workflow
          </SectionHeading>

          <div className="space-y-2.5">
            {quickActions.map((action, i) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * i + 0.24 }}
                type="button"
                onClick={() => onViewChange(action.view)}
                className="flex w-full items-center gap-4 text-left transition-all active:scale-[0.98]"
                style={{
                  background: 'white',
                  borderRadius: 20,
                  padding: '14px 16px',
                  boxShadow: '0 3px 14px rgba(0,0,0,0.065)',
                }}
              >
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 46, height: 46,
                    borderRadius: 14,
                    background: action.bg,
                  }}
                >
                  <action.icon style={{ color: action.color, width: 20, height: 20 }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: '#1a2b38' }}>
                    {action.label}
                  </p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: '#8fa3b1' }}>
                    {action.description}
                  </p>
                </div>
                <ChevronRight style={{ color: '#c4d4de', width: 16, height: 16, flexShrink: 0 }} />
              </motion.button>
            ))}
          </div>
        </motion.div>

      </main>
    </motion.div>
  );
};

export default CounselorHome;