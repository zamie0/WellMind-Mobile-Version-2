import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Save, Search, Shield, UserRound, NotebookPen } from 'lucide-react';
import { useCounselorStore } from '@/stores/counselorStore';
import { toast } from 'sonner';

export const CounselorNotes = () => {
  const { getAllClients, updateClient } = useCounselorStore();
  const clients = getAllClients();
  const [query, setQuery] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(clients.map((c) => [c.id, c.notes || '']))
  );

  const filteredClients = clients.filter((c) =>
    `${c.displayName} ${c.notes || ''}`.toLowerCase().includes(query.toLowerCase())
  );
  const savedNotes = clients.filter((c) => !!c.notes?.trim()).length;

  const metrics = [
    { label: 'Clients', value: clients.length,  icon: UserRound, accent: '#39a89b' },
    { label: 'Saved',   value: savedNotes,       icon: FileText,  accent: '#e8b35a' },
    { label: 'Private', value: 'Local',          icon: Shield,    accent: '#6bab9e' },
  ];

  return (
    <motion.div
      key="notes"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-5"
    >
      {/* ── Hero header ─────────────────────────────────────── */}
      <div className="relative overflow-hidden px-1 pt-2 pb-1">
        <div
          className="pointer-events-none absolute -top-12 -right-12 w-52 h-52 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(57,168,155,0.11) 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute top-4 -left-10 w-40 h-40 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(232,179,90,0.08) 0%, transparent 70%)' }}
        />

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: '#39a89b' }}
            >
              <NotebookPen className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#39a89b' }}>
              Notes
            </span>
          </div>
          <h1
            className="text-[1.75rem] font-bold leading-tight mb-1"
            style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}
          >
            Client Notes
          </h1>
          <p className="text-[14px] leading-relaxed" style={{ color: '#5f7585' }}>
            Keep lightweight private notes for each client.
          </p>
        </motion.div>
      </div>

      {/* ── Metrics row ─────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {metrics.map(({ label, value, icon: Icon, accent }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.07 }}
            className="rounded-3xl overflow-hidden"
            style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
          >
            <div
              className="h-1 w-full"
              style={{ background: `linear-gradient(90deg, ${accent}, ${accent}99)` }}
            />
            <div className="px-3 py-3 text-center">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{ background: `${accent}18` }}
              >
                <Icon className="h-4 w-4" style={{ color: accent }} />
              </div>
              <p className="text-xl font-bold leading-none mb-0.5" style={{ color: accent }}>
                {value}
              </p>
              <p className="text-[11px] font-medium" style={{ color: '#8fa3b1' }}>{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Search bar ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
        className="relative"
      >
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
          style={{ color: '#8fa3b1' }}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes or client name…"
          className="w-full rounded-2xl pl-11 pr-4 py-3 text-sm outline-none"
          style={{
            background: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
            color: '#1a2b38',
          }}
        />
      </motion.div>

      {/* ── Note cards ──────────────────────────────────────── */}
      {filteredClients.length ? (
        <div className="space-y-3">
          {filteredClients.map((client, i) => {
            const wordCount = drafts[client.id]?.trim().split(/\s+/).filter(Boolean).length ?? 0;
            const hasContent = wordCount > 0;

            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38 + i * 0.06 }}
                className="rounded-3xl overflow-hidden"
                style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
              >
                {/* Accent bar — amber when has content, slate when empty */}
                <div
                  className="h-1 w-full"
                  style={{
                    background: hasContent
                      ? 'linear-gradient(90deg, #e8b35a, #f0c97a)'
                      : 'linear-gradient(90deg, #8fa3b1, #b0c4ce)',
                  }}
                />

                <div className="px-4 pt-4 pb-3">
                  {/* Header row */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: hasContent
                            ? 'rgba(232,179,90,0.12)'
                            : 'rgba(143,163,177,0.12)',
                        }}
                      >
                        <FileText
                          className="h-4.5 w-4.5"
                          style={{ color: hasContent ? '#e8b35a' : '#8fa3b1' }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate" style={{ color: '#1a2b38' }}>
                          {client.displayName}
                        </p>
                        <p className="text-xs" style={{ color: '#8fa3b1' }}>
                          {client.recentMood
                            ? `Recent mood: ${client.recentMood}`
                            : 'No mood data yet'}
                        </p>
                      </div>
                    </div>

                    <span
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{
                        background: hasContent
                          ? 'rgba(232,179,90,0.13)'
                          : 'rgba(143,163,177,0.12)',
                        color: hasContent ? '#c97d1a' : '#8fa3b1',
                      }}
                    >
                      {hasContent ? `${wordCount} words` : 'Empty'}
                    </span>
                  </div>

                  {/* Textarea */}
                  <textarea
                    value={drafts[client.id] ?? ''}
                    onChange={(e) =>
                      setDrafts((prev) => ({ ...prev, [client.id]: e.target.value }))
                    }
                    rows={4}
                    placeholder="Session summary, risk notes, homework, follow-up…"
                    className="w-full resize-none rounded-2xl px-3 py-2.5 text-sm outline-none leading-relaxed"
                    style={{
                      background: 'rgba(240,247,245,0.7)',
                      color: '#1a2b38',
                      border: 'none',
                    }}
                  />

                  {/* Footer row */}
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-xs" style={{ color: '#8fa3b1' }}>
                      Last contact{' '}
                      {new Date(client.lastInteraction).toLocaleDateString('en-MY', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>

                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        updateClient(client.id, { notes: drafts[client.id] ?? '' });
                        toast.success('Notes saved.');
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, #39a89b, #6bab9e)',
                        color: 'white',
                        boxShadow: '0 2px 8px rgba(57,168,155,0.3)',
                      }}
                    >
                      <Save className="h-3.5 w-3.5" />
                      Save
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* ── Empty state ────────────────────────────────────── */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl overflow-hidden"
          style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
        >
          <div
            className="h-1 w-full"
            style={{ background: 'linear-gradient(90deg, #8fa3b1, #b0c4ce)' }}
          />
          <div className="flex flex-col items-center py-12 px-6 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(143,163,177,0.12)' }}
            >
              <FileText className="h-6 w-6" style={{ color: '#8fa3b1' }} />
            </div>
            <p className="font-bold text-sm mb-1" style={{ color: '#1a2b38' }}>
              No notes found
            </p>
            <p className="text-xs" style={{ color: '#8fa3b1' }}>
              {query ? 'Try a different name or keyword.' : 'Notes will appear here once clients are added.'}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CounselorNotes;