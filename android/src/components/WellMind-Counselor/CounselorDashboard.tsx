import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { BottomNav } from './BottomNav';
import CounselorChat from './CounselorChat';
import CounselorAppointments from './Appoinments-Page/CounselorAppointments';
import CounselorClients from './Clients-Page/CounselorClients';
import CounselorHome from './Home-Page/CounselorHome';
import CounselorNotes from './Notes-Page/CounselorNotes';
import CounselorProfile from './Profile-Page/CounselorProfile';
import CounselorReports from './Reports-Page/CounselorReports';

interface CounselorDashboardProps {
  onLogout: () => void;
}

type ViewType = 'home' | 'appointments' | 'clients' | 'chat' | 'notes' | 'reports' | 'profile';

const viewTitles: Record<Exclude<ViewType, 'chat'>, string> = {
  home: 'Counselor Dashboard',
  appointments: 'Appointments',
  clients: 'Clients',
  notes: 'Notes',
  reports: 'Reports',
  profile: 'Profile',
};

export const CounselorDashboard = ({ onLogout }: CounselorDashboardProps) => {
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentUser = useAuthStore((state) => state.getCurrentUser());

  const openChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setActiveView('chat');
    setMobileMenuOpen(false);
  };

  const changeView = (view: ViewType) => {
    setActiveView(view);
    if (view !== 'chat') setSelectedChatId(null);
    setMobileMenuOpen(false);
  };

  const backFromChat = () => {
    setSelectedChatId(null);
    setActiveView('home');
  };

  if (activeView === 'chat' && selectedChatId) {
    return <CounselorChat chatId={selectedChatId} onClose={backFromChat} onBack={backFromChat} />;
  }

  return (
    <div
      className="h-[100dvh] bg-background text-foreground flex flex-col overflow-hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <header
        className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold sm:text-2xl">{viewTitles[activeView]}</h1>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              {currentUser?.counselorName || currentUser?.email || 'WellMind Counselor'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="h-9 w-9 text-muted-foreground hover:text-foreground sm:hidden"
              title="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen ? (
          <div className="fixed inset-0 z-30 bg-black/40 sm:hidden" onClick={() => setMobileMenuOpen(false)} />
        ) : null}
      </AnimatePresence>

      <main className="mx-auto w-full max-w-6xl flex-1 overflow-y-auto px-3 py-4 pb-24 sm:px-6 sm:pb-6">
        <AnimatePresence mode="wait">
          {activeView === 'home' ? (
            <CounselorHome onOpenChat={openChat} onViewChange={(view) => changeView(view)} />
          ) : null}
          {activeView === 'appointments' ? <CounselorAppointments onOpenChat={openChat} /> : null}
          {activeView === 'clients' ? <CounselorClients onOpenChat={openChat} /> : null}
          {activeView === 'notes' ? <CounselorNotes /> : null}
          {activeView === 'reports' ? <CounselorReports /> : null}
          {activeView === 'profile' ? <CounselorProfile onLogout={onLogout} /> : null}
        </AnimatePresence>
      </main>

      <BottomNav activeView={activeView} onViewChange={(view) => changeView(view as ViewType)} />
    </div>
  );
};

export default CounselorDashboard;
