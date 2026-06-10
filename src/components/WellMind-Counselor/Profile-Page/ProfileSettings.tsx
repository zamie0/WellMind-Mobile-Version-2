import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

interface ProfileSettingsProps {
  onClose: () => void;
}

export default function ProfileSettings({ onClose }: ProfileSettingsProps) {
  const currentUser = useAuthStore((state) => state.getCurrentUser());
  const updateCounselorProfile = useAuthStore((state) => state.updateCounselorProfile);

  const [counselorName, setCounselorName] = useState(currentUser?.counselorName || currentUser?.name || '');
  const [specialization, setSpecialization] = useState((currentUser?.specialization ?? []).join(', '));
  const [bio, setBio] = useState(currentUser?.bio || '');

  const handleSave = () => {
    updateCounselorProfile({
      counselorName: counselorName.trim(),
      specialization: specialization
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      bio: bio.trim(),
    });
    toast.success('Counselor profile updated!');
    onClose();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-sage px-5 pt-safe-top pb-6 rounded-b-[2rem]">
        <div className="pt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-card/60 flex items-center justify-center hover:bg-card transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Counselor Profile</h1>
            <p className="text-sm text-foreground/70">Update your counselor details and specialties.</p>
          </div>
        </div>
      </header>

      <main className="px-5 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-5 shadow-soft space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="counselorName">Display Name</Label>
            <Input
              id="counselorName"
              value={counselorName}
              onChange={(e) => setCounselorName(e.target.value)}
              placeholder="Your name or practice name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">Specialization</Label>
            <Input
              id="specialization"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="e.g. anxiety, trauma, relationships"
            />
            <p className="text-xs text-muted-foreground">Separate multiple specialties with commas.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full min-h-[120px] rounded-2xl border border-input bg-transparent px-4 py-3 text-sm outline-none"
              placeholder="A short introduction for clients"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Button
            onClick={handleSave}
            disabled={!counselorName.trim()}
            className="w-full py-6 rounded-2xl"
          >
            Save Profile
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
