import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Calendar,
  ChevronRight,
  Clock,
  HelpCircle,
  KeyRound,
  LogOut,
  Save,
  Shield,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/stores/authStore';
import { useCounselorStore } from '@/stores/counselorStore';
import { toast } from 'sonner';

interface CounselorProfileProps {
  onLogout: () => void;
}

export const CounselorProfile = ({ onLogout }: CounselorProfileProps) => {
  const { getCurrentUser, updateCounselorProfile } = useAuthStore();
  const { getAllClients, appointments, getSessionHistory } = useCounselorStore();
  const currentUser = getCurrentUser();
  const [name, setName] = useState(currentUser?.counselorName || '');
  const [specialization, setSpecialization] = useState((currentUser?.specialization || []).join(', '));
  const [bio, setBio] = useState(currentUser?.bio || '');

  const clients = getAllClients();
  const completedSessions = getSessionHistory().length + appointments.filter((appointment) => appointment.status === 'completed').length;
  const confirmedAppointments = appointments.filter((appointment) => appointment.status === 'confirmed').length;

  const handleSave = () => {
    updateCounselorProfile({
      counselorName: name.trim() || 'Counselor',
      specialization: specialization
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      bio: bio.trim(),
    });
    toast.success('Profile updated.');
  };

  const menuItems = [
    {
      icon: <KeyRound className="h-5 w-5" />,
      label: 'Account Security',
      description: 'Role-based local session protection',
      color: 'bg-sage-light text-sage',
    },
    {
      icon: <Bell className="h-5 w-5" />,
      label: 'Notifications',
      description: 'Appointment and session reminders',
      color: 'bg-honey-light text-honey',
    },
    {
      icon: <Shield className="h-5 w-5" />,
      label: 'Privacy',
      description: 'Client notes are stored locally in this demo',
      color: 'bg-sky-light text-sky',
    },
    {
      icon: <HelpCircle className="h-5 w-5" />,
      label: 'Help & FAQ',
      description: 'Counselor workflow support',
      color: 'bg-lavender-light text-lavender',
    },
  ];

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-6"
    >
      <section className="gradient-sage -mx-3 -mt-4 rounded-b-[2rem] px-5 pb-8 pt-6 sm:-mx-6 sm:px-7">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full gradient-hero shadow-card">
            <Stethoscope className="h-10 w-10 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-bold text-foreground">{currentUser?.counselorName || 'Counselor'}</h2>
            <p className="truncate text-sm text-muted-foreground">{currentUser?.email}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-sage" />
              {currentUser?.isVerified ? 'Verified counselor' : 'Pending verification'}
            </p>
          </div>
        </motion.div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        {[
          { label: 'Clients', value: clients.length, icon: UserRound, color: 'text-primary' },
          { label: 'Booked', value: confirmedAppointments, icon: Calendar, color: 'text-sage' },
          { label: 'Done', value: completedSessions, icon: Clock, color: 'text-coral' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-card p-4 text-center shadow-soft">
            <stat.icon className={`mx-auto mb-2 h-6 w-6 ${stat.color}`} />
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl bg-card p-5 shadow-soft">
        <h3 className="mb-4 font-semibold">Professional Details</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Display Name</label>
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Dr. Alex Tan" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Specializations</label>
            <Input
              value={specialization}
              onChange={(event) => setSpecialization(event.target.value)}
              placeholder="Anxiety, Stress, Relationships"
            />
            <p className="mt-1 text-xs text-muted-foreground">Separate multiple areas with commas.</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Bio</label>
            <Textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="Short professional introduction"
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <Button onClick={handleSave} className="mt-5 w-full py-6">
          <Save className="h-5 w-5" />
          Save Profile
        </Button>
      </section>

      <section className="space-y-3">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 * index }}
            type="button"
            onClick={() => toast.info(`${item.label} settings coming soon.`)}
            className="flex w-full items-center gap-4 rounded-2xl bg-card p-4 text-left shadow-soft transition-all hover:shadow-card"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}>{item.icon}</div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">{item.label}</p>
              <p className="truncate text-sm text-muted-foreground">{item.description}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </motion.button>
        ))}
      </section>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Button
          variant="outline"
          onClick={onLogout}
          className="w-full rounded-2xl border-coral/30 py-6 text-coral hover:bg-coral/10"
        >
          <LogOut className="h-5 w-5" />
          Log Out
        </Button>
      </motion.div>

      <div className="pb-2 text-center">
        <p className="text-sm text-muted-foreground">WellMind Counselor v1.0.0</p>
        <p className="mt-1 text-xs text-muted-foreground">Professional support workspace</p>
      </div>
    </motion.div>
  );
};

export default CounselorProfile;
