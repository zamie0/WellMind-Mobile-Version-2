import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Save, Search, Shield, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCounselorStore } from '@/stores/counselorStore';
import { toast } from 'sonner';

export const CounselorNotes = () => {
  const { getAllClients, updateClient } = useCounselorStore();
  const clients = getAllClients();
  const [query, setQuery] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(clients.map((client) => [client.id, client.notes || '']))
  );
  const filteredClients = clients.filter((client) =>
    `${client.displayName} ${client.notes || ''}`.toLowerCase().includes(query.toLowerCase())
  );
  const savedNotes = clients.filter((client) => !!client.notes?.trim()).length;

  return (
    <motion.div
      key="notes"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-6"
    >
      <section className="rounded-2xl bg-card p-5 shadow-soft">
        <h2 className="text-2xl font-bold">Notes</h2>
        <p className="mt-1 text-sm text-muted-foreground">Keep lightweight private notes for each client.</p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: 'Clients', value: clients.length, icon: UserRound, color: 'text-primary' },
            { label: 'Saved', value: savedNotes, icon: FileText, color: 'text-honey' },
            { label: 'Private', value: 'Local', icon: Shield, color: 'text-sage' },
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
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notes" className="pl-10" />
      </div>

      {filteredClients.length ? (
        <section className="space-y-3">
          {filteredClients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl bg-card p-4 shadow-soft"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-honey-light text-honey">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{client.displayName}</h3>
                  <p className="text-xs text-muted-foreground">
                    {client.recentMood ? `Recent mood: ${client.recentMood}` : 'No mood data yet'}
                  </p>
                  </div>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                  {drafts[client.id]?.trim() ? `${drafts[client.id].trim().split(/\s+/).length} words` : 'Empty'}
                </span>
              </div>

              <Textarea
                value={drafts[client.id] ?? ''}
                onChange={(event) => setDrafts((current) => ({ ...current, [client.id]: event.target.value }))}
                rows={4}
                placeholder="Session summary, risk notes, homework, follow-up..."
                className="resize-none"
              />

              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Last contact {new Date(client.lastInteraction).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    updateClient(client.id, { notes: drafts[client.id] ?? '' });
                    toast.success('Notes saved.');
                  }}
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </motion.div>
          ))}
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-border p-8 text-center">
          <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No notes match your search.</p>
        </section>
      )}
    </motion.div>
  );
};

export default CounselorNotes;
