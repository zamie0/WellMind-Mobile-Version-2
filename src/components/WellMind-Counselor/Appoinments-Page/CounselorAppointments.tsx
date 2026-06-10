import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarCheck2,
  CheckCircle2,
  Clock,
  CalendarDays,
} from 'lucide-react';
import { useCounselorStore } from '@/stores/counselorStore';
import { toast } from 'sonner';
import { AppointmentCard } from './AppointmentCard';
import type { AppointmentStatus, CounsellorAppointment } from '@/stores/counselorChatStore';

interface CounselorAppointmentsProps {
  onOpenChat: (chatId: string) => void;
}

type Tab = 'requested' | 'confirmed' | 'completed';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'requested', label: 'Requested', icon: <Clock         className="h-3.5 w-3.5" /> },
  { id: 'confirmed', label: 'Confirmed', icon: <CalendarDays  className="h-3.5 w-3.5" /> },
  { id: 'completed', label: 'Completed', icon: <CheckCircle2  className="h-3.5 w-3.5" /> },
];

export const CounselorAppointments = ({ onOpenChat }: CounselorAppointmentsProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('requested');
  const { appointments, getClientById, updateAppointmentStatus } = useCounselorStore();

  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime(),
  );

  const statusCounts: Record<Tab, number> = {
    requested: appointments.filter((a) => a.status === 'requested').length,
    confirmed:  appointments.filter((a) => a.status === 'confirmed').length,
    completed:  appointments.filter((a) => a.status === 'completed').length,
  };

  const filteredAppointments = sortedAppointments.filter((a) => a.status === activeTab);

  const handleStatus = (
    appointment: CounsellorAppointment,
    status: 'confirmed' | 'completed' | 'cancelled',
  ) => {
    updateAppointmentStatus(appointment.id, status);
    toast.success(`Appointment ${status}.`);
  };

  const handleOpenSession = (appointment: CounsellorAppointment) => {
    const client = appointment.clientId ? getClientById(appointment.clientId) : undefined;
    if (!client)                  { toast.error('Client not found.');                                    return; }
    if (!client.conversationId)   { toast.error('No chat conversation exists for this client yet.');    return; }
    onOpenChat(client.conversationId);
  };

  return (
    <div
      className="min-h-screen pb-28"
      style={{ background: 'linear-gradient(180deg, #f0f7f5 0%, #f7faf9 60%, #ffffff 100%)' }}
    >
      {/* ── Hero banner ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden px-5 pt-10 pb-8"
      >
        {/* Soft background rings */}
        <div
          className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(57,168,155,0.13) 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute top-10 -left-16 w-56 h-56 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(232,115,90,0.08) 0%, transparent 70%)' }}
        />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          {/* Label row */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#39a89b' }}>
              <CalendarDays className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#39a89b' }}>
              Appointments
            </span>
          </div>

          <h1
            className="text-[2rem] font-bold leading-tight mb-2"
            style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}
          >
            Your Schedule
          </h1>
          <p className="text-[15px] leading-relaxed mb-6" style={{ color: '#5f7585' }}>
            Review requests, confirm sessions, and open live support rooms.
          </p>

          {/* Stats row */}
          <div className="flex gap-3">
            {[
              { value: statusCounts.requested, label: 'Requested', accent: '#e8b35a' },
              { value: statusCounts.confirmed,  label: 'Confirmed',  accent: '#39a89b' },
              { value: statusCounts.completed,  label: 'Completed',  accent: '#6bab9e' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.07 }}
                className="flex-1 rounded-2xl px-3 py-4 text-center"
                style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
              >
                <p className="text-2xl font-bold leading-none mb-1" style={{ color: item.accent }}>
                  {item.value}
                </p>
                <p className="text-[11px] font-medium" style={{ color: '#8fa3b1' }}>{item.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* ── Sticky tab bar ── */}
      <div
        className="sticky top-0 z-20 px-5"
        style={{
          background: 'rgba(240,247,245,0.96)',
          backdropFilter: 'blur(14px)',
          borderBottom: '0.5px solid rgba(57,168,155,0.15)',
        }}
      >
        <div className="flex gap-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors"
                style={{ color: isActive ? '#39a89b' : '#8fa3b1' }}
              >
                {tab.icon}
                {tab.label}
                {statusCounts[tab.id] > 0 && (
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                    style={{
                      background: isActive ? '#39a89b' : 'rgba(143,163,177,0.2)',
                      color: isActive ? 'white' : '#8fa3b1',
                    }}
                  >
                    {statusCounts[tab.id]}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg, #39a89b, #6bab9e)' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab content ── */}
      <main className="px-5 py-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {filteredAppointments.length ? (
              <div className="space-y-3">
                {filteredAppointments.map((appointment, i) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    client={appointment.clientId ? getClientById(appointment.clientId) : undefined}
                    index={i}
                    onConfirm={() => handleStatus(appointment, 'confirmed')}
                    onComplete={() => handleStatus(appointment, 'completed')}
                    onCancel={() => handleStatus(appointment, 'cancelled')}
                    onOpenSession={() => handleOpenSession(appointment)}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="rounded-3xl overflow-hidden"
                style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
              >
                <div
                  className="h-1 w-full"
                  style={{ background: 'linear-gradient(90deg, #8fa3b1, #b0c4ce)' }}
                />
                <div className="flex flex-col items-center py-14 px-6 text-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(143,163,177,0.12)' }}
                  >
                    <CalendarCheck2 className="h-6 w-6" style={{ color: '#8fa3b1' }} />
                  </div>
                  <p className="font-bold text-sm mb-1" style={{ color: '#1a2b38' }}>
                    No {activeTab} appointments
                  </p>
                  <p className="text-xs" style={{ color: '#8fa3b1' }}>
                    {activeTab === 'requested' && 'Client-requested sessions will appear here.'}
                    {activeTab === 'confirmed'  && 'Confirmed upcoming sessions will appear here.'}
                    {activeTab === 'completed'  && 'Past completed sessions will appear here.'}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="h-4" />
      </main>
    </div>
  );
};

export default CounselorAppointments;