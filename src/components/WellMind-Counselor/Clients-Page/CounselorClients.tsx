import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, FileText, MessageSquare, Search, Trash2, UserRound, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCounselorStore } from '@/stores/counselorStore';
import { toast } from 'sonner';

interface CounselorClientsProps {
  onOpenChat: (chatId: string) => void;
}

export const CounselorClients = ({ onOpenChat }: CounselorClientsProps) => {
  const [query, setQuery] = useState('');
  const { getAllClients, removeClient, startSession, getActiveSessions } = useCounselorStore();
  const allClients = getAllClients();
  const clients = allClients.filter((client) =>
    `${client.displayName} ${client.recentMood || ''}`.toLowerCase().includes(query.toLowerCase())
  );
  const anonymousCount = allClients.filter((client) => client.isAnonymous).length;
  const notedCount = allClients.filter((client) => !!client.notes?.trim()).length;

  const openSession = (clientId: string, clientName: string, type: 'chat' | 'video') => {
    const existing = getActiveSessions().find((session) => session.clientId === clientId && session.type === type);
    const sessionId = existing?.id || startSession(clientId, clientName, type);
    onOpenChat(sessionId);
  };

  return (
    <motion.div
      key="clients"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-6"
    >
      <section className="rounded-2xl bg-card p-5 shadow-soft">
        <h2 className="text-2xl font-bold">Clients</h2>
        <p className="mt-1 text-sm text-muted-foreground">Manage client records and start support sessions.</p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: allClients.length, icon: UserRound, color: 'text-primary' },
            { label: 'Anonymous', value: anonymousCount, icon: Search, color: 'text-sky' },
            { label: 'Notes', value: notedCount, icon: FileText, color: 'text-honey' },
          ].map((metric) => (
            <div key={metric.label} className="rounded-2xl bg-background p-3 text-center">
              <metric.icon className={`mx-auto mb-2 h-5 w-5 ${metric.color}`} />
              <p className="text-xl font-bold">{metric.value}</p>
              <p className="text-[11px] text-muted-foreground">{metric.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search clients by name or mood"
          className="pl-10"
        />
      </div>

      <section className="space-y-3">
        {clients.map((client, index) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-2xl bg-card p-4 shadow-soft"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full gradient-hero text-primary-foreground shadow-soft">
                <UserRound className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{client.displayName}</h3>
                  {client.isAnonymous ? (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Anonymous</span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Last contact {new Date(client.lastInteraction).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}
                </p>
                {client.recentMood ? <p className="mt-1 text-sm text-coral">Recent mood: {client.recentMood}</p> : null}

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-muted/40 p-3">
                    <CalendarDays className="mb-1 h-4 w-4 text-sage" />
                    <p className="text-xs text-muted-foreground">Appointments</p>
                    <p className="font-semibold">{client.appointmentCount}</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <FileText className="mb-1 h-4 w-4 text-honey" />
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="font-semibold">{client.notes?.trim() ? 'Saved' : 'Empty'}</p>
                  </div>
                </div>

                {client.notes ? <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{client.notes}</p> : null}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="coral" onClick={() => openSession(client.id, client.displayName, 'chat')}>
                <MessageSquare className="h-4 w-4" />
                Chat
              </Button>
              <Button size="sm" variant="outline" onClick={() => openSession(client.id, client.displayName, 'video')}>
                <Video className="h-4 w-4" />
                Video
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  removeClient(client.id);
                  toast.success('Client removed.');
                }}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </div>
          </motion.div>
        ))}
      </section>

      {!clients.length ? (
        <section className="rounded-2xl border border-dashed border-border p-8 text-center">
          <UserRound className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No clients match your search.</p>
        </section>
      ) : null}
    </motion.div>
  );
};

export default CounselorClients;
