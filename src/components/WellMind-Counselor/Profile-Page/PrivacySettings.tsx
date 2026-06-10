import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import {
  ArrowLeft, Shield, Eye, MessageCircle,
  Database, Trash2, Lock, Download
} from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { toast } from 'sonner';

interface PrivacySettingsProps {
  onClose: () => void;
}

export const PrivacySettings = ({ onClose }: PrivacySettingsProps) => {
  const { privacy, updatePrivacy } = useSettingsStore();

  const handleExportData = () => {
    const exportData = { exportDate: new Date().toISOString(), message: 'Your wellness data export', settings: privacy };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wellmind-data-export.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  const handleDeleteData = () => {
    toast.info('Data deletion requested', {
      description: 'This would delete all your data. For demo purposes, this is disabled.',
    });
  };

  const privacyItems: {
    id: string;
    icon: React.ElementType;
    label: string;
    description: string;
    value: boolean;
    accent: string;
    accentBg: string;
  }[] = [
    {
      id: 'shareAnonymousData',
      icon: Database,
      label: 'Share Anonymous Data',
      description: 'Help improve counselor tools with anonymous usage patterns',
      value: privacy.shareAnonymousData,
      accent: '#39a89b',
      accentBg: 'rgba(57,168,155,0.1)',
    },
    {
      id: 'showProfileInCounselorChat',
      icon: Eye,
      label: 'Display Profile to Clients',
      description: 'Show your counselor name and specialties in client-facing flows',
      value: privacy.showProfileInCounselorChat,
      accent: '#e8735a',
      accentBg: 'rgba(232,115,90,0.1)',
    },
    {
      id: 'allowDirectMessages',
      icon: MessageCircle,
      label: 'Allow Client Messages',
      description: 'Allow clients to message you directly about bookings',
      value: privacy.allowDirectMessages,
      accent: '#3b82f6',
      accentBg: 'rgba(59,130,246,0.1)',
    },
  ];

  return (
    <div
      className="min-h-screen pb-28"
      style={{ background: 'linear-gradient(180deg, #f0f7f5 0%, #f7faf9 60%, #ffffff 100%)' }}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-10 px-5 py-3.5"
        style={{
          background: 'rgba(240,247,245,0.96)',
          backdropFilter: 'blur(12px)',
          borderBottom: '0.5px solid rgba(57,168,155,0.15)',
          paddingTop: 'max(env(safe-area-inset-top), 14px)',
        }}
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" style={{ color: '#5f7585' }} />
          </motion.button>

          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #39a89b, #6bab9e)',
                boxShadow: '0 2px 8px rgba(57,168,155,0.3)',
              }}
            >
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: '#1a2b38' }}>Privacy & Security</p>
              <p className="text-[11px] font-semibold" style={{ color: '#39a89b' }}>
                Control your data and privacy
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero banner ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden px-5 pt-8 pb-6"
      >
        <div
          className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(57,168,155,0.13) 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute top-8 -left-12 w-48 h-48 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(107,171,158,0.08) 0%, transparent 70%)' }}
        />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h2
            className="text-[1.75rem] font-bold leading-tight mb-1.5"
            style={{ color: '#1a2b38', letterSpacing: '-0.02em' }}
          >
            Your data,{'\n'}your rules.
          </h2>
          <p className="text-[14px] leading-relaxed" style={{ color: '#5f7585' }}>
            Everything stays private and under your control.
          </p>
        </motion.div>
      </motion.div>

      <main className="px-5 space-y-4 pb-6">

        {/* ── Protected banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, type: 'spring', stiffness: 280, damping: 26 }}
          className="rounded-3xl overflow-hidden"
          style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
        >
          <div
            className="h-0.5 w-full"
            style={{ background: 'linear-gradient(90deg, #39a89b, #6bab9e)' }}
          />
          <div className="p-4 flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(57,168,155,0.1)' }}
            >
              <Lock className="h-5 w-5" style={{ color: '#39a89b' }} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: '#1a2b38' }}>Your Data is Protected</p>
              <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: '#8fa3b1' }}>
                All data is stored locally on your device — never uploaded
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Privacy toggles ── */}
        <section className="space-y-3">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest px-1"
            style={{ color: '#8fa3b1' }}
          >
            Privacy Controls
          </p>

          {privacyItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07, type: 'spring', stiffness: 280, damping: 26 }}
                className="rounded-3xl overflow-hidden"
                style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
              >
                <div
                  className="h-0.5 w-full"
                  style={{ background: `linear-gradient(90deg, ${item.accent}, ${item.accent}88)` }}
                />
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: item.accentBg }}
                    >
                      <Icon className="h-5 w-5" style={{ color: item.accent }} strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold leading-snug" style={{ color: '#1a2b38' }}>{item.label}</p>
                      <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: '#8fa3b1' }}>{item.description}</p>
                    </div>
                    <Switch
                      checked={item.value}
                      onCheckedChange={(checked) => updatePrivacy({ [item.id]: checked })}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* ── Data retention ── */}
        <section className="space-y-3">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest px-1"
            style={{ color: '#8fa3b1' }}
          >
            Data Retention
          </p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, type: 'spring', stiffness: 280, damping: 26 }}
            className="rounded-3xl overflow-hidden"
            style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
          >
            <div
              className="h-0.5 w-full"
              style={{ background: 'linear-gradient(90deg, #d97706, #d9770688)' }}
            />
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(251,191,36,0.12)' }}
                >
                  <Database className="h-5 w-5" style={{ color: '#d97706' }} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#1a2b38' }}>How long to keep your data</p>
                  <p className="text-[11px]" style={{ color: '#8fa3b1' }}>Older entries will be removed automatically</p>
                </div>
              </div>

              <div
                className="h-px w-full mb-3"
                style={{ background: 'linear-gradient(90deg, rgba(57,168,155,0.15), transparent)' }}
              />

              <div className="grid grid-cols-4 gap-2">
                {[30, 90, 180, 365].map((days) => {
                  const isActive = privacy.dataRetentionDays === days;
                  return (
                    <motion.button
                      key={days}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => updatePrivacy({ dataRetentionDays: days })}
                      className="py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={
                        isActive
                          ? {
                              background: 'linear-gradient(135deg, #39a89b, #6bab9e)',
                              color: 'white',
                              boxShadow: '0 3px 10px rgba(57,168,155,0.3)',
                            }
                          : {
                              background: 'rgba(57,168,155,0.06)',
                              color: '#8fa3b1',
                              border: '1px solid rgba(57,168,155,0.12)',
                            }
                      }
                    >
                      {days === 365 ? '1 Year' : `${days}d`}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── Data actions ── */}
        <section className="space-y-3">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest px-1"
            style={{ color: '#8fa3b1' }}
          >
            Your Data
          </p>

          {/* Export */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 280, damping: 26 }}
            className="rounded-3xl overflow-hidden"
            style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
          >
            <div
              className="h-0.5 w-full"
              style={{ background: 'linear-gradient(90deg, #39a89b, #6bab9e88)' }}
            />
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(57,168,155,0.1)' }}
                >
                  <Download className="h-5 w-5" style={{ color: '#39a89b' }} strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: '#1a2b38' }}>Export My Data</p>
                  <p className="text-[11px]" style={{ color: '#8fa3b1' }}>Download a copy of your data</p>
                </div>
              </div>

              <div
                className="h-px w-full mb-3"
                style={{ background: 'linear-gradient(90deg, rgba(57,168,155,0.15), transparent)' }}
              />

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleExportData}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, #39a89b, #6bab9e)',
                  boxShadow: '0 3px 10px rgba(57,168,155,0.33)',
                }}
              >
                <Download className="h-3.5 w-3.5" />
                Export Data
              </motion.button>
            </div>
          </motion.div>

          {/* Delete */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.46, type: 'spring', stiffness: 280, damping: 26 }}
            className="rounded-3xl overflow-hidden"
            style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
          >
            <div
              className="h-0.5 w-full"
              style={{ background: 'linear-gradient(90deg, #ef4444, #ef444488)' }}
            />
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(239,68,68,0.08)' }}
                >
                  <Trash2 className="h-5 w-5" style={{ color: '#ef4444' }} strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: '#ef4444' }}>Delete All Data</p>
                  <p className="text-[11px]" style={{ color: '#8fa3b1' }}>Permanently remove all your data</p>
                </div>
              </div>

              <div
                className="h-px w-full mb-3"
                style={{ background: 'linear-gradient(90deg, rgba(239,68,68,0.15), transparent)' }}
              />

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleDeleteData}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  color: '#ef4444',
                  border: '1.5px solid rgba(239,68,68,0.2)',
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete All Data
              </motion.button>
            </div>
          </motion.div>
        </section>

      </main>
    </div>
  );
};

export default PrivacySettings;