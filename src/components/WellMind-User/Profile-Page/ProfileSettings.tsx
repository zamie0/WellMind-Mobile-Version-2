import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Camera, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWellMindStore } from '@/stores/wellmindStore';
import { toast } from 'sonner';

interface ProfileSettingsProps {
  onClose: () => void;
}

export default function ProfileSettings({ onClose }: ProfileSettingsProps) {
  const user = useWellMindStore((state) => state.user);
  const updateUser = useWellMindStore((state) => state.updateUser);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Please pick one under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatar(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = () => {
    updateUser({ name, email, avatar });
    toast.success('Profile updated!');
    onClose();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-sage px-5 pt-safe-top pb-6 rounded-b-[2rem]">
        <div className="pt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-card/60 flex items-center justify-center hover:bg-card transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Profile Settings</h1>
        </div>
      </header>

      <main className="px-5 py-6 space-y-6">
        {/* Avatar picker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 pt-2"
        >
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImagePick}
          />

          {/* Avatar circle */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full gradient-hero flex items-center justify-center shadow-card overflow-hidden">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-primary-foreground" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-card shadow-card flex items-center justify-center border-2 border-background hover:bg-muted transition-colors"
              aria-label="Change photo"
            >
              <Camera className="h-4 w-4 text-foreground" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-medium text-sage hover:underline"
            >
              {avatar ? 'Change photo' : 'Upload photo'}
            </button>
            {avatar && (
              <>
                <span className="text-muted-foreground">·</span>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-sm font-medium text-destructive hover:underline flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground">JPG, PNG or GIF · Max 5MB</p>
        </motion.div>

        {/* Fields */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-5 shadow-soft space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 rounded-xl"
                placeholder="Your name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 rounded-xl"
                placeholder="your@email.com"
              />
            </div>
          </div>
        </motion.div>

        {/* Save */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full py-6 rounded-2xl"
          >
            Save Changes
          </Button>
        </motion.div>
      </main>
    </div>
  );
}