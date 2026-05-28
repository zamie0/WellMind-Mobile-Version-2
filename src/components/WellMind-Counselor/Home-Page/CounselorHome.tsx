import { motion } from 'framer-motion';
import {
  Activity,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useCounselorStore } from '@/stores/counselorStore';

interface CounselorHomeProps {
  onOpenChat: (chatId: string) => void;
  onViewChange: (view: 'appointments' | 'clients' | 'notes' | 'reports' | 'profile') => void;
}

export const CounselorHome = ({ onOpenChat, onViewChange }: CounselorHomeProps) => {
  const currentUser = useAuthStore((state) => state.getCurrentUser());
  const { getActiveSessions, getAllClients, getUpcomingAppointments } = useCounselorStore();
  const activeSessions = getActiveSessions();
  const clients = getAllClients();
  const appointments = getUpcomingAppointments();
  const requestedCount = appointments.filter((appointment) => appointment.status === 'requested').length;
  const today = new Date().toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'short' });
  const notedClients = clients.filter((client) => !!client.notes?.trim()).length;

  const quickActions = [
    {
      icon: Calendar,
      label: 'Review Appointments',
      description: `${requestedCount} request${requestedCount === 1 ? '' : 's'} need attention`,
      color: 'bg-sage-light text-sage',
      view: 'appointments' as const,
    },
    {
      icon: Users,
      label: 'Client Directory',
      description: `${clients.length} clients currently tracked`,
      color: 'bg-sky-light text-sky',
      view: 'clients' as const,
    },
    {
      icon: FileText,
      label: 'Clinical Notes',
      description: `${notedClients} clients have saved notes`,
      color: 'bg-honey-light text-honey',
      view: 'notes' as const,
    },
    {
      icon: Activity,
      label: 'Reports',
      description: 'Review workload and progress',
      color: 'bg-lavender-light text-lavender',
      view: 'reports' as const,
    },
  ];

  return (
    <motion.div
      key="home"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-6"
    >
      <section className="gradient-sage -mx-3 -mt-4 rounded-b-[2rem] px-5 pb-7 pt-6 sm:-mx-6 sm:px-7">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full gradient-hero shadow-card">
            <Stethoscope className="h-10 w-10 text-primary-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">{today}</p>
            <h2 className="truncate text-2xl font-bold text-foreground">{currentUser?.counselorName || 'Counselor'}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-sage" />
              {currentUser?.isVerified ? 'Verified counselor' : 'Pending verification'}
            </p>
          </div>
        </motion.div>

        {currentUser?.specialization?.length ? (
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {currentUser.specialization.map((specialty) => (
              <span key={specialty} className="shrink-0 rounded-full bg-card/80 px-3 py-1.5 text-xs font-medium text-coral shadow-soft">
                {specialty}
              </span>
            ))}
          </div>
        ) : null}
      </section>

      <section className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active', value: activeSessions.length, icon: MessageSquare, color: 'text-blue-500' },
          { label: 'Clients', value: clients.length, icon: Users, color: 'text-purple-500' },
          { label: 'Requests', value: requestedCount, icon: Clock, color: 'text-amber-500' },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onViewChange(item.label === 'Clients' ? 'clients' : 'appointments')}
            className="rounded-2xl bg-card p-4 text-center shadow-soft transition-all hover:shadow-card"
          >
            <item.icon className={`mx-auto mb-2 h-5 w-5 ${item.color}`} />
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </button>
        ))}
      </section>

      <section className="rounded-2xl bg-card p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Active Sessions</h3>
            <p className="text-sm text-muted-foreground">Continue live chat or video support</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => onViewChange('clients')}>
            Clients
          </Button>
        </div>

        {activeSessions.length ? (
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => onOpenChat(session.id)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl bg-background p-4 text-left transition-all hover:shadow-card"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-light text-sky">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                  <p className="truncate font-medium">{session.clientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.type === 'video' ? 'Video' : 'Chat'} session started{' '}
                    {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center">
            <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-green-500" />
            <p className="text-sm text-muted-foreground">No active sessions right now.</p>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-honey" />
          <h3 className="font-semibold">Today&apos;s Workflow</h3>
        </div>
        {quickActions.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 * index }}
            type="button"
            onClick={() => onViewChange(action.view)}
            className="flex w-full items-center gap-4 rounded-2xl bg-card p-4 text-left shadow-soft transition-all hover:shadow-card"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.color}`}>
              <action.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">{action.label}</p>
              <p className="truncate text-sm text-muted-foreground">{action.description}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </motion.button>
        ))}
      </section>
    </motion.div>
  );
};

export default CounselorHome;
