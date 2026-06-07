import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  FileText,
  MessageSquare,
  Search,
  Trash2,
  UserRound,
  Video,
  Users,
} from 'lucide-react';
import { useCounselorStore } from '@/stores/counselorStore';
import { toast } from 'sonner';

interface CounselorClientsProps {
  onOpenChat: (chatId: string) => void;
}

export const CounselorClients = ({ onOpenChat }: CounselorClientsProps) => {
  const [query, setQuery] = useState('');
  const { getAllClients, removeClient, startSession, getActiveSessions } = useCounselorStore();

  const allClients = getAllClients();
  const clients = allClients.filter((c) =>
    `${c.displayName} ${c.recentMood || ''}`.toLowerCase().includes(query.toLowerCase())
  );
  const anonymousCount = allClients.filter((c) => c.isAnonymous).length;
  const notedCount     = allClients.filter((c) => !!c.notes?.trim()).length;

  const openSession = (clientId: string, clientName: string, type: 'chat' | 'video') => {
    const existing = getActiveSessions().find(
      (s) => s.clientId === clientId && s.type === type
    );
    const sessionId = existing?.id || startSession(clientId, clientName, type);
    onOpenChat(sessionId);
  };

  const metrics = [
    { label: 'Total',     value: allClients.length, icon: UserRound, accent: '#39a89b' },
    { label: 'Anonymous', value: anonymousCount,     icon: Search,    accent: '#8fa3b1' },
    { label: 'Notes',     value: notedCount,         icon: FileText,  accent: '#e8b35a' },
  ];

  return (
    <motion.div
      key="clients"
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
          style={{ background: 'radial-gradient(circle, rgba(232,115,90,0.07) 0%, transparent 70%)' }}
        />

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: '#39a89b' }}
            >
              <Users className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#39a89b' }}>
              Clients
            </span>
          </div>
          <h1
            className="text-[1.75rem] font-bold leading-tight mb-1"
            style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}
          >
            Your Clients
          </h1>
          <p className="text-[14px] leading-relaxed" style={{ color: '#5f7585' }}>
            Manage client records and start support sessions.
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
          placeholder="Search by name or mood…"
          className="w-full rounded-2xl pl-11 pr-4 py-3 text-sm outline-none"
          style={{
            background: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
            color: '#1a2b38',
          }}
        />
      </motion.div>

      {/* ── Client cards ────────────────────────────────────── */}
      {clients.length ? (
        <div className="space-y-3">
          {clients.map((client, i) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 + i * 0.06 }}
              className="rounded-3xl overflow-hidden"
              style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
            >
              {/* Accent bar */}
              <div
                className="h-1 w-full"
                style={{
                  background: client.isAnonymous
                    ? 'linear-gradient(90deg, #8fa3b1, #b0c4ce)'
                    : 'linear-gradient(90deg, #39a89b, #6bab9e)',
                }}
              />

              <div className="px-4 pt-4 pb-3">
                {/* Avatar + info */}
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: client.isAnonymous
                        ? 'rgba(143,163,177,0.12)'
                        : 'rgba(57,168,155,0.12)',
                    }}
                  >
                    <UserRound
                      className="h-5 w-5"
                      style={{ color: client.isAnonymous ? '#8fa3b1' : '#39a89b' }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-sm" style={{ color: '#1a2b38' }}>
                        {client.displayName}
                      </span>
                      {client.isAnonymous && (
                        <span
                          className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(143,163,177,0.15)', color: '#6b87a0' }}
                        >
                          Anonymous
                        </span>
                      )}
                    </div>

                    <p className="text-xs mb-0.5" style={{ color: '#5f7585' }}>
                      Last contact{' '}
                      {new Date(client.lastInteraction).toLocaleDateString('en-MY', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>

                    {client.recentMood && (
                      <p className="text-xs font-medium" style={{ color: '#e8735a' }}>
                        Recent mood: {client.recentMood}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats mini-row */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div
                    className="rounded-2xl px-3 py-2.5"
                    style={{ background: 'rgba(57,168,155,0.07)' }}
                  >
                    <CalendarDays className="mb-1 h-3.5 w-3.5" style={{ color: '#39a89b' }} />
                    <p className="text-[11px] mb-0.5" style={{ color: '#8fa3b1' }}>Appointments</p>
                    <p className="text-sm font-bold" style={{ color: '#1a2b38' }}>
                      {client.appointmentCount}
                    </p>
                  </div>
                  <div
                    className="rounded-2xl px-3 py-2.5"
                    style={{ background: 'rgba(232,179,90,0.08)' }}
                  >
                    <FileText className="mb-1 h-3.5 w-3.5" style={{ color: '#e8b35a' }} />
                    <p className="text-[11px] mb-0.5" style={{ color: '#8fa3b1' }}>Notes</p>
                    <p className="text-sm font-bold" style={{ color: '#1a2b38' }}>
                      {client.notes?.trim() ? 'Saved' : 'Empty'}
                    </p>
                  </div>
                </div>

                {/* Notes preview */}
                {client.notes && (
                  <div
                    className="mt-3 rounded-2xl px-3 py-2.5 text-xs leading-relaxed line-clamp-3"
                    style={{ background: 'rgba(240,247,245,0.8)', color: '#5f7585' }}
                  >
                    {client.notes}
                  </div>
                )}

                {/* Action buttons */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => openSession(client.id, client.displayName, 'chat')}
                    className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, #e8735a, #e89b7a)',
                      color: 'white',
                      boxShadow: '0 2px 8px rgba(232,115,90,0.3)',
                    }}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Chat
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => openSession(client.id, client.displayName, 'video')}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full"
                    style={{ background: 'rgba(143,163,177,0.12)', color: '#6b87a0' }}
                  >
                    <Video className="h-3.5 w-3.5" />
                    Video
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      removeClient(client.id);
                      toast.success('Client removed.');
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full"
                    style={{ background: 'rgba(232,115,90,0.1)', color: '#c0502f' }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* ── Empty state ──────────────────────────────────────── */
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
              <UserRound className="h-6 w-6" style={{ color: '#8fa3b1' }} />
            </div>
            <p className="font-bold text-sm mb-1" style={{ color: '#1a2b38' }}>
              No clients found
            </p>
            <p className="text-xs" style={{ color: '#8fa3b1' }}>
              {query ? 'Try a different name or mood.' : 'Clients will appear here once assigned.'}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CounselorClients;