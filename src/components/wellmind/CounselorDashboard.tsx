import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  LogOut,
  Users,
  Calendar,
  MessageCircle,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCounselorStore } from '@/stores/counselorStore';
import { toast } from 'sonner';
import CounselorChat from './CounselorChat';

interface CounselorDashboardProps {
  onLogout: () => void;
}

type DashboardView = 'overview' | 'clients' | 'appointments' | 'chat' | 'settings';

const CLIENT_SEARCH_SUGGESTIONS = ['Alicia Tan', 'Jason Lee'];

export const CounselorDashboard = ({ onLogout }: CounselorDashboardProps) => {
  const { getCurrentUser, logout } = useAuthStore();
  const {
    clients,
    getUpcomingAppointments,
    getActiveSessions,
    setActiveChat,
    getActiveChat,
    addClient,
    startSession,
    removeClient,
  } = useCounselorStore();

  const currentUser = getCurrentUser();
  const [view, setView] = useState<DashboardView>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(getActiveChat());

  const upcomingAppointments = getUpcomingAppointments();
  const activeSessions = getActiveSessions();
  const filteredClients = clients.filter((client) =>
    client.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const matchingClientSuggestions = CLIENT_SEARCH_SUGGESTIONS.filter(
    (name) =>
      name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !clients.some((client) => client.displayName === name)
  );
  const totalClientsCount = Math.max(clients.length, 4);
  const upcomingAppointmentsCount = Math.max(upcomingAppointments.length, 1);

  const handleLogout = () => {
    logout();
    onLogout();
    toast.success('Logged out successfully');
  };

  const handleChatSelect = (chatId: string) => {
    setActiveChatId(chatId);
    setActiveChat(chatId);
    setView('chat');
  };

  const handleChatClose = () => {
    setActiveChatId(null);
    setActiveChat(null);
    setView('overview');
  };

  const handleRecentActivityClick = (clientName: string) => {
    if (clientName !== 'Sarah Johnson') return;

    let existingClient = clients.find((c) => c.displayName === clientName);

    if (!existingClient) {
      const newClientId = crypto.randomUUID();
      addClient({
        id: newClientId,
        displayName: clientName,
        isAnonymous: false,
        appointmentCount: 1,
        lastInteraction: new Date(),
      });
      existingClient = {
        id: newClientId,
        displayName: clientName,
        isAnonymous: false,
        appointmentCount: 1,
        lastInteraction: new Date(),
      };
    }

    setSearchQuery('');
    const sessionId = startSession(existingClient.id, existingClient.displayName, 'chat');
    handleChatSelect(sessionId);
  };

  const handleJoinSession = (peerId: string, consultationType: 'chat' | 'video') => {
    let existingClient = clients.find((c) => c.id === peerId);

    if (!existingClient) {
      const newClient = {
        id: peerId,
        displayName: `Client ${clients.length + 1}`,
        isAnonymous: true,
        appointmentCount: 1,
        lastInteraction: new Date(),
      };
      addClient(newClient);
      existingClient = newClient;
    }

    setSearchQuery('');
    const sessionId = startSession(existingClient.id, existingClient.displayName, consultationType);
    handleChatSelect(sessionId);
  };

  const handleDeleteClient = (clientId: string, clientName: string) => {
    removeClient(clientId);
    toast.success(`${clientName} removed from clients`);
  };

  const handleSuggestedClientClick = (clientName: string) => {
    let existingClient = clients.find((c) => c.displayName === clientName);

    if (!existingClient) {
      const newClient = {
        id: crypto.randomUUID(),
        displayName: clientName,
        isAnonymous: false,
        appointmentCount: 1,
        lastInteraction: new Date(),
      };
      addClient(newClient);
      existingClient = newClient;
      toast.success(`${clientName} added to clients`);
    }

    setSearchQuery(existingClient.displayName);
    setShowClientSuggestions(false);
  };

  // Chat View
  if (view === 'chat' && activeChatId) {
    return (
      <CounselorChat
        chatId={activeChatId}
        onClose={handleChatClose}
        onBack={() => {
          handleChatClose();
          setView('overview');
        }}
      />
    );
  }

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border shadow-sm"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-coral to-coral/70 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold">WellMind Counsellor</h1>
              <p className="text-xs text-muted-foreground">{currentUser?.counselorName}</p>
            </div>
          </motion.div>

          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main
        className="max-w-7xl mx-auto px-6 py-8"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)' }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Navigation Tabs */}
          <div className="flex gap-4 flex-wrap">
            {[
              { id: 'overview', label: 'Overview', icon: Users },
              { id: 'clients', label: 'Clients', icon: Users },
              { id: 'appointments', label: 'Appointments', icon: Calendar },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(({ id, label, icon: Icon }) => (
              <motion.button
                key={id}
                onClick={() => setView(id as DashboardView)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  view === id
                    ? 'bg-coral text-white shadow-lg'
                    : 'bg-card border border-border hover:bg-muted'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </motion.button>
            ))}
          </div>

          {/* Overview */}
          {view === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">Dashboard Overview</h2>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-card rounded-xl p-6 border border-border hover:border-coral/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Total Clients</p>
                      <p className="text-3xl font-bold mt-1">{totalClientsCount}</p>
                    </div>
                    <Users className="w-8 h-8 text-coral/60" />
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-card rounded-xl p-6 border border-border hover:border-green-500/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Active Sessions</p>
                      <p className="text-3xl font-bold mt-1">{activeSessions.length}</p>
                    </div>
                    <MessageCircle className="w-8 h-8 text-green-500/60" />
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-card rounded-xl p-6 border border-border hover:border-blue-500/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Upcoming Appointments</p>
                      <p className="text-3xl font-bold mt-1">{upcomingAppointmentsCount}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-500/60" />
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-card rounded-xl p-6 border border-border hover:border-sage/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Specializations</p>
                      <p className="text-3xl font-bold mt-1">{currentUser?.specialization?.length || 0}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-sage/70" />
                  </div>
                </motion.div>
              </div>

              {/* Active Sessions */}
              {activeSessions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card rounded-xl p-6 border border-green-500/30"
                >
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Active Sessions Now
                  </h3>
                  <div className="space-y-3">
                    {activeSessions.map((session) => (
                      <motion.button
                        key={session.id}
                        onClick={() => handleChatSelect(session.id)}
                        whileHover={{ x: 4 }}
                        className="w-full flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-left"
                      >
                        <div>
                          <p className="font-medium">{session.clientName}</p>
                          <p className="text-xs text-muted-foreground">
                            {session.type === 'video' ? '📹 Video' : '💬 Chat'} Session
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Appointments shortcut */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-xl p-6 border border-blue-500/30"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-500" />
                      Appointments
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Manage all upcoming and past appointments in one place.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setView('appointments')}
                    className="w-full sm:w-auto"
                  >
                    View all appointments
                  </Button>
                </div>
              </motion.div>

              {/* Recent Chat Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-xl p-6 border border-border"
              >
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-coral" />
                  Recent Chat Activity
                </h3>
                <div className="space-y-3">
                  {[
                    { client: 'Sarah Johnson', message: 'Thank you for the helpful session today!', time: '2 hours ago', status: 'completed' },
                    { client: 'Michael Chen', message: 'Can we reschedule next week?', time: '4 hours ago', status: 'pending' },
                    { client: 'Emma Davis', message: 'I feel much better after our last session', time: '1 day ago', status: 'completed' },
                    { client: 'John Smith', message: 'Looking forward to our next appointment', time: '2 days ago', status: 'completed' },
                  ].map((activity, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ x: activity.client === 'Sarah Johnson' ? 4 : 0 }}
                      onClick={() => handleRecentActivityClick(activity.client)}
                      className={`p-4 bg-muted rounded-lg border border-border transition-colors ${
                        activity.client === 'Sarah Johnson'
                          ? 'hover:border-coral/50 cursor-pointer'
                          : 'cursor-default'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral to-coral/70 flex items-center justify-center text-xs font-bold">
                              {activity.client[0]}
                            </div>
                            <p className="font-medium text-sm">{activity.client}</p>
                          </div>
                          <p className="text-sm text-muted-foreground ml-10">{activity.message}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                            activity.status === 'completed'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {activity.status}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Clients List */}
          {view === 'clients' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 max-w-4xl mx-auto w-full"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Clients</h2>
                <Button className="bg-coral hover:bg-coral/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Client
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchQuery}
                  onFocus={() => setShowClientSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowClientSuggestions(false), 150)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-card border border-border focus:border-coral outline-none"
                />
                {showClientSuggestions && matchingClientSuggestions.length > 0 && (
                  <div className="absolute z-10 mt-2 w-full rounded-lg border border-border bg-card shadow-lg overflow-hidden">
                    {matchingClientSuggestions.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onMouseDown={() => handleSuggestedClientClick(name)}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-muted transition-colors"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {clients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-muted-foreground">No clients yet</p>
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                  <p className="text-muted-foreground">No clients match your search</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredClients.map((client) => (
                    <motion.div
                      key={client.id}
                      whileHover={{ scale: 1.01 }}
                      className="bg-card rounded-xl p-4 border border-border hover:border-coral/50"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral to-coral/70 flex items-center justify-center shrink-0">
                            {client.isAnonymous ? '?' : client.displayName[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{client.displayName}</p>
                            <p className="text-sm text-muted-foreground">
                              {client.appointmentCount} appointment{client.appointmentCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:justify-end flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleJoinSession(client.id, 'chat')}
                          >
                            Start Chat
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleJoinSession(client.id, 'video')}
                          >
                            Start Video
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClient(client.id, client.displayName)}
                            className="text-muted-foreground hover:text-red-500"
                            aria-label={`Delete ${client.displayName}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Appointments */}
          {view === 'appointments' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">Appointments</h2>

              <div className="grid gap-4">
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-12 bg-card rounded-xl border border-border">
                    <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-muted-foreground">No upcoming appointments</p>
                  </div>
                ) : (
                  upcomingAppointments.map((apt) => {
                    const appointmentClientName =
                      clients.find((c) => c.id === apt.peerId)?.displayName ||
                      (apt.peerId === 'mock-peer-sarah' ? 'Sarah Johnson' : 'Client');

                    return (
                      <motion.div
                        key={apt.id}
                        whileHover={{ y: -2 }}
                        className="bg-card rounded-xl p-5 border border-border hover:border-coral/50 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-coral/20 flex items-center justify-center text-xs font-semibold text-coral">
                                {appointmentClientName[0]}
                              </div>
                              <p className="font-semibold text-base">{appointmentClientName}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                {new Date(apt.appointmentDate).toLocaleDateString()}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {apt.slot}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                                {apt.consultationType === 'video' ? '📹 Video' : '💬 Chat'}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                              apt.status === 'confirmed'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-coral hover:bg-coral/90"
                            onClick={() => handleJoinSession(apt.peerId, apt.consultationType)}
                          >
                            {apt.consultationType === 'video' ? 'Join Video Session' : 'Join Chat Session'}
                          </Button>
                          <Button size="sm" variant="outline">
                            Reschedule
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}

          {/* Settings */}
          {view === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">Professional Settings</h2>

              {/* Basic Information */}
              <motion.div className="bg-card rounded-xl p-6 border border-border space-y-4">
                <h3 className="text-lg font-semibold text-coral">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                      Professional Name
                    </label>
                    <input
                      type="text"
                      value={currentUser?.counselorName || ''}
                      readOnly
                      className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={currentUser?.email || ''}
                      readOnly
                      className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Professional Bio
                  </label>
                  <textarea
                    value={currentUser?.bio || ''}
                    readOnly
                    className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground resize-none"
                    rows={4}
                  />
                </div>
              </motion.div>

              {/* License & Credentials */}
              <motion.div className="bg-card rounded-xl p-6 border border-border space-y-4">
                <h3 className="text-lg font-semibold text-coral">License & Credentials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                      License Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., LIC-2024-001234"
                      className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground placeholder-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                      License Type
                    </label>
                    <select className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground">
                      <option>Licensed Professional Counselor (LPC)</option>
                      <option>Licensed Clinical Social Worker (LCSW)</option>
                      <option>Psychologist (PhD/PsyD)</option>
                      <option>Marriage and Family Therapist (LMFT)</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                      License Expiration Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 10"
                      className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground placeholder-muted-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Certifications & Degrees
                  </label>
                  <textarea
                    placeholder="e.g., MA in Clinical Counseling, Certified Trauma Specialist, etc."
                    className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground placeholder-muted-foreground resize-none"
                    rows={3}
                  />
                </div>
              </motion.div>

              {/* Specializations & Methods */}
              <motion.div className="bg-card rounded-xl p-6 border border-border space-y-4">
                <h3 className="text-lg font-semibold text-coral">Specializations & Methods</h3>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Areas of Specialization
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {currentUser?.specialization?.map((spec) => (
                      <span
                        key={spec}
                        className="px-3 py-1 bg-coral/20 text-coral rounded-full text-sm"
                      >
                        {spec} ✓
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Specializations set during registration</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Treatment Methods & Approaches
                  </label>
                  <textarea
                    placeholder="e.g., Cognitive Behavioral Therapy (CBT), Mindfulness-Based Stress Reduction, etc."
                    className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground placeholder-muted-foreground resize-none"
                    rows={3}
                  />
                </div>
              </motion.div>

              {/* Contact & Business */}
              <motion.div className="bg-card rounded-xl p-6 border border-border space-y-4">
                <h3 className="text-lg font-semibold text-coral">Contact & Business Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground placeholder-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                      Office Location
                    </label>
                    <input
                      type="text"
                      placeholder="City, State"
                      className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground placeholder-muted-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Professional Website
                  </label>
                  <input
                    type="url"
                    placeholder="https://yourwebsite.com"
                    className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground placeholder-muted-foreground"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                      Session Rate (USD)
                    </label>
                    <input
                      type="number"
                      placeholder="100"
                      className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground placeholder-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                      Languages Spoken
                    </label>
                    <input
                      type="text"
                      placeholder="English, Spanish, Mandarin"
                      className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground placeholder-muted-foreground"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Insurance & Acceptance */}
              <motion.div className="bg-card rounded-xl p-6 border border-border space-y-4">
                <h3 className="text-lg font-semibold text-coral">Insurance & Payment</h3>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Insurance Providers Accepted
                  </label>
                  <textarea
                    placeholder="e.g., Blue Cross, Aetna, United Healthcare, etc."
                    className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground placeholder-muted-foreground resize-none"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground block">
                    Payment Methods
                  </label>
                  <div className="space-y-2">
                    {['Credit Card', 'Insurance', 'Cash/Check', 'Payment Plans'].map((method) => (
                      <label key={method} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded" defaultChecked />
                        <span className="text-sm text-foreground">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Verification Status */}
              <motion.div className="bg-card rounded-xl p-6 border border-border space-y-4">
                <h3 className="text-lg font-semibold text-coral">Account Status</h3>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Verification Status</p>
                    <p className={`text-sm font-medium mt-1 ${
                      currentUser?.isVerified
                        ? 'text-green-400'
                        : 'text-amber-400'
                    }`}>
                      {currentUser?.isVerified ? '✓ Verified Professional' : '⏳ Pending Admin Verification'}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    currentUser?.isVerified
                      ? 'bg-green-400'
                      : 'bg-amber-400'
                  }`}></div>
                </div>
              </motion.div>

              <div className="flex gap-3 pt-4">
                <Button className="flex-1 bg-coral hover:bg-coral/90">
                  Save Changes
                </Button>
                <Button variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default CounselorDashboard;
