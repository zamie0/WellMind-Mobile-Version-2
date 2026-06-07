import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Bell, ChevronRight, HelpCircle, KeyRound,
  LayoutList, LogOut, Pencil, Save, Shield, ShieldCheck,
  Stethoscope, UserRound, X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCounselorStore } from '@/stores/counselorStore';
import { toast } from 'sonner';

interface CounselorProfileProps { onLogout: () => void; }

/* ── Edit Profile Page ───────────────────────────────────────────── */
const EditProfilePage = ({
  name, setName, specialization, setSpecialization,
  bio, setBio, onSave, onClose,
}: {
  name: string; setName: (v: string) => void;
  specialization: string; setSpecialization: (v: string) => void;
  bio: string; setBio: (v: string) => void;
  onSave: () => void; onClose: () => void;
}) => (
  <motion.div
    key="edit-profile"
    initial={{ opacity: 0, x: '100%' }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: '100%' }}
    transition={{ type: 'spring', stiffness: 320, damping: 32 }}
    className="fixed inset-0 z-50 overflow-y-auto pb-28"
    style={{ background: 'linear-gradient(180deg,#f0f7f5 0%,#f7faf9 60%,#fff 100%)' }}
  >
    {/* Hero */}
    <div className="relative overflow-hidden px-5 pt-10 pb-6">
      <div className="pointer-events-none absolute -top-12 -right-12 w-52 h-52 rounded-full"
        style={{ background: 'radial-gradient(circle,rgba(57,168,155,.13) 0%,transparent 70%)' }} />
      <div className="pointer-events-none absolute top-4 -left-10 w-40 h-40 rounded-full"
        style={{ background: 'radial-gradient(circle,rgba(232,179,90,.08) 0%,transparent 70%)' }} />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <button type="button" onClick={onClose}
          className="flex items-center gap-2 mb-5 rounded-full px-3 py-1.5"
          style={{ background: 'rgba(255,255,255,0.8)', boxShadow: '0 2px 8px rgba(0,0,0,.08)' }}>
          <ArrowLeft className="h-4 w-4" style={{ color: '#39a89b' }} />
          <span className="text-xs font-semibold" style={{ color: '#39a89b' }}>Back</span>
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: '#39a89b' }}>
            <Pencil className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#39a89b' }}>
            Edit Profile
          </span>
        </div>
        <h1 className="text-[1.75rem] font-bold leading-tight mb-1"
          style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}>
          Your Profile
        </h1>
        <p className="text-[14px]" style={{ color: '#5f7585' }}>Update your professional information.</p>
      </motion.div>
    </div>

    {/* Form card */}
    <div className="px-5 space-y-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        className="rounded-3xl overflow-hidden"
        style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,.07)' }}>
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#39a89b,#6bab9e)' }} />
        <div className="px-5 py-5 space-y-5">
          {/* Display Name */}
          <div>
            <label className="block text-[10px] font-semibold mb-1.5 uppercase tracking-widest" style={{ color: '#8fa3b1' }}>
              Display Name
            </label>
            <div className="relative">
              <UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: '#8fa3b1' }} />
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Alex Tan"
                className="w-full rounded-2xl pl-10 pr-4 py-3 text-sm font-medium outline-none"
                style={{ background: '#f0f7f5', color: '#1a2b38' }} />
            </div>
          </div>
          {/* Specializations */}
          <div>
            <label className="block text-[10px] font-semibold mb-1.5 uppercase tracking-widest" style={{ color: '#8fa3b1' }}>
              Specializations
            </label>
            <div className="relative">
              <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: '#8fa3b1' }} />
              <input value={specialization} onChange={(e) => setSpecialization(e.target.value)}
                placeholder="Anxiety, Stress, Relationships"
                className="w-full rounded-2xl pl-10 pr-4 py-3 text-sm outline-none"
                style={{ background: '#f0f7f5', color: '#1a2b38' }} />
            </div>
            <p className="mt-1.5 text-xs" style={{ color: '#8fa3b1' }}>Separate multiple areas with commas.</p>
          </div>
          {/* Bio */}
          <div>
            <label className="block text-[10px] font-semibold mb-1.5 uppercase tracking-widest" style={{ color: '#8fa3b1' }}>
              Bio
            </label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)}
              placeholder="Short professional introduction…" rows={4}
              className="w-full rounded-2xl px-4 py-3 text-sm outline-none resize-none leading-relaxed"
              style={{ background: '#f0f7f5', color: '#1a2b38', border: 'none' }} />
          </div>
        </div>
      </motion.div>

      {/* Save */}
      <motion.button whileTap={{ scale: 0.98 }} onClick={onSave}
        className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 font-bold text-sm text-white"
        style={{ background: 'linear-gradient(135deg,#39a89b,#6bab9e)', boxShadow: '0 4px 16px rgba(57,168,155,.3)' }}>
        <Save className="h-4 w-4" />
        Save Changes
      </motion.button>

      {/* Discard */}
      <motion.button whileTap={{ scale: 0.98 }} onClick={onClose}
        className="w-full rounded-2xl py-3.5 flex items-center justify-center gap-2 font-semibold text-sm"
        style={{ background: 'rgba(232,115,90,.08)', color: '#c0502f' }}>
        <X className="h-4 w-4" />
        Discard Changes
      </motion.button>
    </div>
  </motion.div>
);

/* ── Main Profile Page ───────────────────────────────────────────── */
export const CounselorProfile = ({ onLogout }: CounselorProfileProps) => {
  const { getCurrentUser, updateCounselorProfile } = useAuthStore();
  const { getAllClients, appointments, getSessionHistory } = useCounselorStore();
  const currentUser = getCurrentUser();

  const [name, setName]                     = useState(currentUser?.counselorName || '');
  const [specialization, setSpecialization] = useState((currentUser?.specialization || []).join(', '));
  const [bio, setBio]                       = useState(currentUser?.bio || '');
  const [editOpen, setEditOpen]             = useState(false);

  const clients               = getAllClients();
  const completedSessions     = getSessionHistory().length + appointments.filter((a) => a.status === 'completed').length;
  const confirmedAppointments = appointments.filter((a) => a.status === 'confirmed').length;

  const handleSave = () => {
    updateCounselorProfile({
      counselorName:  name.trim() || 'Counselor',
      specialization: specialization.split(',').map((s) => s.trim()).filter(Boolean),
      bio:            bio.trim(),
    });
    toast.success('Profile updated.');
    setEditOpen(false);
  };

  const menuItems = [
    { Icon: KeyRound,   label: 'Account Security', description: 'Role-based local session protection', accent: '#6bab9e' },
    { Icon: Bell,       label: 'Notifications',    description: 'Appointment and session reminders',   accent: '#e8b35a' },
    { Icon: Shield,     label: 'Privacy',          description: 'Client notes are stored locally',     accent: '#39a89b' },
    { Icon: HelpCircle, label: 'Help & FAQ',       description: 'Counselor workflow support',          accent: '#8fa3b1' },
  ];

  return (
    <>
      <motion.div key="profile" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }} className="space-y-5">

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden px-1 pt-2 pb-1">
          <div className="pointer-events-none absolute -top-12 -right-12 w-52 h-52 rounded-full"
            style={{ background: 'radial-gradient(circle,rgba(57,168,155,.11) 0%,transparent 70%)' }} />
          <div className="pointer-events-none absolute top-4 -left-10 w-40 h-40 rounded-full"
            style={{ background: 'radial-gradient(circle,rgba(232,179,90,.08) 0%,transparent 70%)' }} />

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            {/* Badge */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: '#39a89b' }}>
                <Stethoscope className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#39a89b' }}>
                Counselor
              </span>
            </div>

            {/* Profile row */}
            <div className="flex items-center gap-4 mb-3">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#39a89b,#6bab9e)', boxShadow: '0 4px 16px rgba(57,168,155,.28)' }}>
                  <Stethoscope className="h-8 w-8 text-white" />
                </div>
                <motion.button type="button" whileTap={{ scale: 0.92 }} onClick={() => setEditOpen(true)}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2"
                  style={{ background: 'white', borderColor: '#f0f7f5', boxShadow: '0 2px 8px rgba(0,0,0,.12)' }}>
                  <Pencil className="h-3 w-3" style={{ color: '#39a89b' }} />
                </motion.button>
              </div>

              {/* Name / meta */}
              <div className="flex-1 min-w-0">
                <h1 className="text-[1.6rem] font-bold leading-tight mb-0.5"
                  style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}>
                  {currentUser?.counselorName || 'Counselor'}
                </h1>
                <p className="text-sm truncate" style={{ color: '#5f7585' }}>{currentUser?.email}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ShieldCheck className="h-3.5 w-3.5" style={{ color: '#39a89b' }} />
                  <span className="text-xs" style={{ color: '#39a89b' }}>
                    {currentUser?.isVerified ? 'Verified counselor' : 'Pending verification'}
                  </span>
                </div>
              </div>

              {/* Edit button */}
              <motion.button whileTap={{ scale: 0.96 }} onClick={() => setEditOpen(true)}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full"
                style={{ background: 'rgba(57,168,155,.12)', color: '#39a89b' }}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </motion.button>
            </div>

            {/* Specialization pills */}
            {currentUser?.specialization?.length ? (
              <div className="flex flex-wrap gap-1.5">
                {currentUser.specialization.map((s) => (
                  <span key={s} className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(57,168,155,.12)', color: '#2a8f84' }}>{s}</span>
                ))}
              </div>
            ) : null}

            {/* Bio */}
            {currentUser?.bio ? (
              <p className="mt-2 text-sm leading-relaxed" style={{ color: '#5f7585' }}>{currentUser.bio}</p>
            ) : null}
          </motion.div>
        </div>

        {/* ── Settings ────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
          <div className="flex items-center gap-2 mb-3 px-0.5">
            <LayoutList className="h-4 w-4" style={{ color: '#39a89b' }} />
            <h2 className="text-base font-bold" style={{ color: '#1a2b38', letterSpacing: '-0.01em' }}>Settings</h2>
          </div>

          <div className="space-y-3">
            {menuItems.map(({ Icon, label, description, accent }, i) => (
              <motion.button key={label} type="button"
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.36 + i * 0.07 }} whileTap={{ scale: 0.98 }}
                onClick={() => toast.info(`${label} settings coming soon.`)}
                className="w-full rounded-3xl overflow-hidden text-left"
                style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,.07)' }}>
                <div className="h-1 w-full"
                  style={{ background: `linear-gradient(90deg,${accent},${accent}99)` }} />
                <div className="flex items-center gap-4 px-4 py-3.5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${accent}18` }}>
                    <Icon className="h-5 w-5" style={{ color: accent }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm" style={{ color: '#1a2b38' }}>{label}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#8fa3b1' }}>{description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: '#c5d3da' }} />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Logout ──────────────────────────────────────────────── */}
        <motion.button whileTap={{ scale: 0.98 }} onClick={onLogout}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.64 }}
          className="w-full rounded-3xl overflow-hidden flex items-center justify-center gap-2.5 py-4 font-bold text-sm"
          style={{ background: 'white', color: '#e8735a', boxShadow: '0 4px 20px rgba(232,115,90,.12)' }}>
          <LogOut className="h-4 w-4" />
          Log Out
        </motion.button>
      </motion.div>

      {/* ── Edit overlay ────────────────────────────────────────── */}
      <AnimatePresence>
        {editOpen && (
          <EditProfilePage
            name={name} setName={setName}
            specialization={specialization} setSpecialization={setSpecialization}
            bio={bio} setBio={setBio}
            onSave={handleSave} onClose={() => setEditOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default CounselorProfile;