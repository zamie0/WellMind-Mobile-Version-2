import { motion } from 'framer-motion';
import {
  Activity,
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  Inbox,
  MessageSquare,
  Sparkles,
  Users,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCounselorStore } from '@/stores/counselorStore';

interface CounselorHomeProps {
  onOpenChat: (chatId: string) => void;
  onViewChange: (view: 'inbox' | 'appointments' | 'clients' | 'notes' | 'reports' | 'profile') => void;
}

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const SectionHeading = ({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) => (
  <div className="flex items-center gap-2 mb-3 px-0.5">
    {icon}
    <h2 className="text-base font-bold" style={{ color: '#1a2b38' }}>{children}</h2>
  </div>
);

export const CounselorHome = ({ onOpenChat, onViewChange }: CounselorHomeProps) => {
  const currentUser = useAuthStore((state) => state.getCurrentUser());
  const { getAllClients, getUpcomingAppointments } = useCounselorStore();

  const clients = getAllClients();
  const appointments = getUpcomingAppointments();
  const requestedCount = appointments.filter((a) => a.status === 'requested').length;
  const unreadChats = clients.reduce((sum, client) => sum + (client.unreadCount || 0), 0);
  const notedClients = clients.filter((client) => !!client.notes?.trim()).length;
  const recentClients = clients.slice(0, 5);

  const today = new Date().toLocaleDateString('en-MY', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  const stats = [
    { label: 'Chats', value: clients.length, icon: MessageSquare, bg: '#eaf3f7', color: '#4a90a4', view: 'inbox' as const },
    { label: 'Unread', value: unreadChats, icon: Inbox, bg: '#fff6ec', color: '#e8935a', view: 'inbox' as const },
    { label: 'Requests', value: requestedCount, icon: Clock, bg: '#f0eefa', color: '#7c6cbf', view: 'appointments' as const },
  ];

  const quickActions = [
    { icon: Inbox, label: 'Open Inbox', description: `${clients.length} active client conversation${clients.length === 1 ? '' : 's'}`, bg: '#eaf3f7', color: '#4a90a4', view: 'inbox' as const },
    { icon: Calendar, label: 'Appointments', description: `${requestedCount} request${requestedCount === 1 ? '' : 's'} need attention`, bg: '#eaf6f0', color: '#4aad7a', view: 'appointments' as const },
    { icon: FileText, label: 'Clinical Notes', description: `${notedClients} clients have saved notes`, bg: '#fffaec', color: '#c9943a', view: 'notes' as const },
    { icon: Activity, label: 'Reports', description: 'Review workload and progress', bg: '#f2eefa', color: '#7c6cbf', view: 'reports' as const },
  ];

  return (
    <motion.div key="home" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
      <div className="relative overflow-hidden px-5 pt-10 pb-7">
        <div className="pointer-events-none absolute -top-12 -right-12 w-56 h-56 rounded-full" style={{ background: 'radial-gradient(circle,rgba(74,144,164,0.13) 0%,transparent 70%)' }} />
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <span className="text-xs font-semibold uppercase tracking-widest block mb-1" style={{ color: '#4a90a4' }}>
            {getGreeting()}
          </span>
          <h1 className="text-[1.9rem] font-bold leading-tight" style={{ color: '#1a2b38' }}>
            {currentUser?.counselorName || currentUser?.name || 'Counselor'}
          </h1>
          <div className="flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full w-fit" style={{ background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', fontSize: 13, color: '#1a2b38', fontWeight: 500 }}>
            <Calendar className="h-3.5 w-3.5" style={{ color: '#4a90a4' }} />
            {today}
          </div>
        </motion.div>
      </div>

      <main className="px-5 space-y-6 pb-6">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <button
              key={stat.label}
              type="button"
              onClick={() => onViewChange(stat.view)}
              className="rounded-2xl text-center transition-all active:scale-95"
              style={{ background: 'white', padding: '16px 12px 14px', boxShadow: '0 3px 14px rgba(0,0,0,0.065)' }}
            >
              <div className="w-9 h-9 rounded-xl mx-auto mb-2.5 flex items-center justify-center" style={{ background: stat.bg }}>
                <stat.icon style={{ color: stat.color, width: 18, height: 18 }} />
              </div>
              <p className="text-[22px] font-bold leading-none" style={{ color: '#1a2b38' }}>{stat.value}</p>
              <p className="text-[11px] mt-1" style={{ color: '#8fa3b1', fontWeight: 500 }}>{stat.label}</p>
            </button>
          ))}
        </div>

        <section>
          <SectionHeading icon={<MessageSquare className="h-4 w-4" style={{ color: '#4a90a4' }} />}>
            Live Inbox
          </SectionHeading>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: '0 3px 14px rgba(0,0,0,0.065)' }}>
            <div className="h-[3px]" style={{ background: 'linear-gradient(90deg,#4a90a4,#7bbccc)' }} />
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-bold" style={{ color: '#1a2b38' }}>Client Conversations</p>
                  <p className="text-xs mt-0.5" style={{ color: '#8fa3b1' }}>
                    {unreadChats ? `${unreadChats} unread message${unreadChats === 1 ? '' : 's'}` : 'All caught up'}
                  </p>
                </div>
                <button type="button" onClick={() => onViewChange('inbox')} className="text-xs font-semibold rounded-full px-3.5 py-1.5 border-0" style={{ background: '#eaf3f7', color: '#4a90a4' }}>
                  Inbox
                </button>
              </div>

              {recentClients.length ? (
                <div className="space-y-2">
                  {recentClients.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => client.conversationId ? onOpenChat(client.conversationId) : onViewChange('inbox')}
                      className="flex w-full items-center gap-3 rounded-2xl text-left transition-all active:scale-[0.98]"
                      style={{ background: '#f5f8fa', padding: '12px 14px' }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#eaf3f7,#c8e0ea)' }}>
                        <MessageSquare style={{ color: '#4a90a4', width: 16, height: 16 }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: '#1a2b38' }}>{client.displayName}</p>
                        <p className="text-[11px] mt-0.5 truncate" style={{ color: '#8fa3b1' }}>
                          {client.lastMessage || 'Open conversation'}
                        </p>
                      </div>
                      {client.unreadCount ? (
                        <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ background: '#e8735a', color: 'white' }}>{client.unreadCount}</span>
                      ) : null}
                      <ChevronRight style={{ color: '#c4d4de', width: 16, height: 16, flexShrink: 0 }} />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl text-center p-6" style={{ border: '1.5px dashed #dce7ec' }}>
                  <p className="text-xs" style={{ color: '#8fa3b1' }}>No active conversations right now.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section>
          <SectionHeading icon={<Sparkles className="h-4 w-4" style={{ color: '#e8c45a' }} />}>
            Today's Workflow
          </SectionHeading>
          <div className="space-y-2.5">
            {quickActions.map((action, i) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * i + 0.2 }}
                type="button"
                onClick={() => onViewChange(action.view)}
                className="flex w-full items-center gap-4 text-left transition-all active:scale-[0.98]"
                style={{ background: 'white', borderRadius: 20, padding: '14px 16px', boxShadow: '0 3px 14px rgba(0,0,0,0.065)' }}
              >
                <div className="flex items-center justify-center flex-shrink-0" style={{ width: 46, height: 46, borderRadius: 14, background: action.bg }}>
                  <action.icon style={{ color: action.color, width: 20, height: 20 }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: '#1a2b38' }}>{action.label}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: '#8fa3b1' }}>{action.description}</p>
                </div>
                <ChevronRight style={{ color: '#c4d4de', width: 16, height: 16, flexShrink: 0 }} />
              </motion.button>
            ))}
          </div>
        </section>
      </main>
    </motion.div>
  );
};

export default CounselorHome;
