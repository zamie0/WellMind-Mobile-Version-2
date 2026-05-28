import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Save, ShieldCheck, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

interface CounselorProfileProps {
  onLogout: () => void;
}

export const CounselorProfile = ({ onLogout }: CounselorProfileProps) => {
  const { getCurrentUser, updateCounselorProfile } = useAuthStore();
  const currentUser = getCurrentUser();
  const [name, setName] = useState(currentUser?.counselorName || '');
  const [specialization, setSpecialization] = useState((currentUser?.specialization || []).join(', '));
  const [bio, setBio] = useState(currentUser?.bio || '');

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

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-4"
    >
      <section>
        <h2 className="text-2xl font-bold">Profile</h2>
        <p className="text-sm text-muted-foreground">Manage your counselor identity and professional details.</p>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-coral/10 text-coral">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-semibold">{currentUser?.email}</h3>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              {currentUser?.isVerified ? 'Verified counselor' : 'Pending verification'}
            </p>
          </div>
        </div>

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

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button onClick={handleSave} className="flex-1">
            <Save className="h-4 w-4" />
            Save Profile
          </Button>
          <Button variant="outline" onClick={onLogout} className="flex-1 border-coral/30 text-coral hover:bg-coral/10">
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
        </div>
      </section>
    </motion.div>
  );
};

export default CounselorProfile;
