import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    ArrowLeft,
    MessageCircle,
    Send,
    User,
    EyeOff,
    Clock,
    CalendarDays,
    Video,
    Mail,
    BellRing,
    Smartphone,
    Star,
    Briefcase,
    CheckCircle2,
    XCircle,
    RefreshCw,
    AlertTriangle,
    ChevronRight,
    CalendarCheck2,
    X,
    Trash2,
} from 'lucide-react';
import { usePeerChatStore, type ConsultationType, type CounsellorAppointment } from '@/stores/peerChatStore';
import { toast } from 'sonner';
import type { PeerUser } from '@/types/wellmind';

interface PeerSupportChatProps {
    onClose: () => void;
}

type View = 'directory' | 'appointments' | 'chat';

// ─── Avatar helper ────────────────────────────────────────────────
const PEER_AVATAR: Record<string, string> = {
    'peer-1': '/khoo.jpeg',
    'peer-2': 'https://api.dicebear.com/9.x/lorelei/svg?seed=AinaYusuf',
    'peer-3': 'https://api.dicebear.com/9.x/lorelei/svg?seed=DanielTan',
    'peer-4': 'https://api.dicebear.com/9.x/lorelei/svg?seed=MeiLin',
    'peer-5': 'https://api.dicebear.com/9.x/lorelei/svg?seed=RaviNair',
};

const PeerAvatar = ({ peer, size = 'md' }: { peer: PeerUser; size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClass = size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-16 h-16' : 'w-12 h-12';
    const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-7 w-7' : 'h-5 w-5';
    const src = PEER_AVATAR[peer.id];
    return (
        <div className={`${sizeClass} rounded-full bg-sage-light flex items-center justify-center overflow-hidden flex-shrink-0`}>
            {src ? (
                <img src={src} alt={peer.displayName} className="w-full h-full object-cover" />
            ) : peer.isAnonymous ? (
                <EyeOff className={`${iconSize} text-sage`} />
            ) : (
                <User className={`${iconSize} text-sage`} />
            )}
        </div>
    );
};

const getStatusColor = (status: PeerUser['status']) => {
    if (status === 'online') return 'bg-green-500';
    if (status === 'away') return 'bg-amber-500';
    return 'bg-red-500';
};

const getStatusPillClass = (status: PeerUser['status']) => {
    if (status === 'online') return 'bg-green-100 text-green-700';
    if (status === 'away') return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
};

const apptStatusMeta = (status: CounsellorAppointment['status']) => {
    switch (status) {
        case 'requested':  return { label: 'Requested',  className: 'bg-amber-100 text-amber-700',  icon: <Clock className="h-3 w-3" /> };
        case 'confirmed':  return { label: 'Confirmed',  className: 'bg-green-100 text-green-700',  icon: <CheckCircle2 className="h-3 w-3" /> };
        case 'completed':  return { label: 'Completed',  className: 'bg-sky-100 text-sky-700',      icon: <CheckCircle2 className="h-3 w-3" /> };
        case 'cancelled':  return { label: 'Cancelled',  className: 'bg-red-100 text-red-600',      icon: <XCircle className="h-3 w-3" /> };
        case 'missed':     return { label: 'Missed',     className: 'bg-gray-100 text-gray-500',    icon: <AlertTriangle className="h-3 w-3" /> };
        default:           return { label: 'Unknown',    className: 'bg-muted text-muted-foreground', icon: null };
    }
};

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });

const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

const DEFAULT_REMINDERS = { push: true, email: false, local: true };

// ─── Booking Modal ────────────────────────────────────────────────
interface BookingModalProps {
    peer: PeerUser;
    onClose: () => void;
    onBooked: () => void;
    prefillAppointment?: CounsellorAppointment;
}

const BookingModal = ({ peer, onClose, onBooked, prefillAppointment }: BookingModalProps) => {
    const { getAvailableSlots, bookSession, rescheduleAppointment } = usePeerChatStore();

    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowIso = tomorrowDate.toISOString().split('T')[0];

    const [date, setDate] = useState(prefillAppointment?.appointmentDate ?? '');
    const [slot, setSlot] = useState('');
    const [consultationType, setConsultationType] = useState<ConsultationType>(
        prefillAppointment?.consultationType ?? 'chat'
    );
    const [notes, setNotes] = useState('');
    const [reminders, setReminders] = useState(prefillAppointment?.reminders ?? DEFAULT_REMINDERS);

    const slots = date ? getAvailableSlots(peer.id, date) : [];

    const handleSubmit = () => {
        if (!date || !slot) { toast.error('Please select a date and time slot.'); return; }
        if (prefillAppointment) {
            rescheduleAppointment(prefillAppointment.id, date, slot, consultationType);
            toast.success('Appointment rescheduled!');
        } else {
            const id = bookSession(peer.id, date, slot, consultationType, reminders, notes);
            if (!id) { toast.error('That slot is no longer available.'); return; }
            toast.success(`Session requested with ${peer.displayName}`);
        }
        onBooked();
        onClose();
    };

    const toggleReminder = (key: keyof typeof reminders) =>
        setReminders((prev) => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <PeerAvatar peer={peer} size="sm" />
                        <div>
                            <p className="font-semibold text-foreground text-sm">{peer.displayName}</p>
                            <p className="text-xs text-muted-foreground">{peer.specialization}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
                    <h3 className="font-semibold text-foreground">
                        {prefillAppointment ? 'Reschedule Appointment' : 'Book a Session'}
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-muted-foreground block mb-1">Preferred Date</label>
                            <Input
                                type="date"
                                min={tomorrowIso}
                                value={date}
                                onChange={(e) => { setDate(e.target.value); setSlot(''); }}
                                className="h-9"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground block mb-1">Consultation Type</label>
                            <select
                                value={consultationType}
                                onChange={(e) => setConsultationType(e.target.value as ConsultationType)}
                                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                            >
                                {(!peer.consultationMethods || peer.consultationMethods.includes('chat')) && (
                                    <option value="chat">💬 Chat</option>
                                )}
                                {(!peer.consultationMethods || peer.consultationMethods.includes('video')) && (
                                    <option value="video">📹 Video</option>
                                )}
                            </select>
                        </div>
                    </div>

                    {date && (
                        <div>
                            <label className="text-xs text-muted-foreground block mb-2">Available Time Slots</label>
                            {slots.length === 0 ? (
                                <p className="text-xs text-muted-foreground">No slots available for this date.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {slots.map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setSlot(s)}
                                            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${slot === s ? 'bg-sage text-white border-sage' : 'bg-background text-foreground border-border hover:border-sage/50'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="text-xs text-muted-foreground block mb-1">Notes / Concerns (optional)</label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Briefly describe what you'd like to discuss..."
                            rows={2}
                            className="resize-none text-sm"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-muted-foreground block mb-2">Appointment Reminders</label>
                        <div className="flex gap-2">
                            {([
                                ['push',  <BellRing className="h-3 w-3" />,   'Push']  as const,
                                ['email', <Mail className="h-3 w-3" />,        'Email'] as const,
                                ['local', <Smartphone className="h-3 w-3" />, 'Local'] as const,
                            ]).map(([key, icon, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => toggleReminder(key)}
                                    className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1 transition-colors ${reminders[key] ? 'bg-sage-light text-sage border-sage/30' : 'bg-background text-muted-foreground border-border'}`}
                                >
                                    {icon} {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="px-5 py-4 border-t border-border flex gap-3">
                    <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!date || !slot}
                        className="flex-1 bg-coral hover:bg-coral/90 text-white"
                    >
                        <CalendarCheck2 className="h-4 w-4 mr-1.5" />
                        {prefillAppointment ? 'Reschedule' : 'Request Session'}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

// ─── Cancel Confirmation Dialog ───────────────────────────────────
const CancelDialog = ({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card w-full max-w-sm rounded-2xl shadow-xl p-6 space-y-4"
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="font-semibold text-foreground">Cancel Appointment?</h3>
            </div>
            <p className="text-sm text-muted-foreground">
                Are you sure you want to cancel this appointment? This action cannot be undone.
            </p>
            <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700 space-y-1">
                <p className="font-medium">Cancellation Policy</p>
                <p>• More than 24 hours before: free cancellation</p>
                <p>• Less than 1 hour before: cancellation may be restricted</p>
            </div>
            <div className="flex flex-col gap-2">
                <Button onClick={onConfirm} className="w-full bg-red-500 hover:bg-red-600 text-white">Yes, Cancel Booking</Button>
                <Button variant="outline" onClick={onClose} className="w-full">No, Keep</Button>
            </div>
        </motion.div>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────
export const PeerSupportChat = ({ onClose }: PeerSupportChatProps) => {
    const {
        availablePeers,
        chats,
        appointments,
        peerProfile,
        loadAvailablePeers,
        startChat,
        sendMessage,
        getChat,
        cancelAppointment,
        requestCounsellorSession,
        sessionStatuses,
        setSessionStatus,
        deleteChat,
    } = usePeerChatStore();

    const [view, setView] = useState<View>('directory');
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [bookingPeer, setBookingPeer] = useState<PeerUser | null>(null);
    const [reschedulingAppt, setReschedulingAppt] = useState<CounsellorAppointment | null>(null);
    const [cancelTarget, setCancelTarget] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => { loadAvailablePeers(); }, [loadAvailablePeers]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeChatId, chats]);

    const handleStartChat = (peer: PeerUser) => {
        if (!peerProfile) {
            usePeerChatStore.getState().createPeerProfile('Anonymous', true);
        }
        const chatId = startChat(peer.id);
        if (chatId) { setActiveChatId(chatId); setView('chat'); }
    };

    const handleSendMessage = () => {
        if (!messageInput.trim() || !activeChatId) return;
        sendMessage(activeChatId, messageInput);
        setMessageInput('');
    };

    const activeChat = activeChatId ? getChat(activeChatId) : null;
    const chatPeer = activeChat ? availablePeers.find((p) => activeChat.participants.includes(p.id)) : null;

    const handleCancelConfirmed = () => {
        if (!cancelTarget) return;
        cancelAppointment(cancelTarget);
        setCancelTarget(null);
        toast.success('Appointment cancelled.');
    };

    // ── CHAT VIEW ────────────────────────────────────────────────────
    if (view === 'chat' && activeChat && chatPeer) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <header className="sticky top-0 z-10 bg-background/95 backdrop-blur px-5 pb-4 border-b border-border" style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setView('directory')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-3 flex-1">
                            <div className="relative">
                                <PeerAvatar peer={chatPeer} size="sm" />
                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(chatPeer.status)}`} />
                            </div>
                            <div>
                                <h1 className="font-semibold text-foreground">{chatPeer.displayName}</h1>
                                <p className="text-xs text-muted-foreground">{chatPeer.specialization ?? chatPeer.status}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                    {activeChat.messages.length === 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
                            <div className="w-16 h-16 rounded-full bg-sage-light mx-auto mb-4 flex items-center justify-center">
                                <MessageCircle className="h-8 w-8 text-sage" />
                            </div>
                            <p className="text-muted-foreground">Start the conversation. Share what's on your mind.</p>
                        </motion.div>
                    )}
                    <AnimatePresence>
                        {activeChat.messages.map((message, index) => {
                            const isOwn = message.senderId === peerProfile?.id;
                            return (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${isOwn ? 'bg-coral text-white rounded-br-md' : 'bg-sage-light text-foreground rounded-bl-md'}`}>
                                        <p className="text-sm">{message.content}</p>
                                        <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-muted-foreground'}`}>{formatTime(message.timestamp)}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </main>

                <footer className="sticky bottom-0 bg-background border-t border-border px-5 py-4">
                    <div className="flex gap-3">
                        <Input
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 bg-card"
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button onClick={handleSendMessage} disabled={!messageInput.trim()} className="bg-coral hover:bg-coral/90 text-white">
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </footer>
            </div>
        );
    }

    // ── APPOINTMENTS VIEW ────────────────────────────────────────────
    if (view === 'appointments') {
        return (
            <>
                <div className="min-h-screen bg-background">
                    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur px-5 pb-4 border-b border-border" style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}>
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => setView('directory')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <h1 className="text-xl font-semibold text-foreground">My Appointments</h1>
                        </div>
                    </header>

                    <main className="px-5 py-6 space-y-4">
                        {appointments.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                                <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No appointments yet.</p>
                                <Button onClick={() => setView('directory')} className="mt-4 bg-coral hover:bg-coral/90 text-white">
                                    Browse Counsellors
                                </Button>
                            </motion.div>
                        ) : (
                            appointments.map((appt, index) => {
                                const peer = availablePeers.find((p) => p.id === appt.peerId);
                                if (!peer) return null;
                                const meta = apptStatusMeta(appt.status);
                                const isActive = appt.status === 'requested' || appt.status === 'confirmed';
                                return (
                                    <motion.div
                                        key={appt.id}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.06 }}
                                        className="bg-card rounded-2xl p-4 shadow-soft space-y-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <PeerAvatar peer={peer} size="sm" />
                                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${getStatusColor(peer.status)}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-foreground text-sm truncate">{peer.displayName}</p>
                                                <p className="text-xs text-muted-foreground">{peer.specialization}</p>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${meta.className}`}>
                                                {meta.icon} {meta.label}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <CalendarDays className="h-3.5 w-3.5" />
                                                {formatDate(appt.appointmentDate)}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Clock className="h-3.5 w-3.5" />
                                                {appt.slot}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
                                                {appt.consultationType === 'video' ? (
                                                    <><Video className="h-3.5 w-3.5" /> Video Consultation</>
                                                ) : (
                                                    <><MessageCircle className="h-3.5 w-3.5" /> Chat Consultation</>
                                                )}
                                            </div>
                                        </div>

                                        {isActive && (
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {appt.status === 'confirmed' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            if (appt.consultationType === 'video') {
                                                                toast.info('Secure video consultation room launching soon.');
                                                            } else {
                                                                handleStartChat(peer);
                                                            }
                                                        }}
                                                        className="bg-coral hover:bg-coral/90 text-white text-xs"
                                                    >
                                                        {appt.consultationType === 'video' ? (
                                                            <><Video className="h-3.5 w-3.5 mr-1" /> Join Session</>
                                                        ) : (
                                                            <><MessageCircle className="h-3.5 w-3.5 mr-1" /> Join Chat</>
                                                        )}
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => { setReschedulingAppt(appt); setBookingPeer(peer); }}
                                                    className="text-xs border-sage/30 text-sage"
                                                >
                                                    <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reschedule
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        if (appt.status === 'confirmed') {
                                                            setCancelTarget(appt.id);
                                                        } else {
                                                            cancelAppointment(appt.id);
                                                            toast.success('Appointment cancelled.');
                                                        }
                                                    }}
                                                    className="text-xs border-red-200 text-red-500"
                                                >
                                                    <XCircle className="h-3.5 w-3.5 mr-1" /> Cancel
                                                </Button>
                                            </div>
                                        )}

                                        <div className="pt-0.5">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const cycle: CounsellorAppointment['status'][] = ['requested', 'confirmed', 'completed', 'cancelled', 'missed'];
                                                    const next = cycle[(cycle.indexOf(appt.status) + 1) % cycle.length];
                                                    setSessionStatus(appt.peerId, next as 'requested' | 'confirmed' | 'completed');
                                                    usePeerChatStore.setState((state) => ({
                                                        appointments: state.appointments.map((a) =>
                                                            a.id === appt.id ? { ...a, status: next } : a
                                                        ),
                                                    }));
                                                    toast.success(`Status → ${next}`);
                                                }}
                                                className="text-[10px] text-muted-foreground underline"
                                            >
                                                Demo: cycle status
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </main>
                </div>

                <AnimatePresence>
                    {reschedulingAppt && bookingPeer && (
                        <BookingModal
                            peer={bookingPeer}
                            prefillAppointment={reschedulingAppt}
                            onClose={() => { setReschedulingAppt(null); setBookingPeer(null); }}
                            onBooked={() => { setReschedulingAppt(null); setBookingPeer(null); }}
                        />
                    )}
                    {cancelTarget && (
                        <CancelDialog onConfirm={handleCancelConfirmed} onClose={() => setCancelTarget(null)} />
                    )}
                </AnimatePresence>
            </>
        );
    }

    // ── DIRECTORY VIEW (default) ─────────────────────────────────────
    const activeApptCount = appointments.filter((a) => a.status === 'requested' || a.status === 'confirmed').length;

    return (
        <>
            <div className="min-h-screen bg-background pb-10">
                <header className="sticky top-0 z-10 bg-background/95 backdrop-blur px-5 pb-4 border-b border-border" style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-xl font-semibold text-foreground">UPM Counselling Students</h1>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setView('appointments')}
                                className="mt-1.5 text-xs relative"
                            >
                                <CalendarCheck2 className="h-4 w-4 mr-1.5" />
                                My Appointments
                                {activeApptCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-coral text-white text-[9px] flex items-center justify-center">
                                        {activeApptCount}
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </header>

                <main className="px-5 py-6 space-y-4">
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-muted-foreground">
                        Browse our qualified counsellors and book a session. All conversations are private and confidential.
                    </motion.p>

                    {/* Active chats shortcut */}
                    {chats.length > 0 && (
                        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                            <h2 className="text-sm font-semibold text-foreground mb-3">Active Conversations</h2>
                            <div className="space-y-2">
                                {chats.map((chat) => {
                                    const peer = availablePeers.find((p) => chat.participants.includes(p.id));
                                    if (!peer) return null;
                                    const lastMsg = chat.messages[chat.messages.length - 1];
                                    return (
                                        <motion.button
                                                            key={chat.id}
                                                            onClick={() => { setActiveChatId(chat.id); setView('chat'); }}
                                                            className="w-full bg-card rounded-xl p-3 shadow-soft flex items-center gap-3 hover:shadow-card transition-all text-left"
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            <div className="relative">
                                                                <PeerAvatar peer={peer} size="sm" />
                                                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${getStatusColor(peer.status)}`} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-foreground text-sm">{peer.displayName}</p>
                                                                {lastMsg && <p className="text-xs text-muted-foreground truncate">{lastMsg.content}</p>}
                                                            </div>
                                                            <div className="flex items-center text-xs text-muted-foreground gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {formatTime(chat.lastMessageAt)}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteChat(chat.id);
                                                                    toast.success('Conversation removed.');
                                                                }}
                                                                className="ml-1 p-1 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                                                                title="Delete conversation"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.section>
                    )}

                    {/* Counsellor directory */}
                    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <h2 className="text-sm font-semibold text-foreground mb-3">Available Counsellors</h2>
                        <div className="space-y-4">
                            {availablePeers.map((peer, index) => {
                                const latestAppt = appointments.find(
                                    (a) => a.peerId === peer.id && (a.status === 'requested' || a.status === 'confirmed')
                                );
                                const sessionStatus = sessionStatuses[peer.id];
                                return (
                                    <motion.div
                                        key={peer.id}
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.08 }}
                                        className="bg-card rounded-2xl shadow-soft overflow-hidden"
                                    >
                                        {/* Profile */}
                                        <div className="p-4 flex items-start gap-4">
                                            <div className="relative">
                                                <PeerAvatar peer={peer} size="md" />
                                                <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-card ${getStatusColor(peer.status)}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                    <h3 className="font-semibold text-foreground">{peer.displayName}</h3>
                                                    <span className={`text-xs capitalize px-2 py-0.5 rounded-full ${getStatusPillClass(peer.status)}`}>
                                                        {peer.status}
                                                    </span>
                                                </div>
                                                {peer.specialization && (
                                                    <div className="flex items-center gap-1 text-xs text-coral mb-1">
                                                        <Briefcase className="h-3 w-3" />
                                                        {peer.specialization}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                                                    {peer.rating !== undefined && (
                                                        <span className="flex items-center gap-0.5">
                                                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                            {peer.rating.toFixed(1)}
                                                        </span>
                                                    )}
                                                    {peer.experienceYears !== undefined && (
                                                        <span>{peer.experienceYears} yrs exp.</span>
                                                    )}
                                                </div>
                                                {peer.bio && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{peer.bio}</p>}
                                                <div className="flex flex-wrap gap-1 mb-2">
                                                    {peer.supportTopics.map((t) => (
                                                        <span key={t} className="text-[11px] px-2 py-0.5 bg-sage-light/60 text-sage rounded-full">{t}</span>
                                                    ))}
                                                </div>
                                                {peer.consultationMethods && (
                                                    <div className="flex gap-3">
                                                        {peer.consultationMethods.includes('chat') && (
                                                            <span className="text-[11px] flex items-center gap-1 text-muted-foreground">
                                                                <MessageCircle className="h-3 w-3" /> Chat
                                                            </span>
                                                        )}
                                                        {peer.consultationMethods.includes('video') && (
                                                            <span className="text-[11px] flex items-center gap-1 text-muted-foreground">
                                                                <Video className="h-3 w-3" /> Video
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Appointment status — inline within profile info */}
                                                {latestAppt && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setView('appointments')}
                                                        className="mt-2.5 w-full flex items-center justify-between rounded-lg bg-sage-light/40 border border-sage/20 px-2.5 py-1.5 hover:bg-sage-light/60 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-1.5 text-xs text-sage font-medium">
                                                            <CalendarDays className="h-3.5 w-3.5 flex-shrink-0" />
                                                            {formatDate(latestAppt.appointmentDate)} · {latestAppt.slot}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${apptStatusMeta(latestAppt.status).className}`}>
                                                                {apptStatusMeta(latestAppt.status).icon}
                                                                {apptStatusMeta(latestAppt.status).label}
                                                            </span>
                                                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                                        </div>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="px-4 pb-4 flex flex-wrap gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => { setBookingPeer(peer); setReschedulingAppt(null); }}
                                                className="bg-sage hover:bg-sage/90 text-white text-xs"
                                            >
                                                <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                                                Book Session
                                            </Button>
                                            {latestAppt?.status === 'confirmed' && latestAppt?.consultationType === 'video' ? (
                                                <Button
                                                    size="sm"
                                                    onClick={() => toast.info('Secure video consultation room launching soon.')}
                                                    className="bg-coral hover:bg-coral/90 text-white text-xs"
                                                >
                                                    <Video className="h-3.5 w-3.5 mr-1.5" />
                                                    Join Session
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleStartChat(peer)}
                                                    disabled={!(latestAppt?.status === 'confirmed' && latestAppt?.consultationType === 'chat')}
                                                    title={
                                                        !latestAppt ? 'Book a session first' :
                                                        latestAppt.status !== 'confirmed' ? `Chat available once Confirmed (currently ${latestAppt.status})` :
                                                        ''
                                                    }
                                                    className="border-coral/30 text-coral text-xs disabled:opacity-40"
                                                >
                                                    <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                                                    Start Chat
                                                </Button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.section>
                </main>
            </div>

            <AnimatePresence>
                {bookingPeer && !reschedulingAppt && (
                    <BookingModal
                        peer={bookingPeer}
                        onClose={() => setBookingPeer(null)}
                        onBooked={() => {
                            requestCounsellorSession(bookingPeer.id);
                            setBookingPeer(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default PeerSupportChat;
