import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Clock, MessageSquare, Users } from 'lucide-react';
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

  return (
    <motion.div
      key="home"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-5"
    >
      <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h2 className="mt-1 text-2xl font-bold">{currentUser?.counselorName || 'Counselor'}</h2>
        {currentUser?.specialization?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {currentUser.specialization.map((specialty) => (
              <span key={specialty} className="rounded-full bg-coral/10 px-3 py-1 text-xs font-medium text-coral">
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
            className="rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/40"
          >
            <item.icon className={`mb-3 h-5 w-5 ${item.color}`} />
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </button>
        ))}
      </section>

      <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Active Sessions</h3>
            <p className="text-sm text-muted-foreground">Continue live chat or video support.</p>
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
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-background p-3 text-left transition-colors hover:border-blue-500"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{session.clientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.type === 'video' ? 'Video' : 'Chat'} session started{' '}
                    {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-5 text-center">
            <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-green-500" />
            <p className="text-sm text-muted-foreground">No active sessions right now.</p>
          </div>
        )}
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Button variant="soft" className="h-14 justify-start" onClick={() => onViewChange('appointments')}>
          <Calendar className="h-4 w-4" />
          Appointments
        </Button>
        <Button variant="soft" className="h-14 justify-start" onClick={() => onViewChange('reports')}>
          <CheckCircle2 className="h-4 w-4" />
          Reports
        </Button>
      </section>
    </motion.div>
  );
};

export default CounselorHome;
