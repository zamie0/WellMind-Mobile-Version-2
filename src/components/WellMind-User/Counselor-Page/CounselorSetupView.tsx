import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Eye, EyeOff, Users } from 'lucide-react';
import type { CounselorUser } from '@/types/wellmind';

interface CounselorSetupViewProps {
  userName?: string;
  counselorProfile: CounselorUser | null;
  displayName: string;
  isAnonymous: boolean;
  bio: string;
  onDisplayNameChange: (value: string) => void;
  onIsAnonymousChange: (value: boolean) => void;
  onBioChange: (value: string) => void;
  onGoBack: () => void;
  onSubmit: () => void;
  embedded?: boolean;
}

export const CounselorSetupView = ({
  userName,
  counselorProfile,
  displayName,
  isAnonymous,
  bio,
  onDisplayNameChange,
  onIsAnonymousChange,
  onBioChange,
  onGoBack,
  onSubmit,
  embedded = false,
}: CounselorSetupViewProps) => (
  <div className={embedded ? 'bg-gradient-to-b from-cream-100 to-sage-50' : 'min-h-screen bg-gradient-to-b from-cream-100 to-sage-50 pb-24'}>
    <header className="relative bg-gradient-to-br from-sage to-sage-dark text-white px-5 pt-10 pb-12 rounded-b-[2rem] shadow-lg overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-coral/20 rounded-full blur-2xl" />

      <div className="relative">
        {!!counselorProfile && (
          <Button variant="ghost" size="icon" onClick={onGoBack} className="text-white hover:bg-white/20 -ml-2 mb-3">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-tight">Set Up Your Profile</h1>
            <p className="text-sm opacity-90">Join the counselor support community</p>
          </div>
        </motion.div>
      </div>
    </header>

    <main className="px-5 -mt-6 pb-10 space-y-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-3xl p-6 shadow-card border border-border/40">
        <div className="flex items-center gap-4 mb-6">
          <motion.div
            key={isAnonymous ? 'anon' : 'named'}
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coral/20 to-coral/10 flex items-center justify-center"
          >
            {isAnonymous ? <EyeOff className="h-8 w-8 text-coral" /> : <Eye className="h-8 w-8 text-coral" />}
          </motion.div>
          <div className="flex-1">
            <h2 className="font-semibold text-foreground">Choose Your Identity</h2>
            <p className="text-sm text-muted-foreground">Choose how your profile appears when chatting with counselors.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={() => onIsAnonymousChange(true)}
              className={`w-full text-left rounded-2xl border p-4 transition-colors ${
                isAnonymous ? 'border-sage bg-sage-light/40' : 'border-border bg-background hover:bg-muted/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-sage/20 flex items-center justify-center shrink-0">
                  <EyeOff className="h-5 w-5 text-sage-dark" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">Stay Anonymous</p>
                  <p className="text-xs text-muted-foreground mt-1">Only Anonymous is shown. Your name and personal details stay hidden.</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onIsAnonymousChange(false)}
              className={`w-full text-left rounded-2xl border p-4 transition-colors ${
                !isAnonymous ? 'border-coral/60 bg-coral-light/40' : 'border-border bg-background hover:bg-muted/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-coral/15 flex items-center justify-center shrink-0">
                  <Eye className="h-5 w-5 text-coral" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">Public / Standard Profile</p>
                  <p className="text-xs text-muted-foreground mt-1">Your display name is visible to supporters for a more personal connection.</p>
                </div>
              </div>
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-muted/40 rounded-xl border border-border/50">
            <p className="text-sm text-foreground font-medium">Privacy Mode</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{isAnonymous ? 'Anonymous' : 'Public'}</span>
              <Switch checked={isAnonymous} onCheckedChange={onIsAnonymousChange} />
            </div>
          </div>

          <AnimatePresence>
            {!isAnonymous && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <label className="text-sm font-medium text-foreground block mb-2">Display Name</label>
                <Input
                  value={displayName}
                  onChange={(e) => onDisplayNameChange(e.target.value)}
                  placeholder="How should others call you?"
                  className="bg-background rounded-xl py-6"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="rounded-xl border border-dashed border-border p-3 bg-background">
            <p className="text-xs font-medium text-foreground mb-1">Profile Preview</p>
            <p className="text-sm text-muted-foreground">
              Others will see: <span className="font-medium text-foreground">{isAnonymous ? 'Anonymous' : displayName.trim() || userName || 'You'}</span>
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Short Bio <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              value={bio}
              onChange={(e) => onBioChange(e.target.value)}
              placeholder="Share a little about yourself or why you're here..."
              className="bg-background resize-none rounded-xl"
              rows={3}
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-honey-light/60 rounded-2xl p-5 border border-honey-light"
      >
        <h3 className="font-medium text-foreground mb-1 flex items-center gap-2">💡 About Counselor Support</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Connect with trained counselors who understand what you are going through. All conversations are private and confidential.
        </p>
      </motion.div>

      <Button onClick={onSubmit} className="w-full py-6 rounded-2xl bg-coral hover:bg-coral/90 text-white shadow-card">
        <Users className="h-5 w-5 mr-2" />
        Find Counselors
      </Button>
    </main>
  </div>
);
