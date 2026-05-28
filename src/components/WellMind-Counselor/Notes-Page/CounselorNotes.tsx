import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCounselorStore } from '@/stores/counselorStore';
import { toast } from 'sonner';

export const CounselorNotes = () => {
  const { getAllClients, updateClient } = useCounselorStore();
  const clients = getAllClients();
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(clients.map((client) => [client.id, client.notes || '']))
  );

  return (
    <motion.div
      key="notes"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-4"
    >
      <section>
        <h2 className="text-2xl font-bold">Notes</h2>
        <p className="text-sm text-muted-foreground">Keep lightweight private notes for each client.</p>
      </section>

      {clients.length ? (
        <section className="space-y-3">
          {clients.map((client) => (
            <div key={client.id} className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{client.displayName}</h3>
                  <p className="text-xs text-muted-foreground">
                    {client.recentMood ? `Recent mood: ${client.recentMood}` : 'No mood data yet'}
                  </p>
                </div>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>

              <Textarea
                value={drafts[client.id] ?? ''}
                onChange={(event) => setDrafts((current) => ({ ...current, [client.id]: event.target.value }))}
                rows={4}
                placeholder="Session summary, risk notes, homework, follow-up..."
                className="resize-none"
              />

              <Button
                size="sm"
                className="mt-3"
                onClick={() => {
                  updateClient(client.id, { notes: drafts[client.id] ?? '' });
                  toast.success('Notes saved.');
                }}
              >
                <Save className="h-4 w-4" />
                Save Notes
              </Button>
            </div>
          ))}
        </section>
      ) : (
        <section className="rounded-xl border border-dashed border-border p-8 text-center">
          <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No clients yet.</p>
        </section>
      )}
    </motion.div>
  );
};

export default CounselorNotes;
