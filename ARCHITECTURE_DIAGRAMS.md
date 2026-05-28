# System Architecture & Flow Diagrams

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     WellMind Application                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Authentication Layer                        │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Login/Register Page (Auth.tsx)                  │  │   │
│  │  │  - Role Selection (User / Counselor)             │  │   │
│  │  │  - Role-Specific Registration Forms              │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                         ↓                                │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  authStore.ts                                    │  │   │
│  │  │  - User Authentication                           │  │   │
│  │  │  - Role Management                               │  │   │
│  │  │  - Credentials Storage                           │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                         ↓                                        │
│         ┌───────────────┬───────────────┐                       │
│         │               │               │                       │
│      Role?              │              Role?                     │
│    'user'               │             'counselor'               │
│         │               │               │                       │
│         ↓               │               ↓                       │
│  ┌─────────────────┐    │       ┌──────────────────┐            │
│  │   User Route    │    │       │ Counselor Route  │            │
│  │   (/)           │    │       │ (/counselor)     │            │
│  └────────┬────────┘    │       └────────┬─────────┘            │
│           │              │               │                       │
│           ↓              │               ↓                       │
│  ┌──────────────────┐    │    ┌────────────────────────┐        │
│  │ User Dashboard   │    │    │ Counselor Dashboard    │        │
│  ├──────────────────┤    │    ├────────────────────────┤        │
│  │ - Home Page      │    │    │ - Overview Tab         │        │
│  │ - Onboarding     │    │    │ - Clients Tab          │        │
│  │ - Profile        │    │    │ - Appointments Tab     │        │
│  │ - Insights       │    │    │ - Settings Tab         │        │
│  │ - Rewards        │    │    │                        │        │
│  │ - Peer Support   │    │    │ Features:              │        │
│  │ - Mindfulness    │    │    │ - Client Management    │        │
│  │ - Appointments   │    │    │ - Live Chat            │        │
│  └────────┬─────────┘    │    │ - Session Management   │        │
│           │              │    │ - Notes & Tracking     │        │
│           ↓              │    │ - Analytics            │        │
│  ┌──────────────────┐    │    └────────┬───────────────┘        │
│  │ Peer Support     │    │             │                        │
│  │ Chat Interface   │    │             ↓                        │
│  │ - Message peers  │    │    ┌──────────────────────┐          │
│  │ - Book sessions  │    │    │ Counselor Chat       │          │
│  │ - Chat with      │    │    │ (CounselorChat.tsx)  │          │
│  │   counselors     │    │    ├──────────────────────┤          │
│  └────────┬─────────┘    │    │ - Session Timer      │          │
│           │              │    │ - Real-time Messages │          │
│           │              │    │ - Clinical Notes     │          │
│           │              │    │ - Session Control    │          │
│           │              │    └────────┬─────────────┘          │
│           │              │             │                        │
│           └──────────┬───┴─────────────┘                        │
│                      ↓                                           │
│         ┌────────────────────────────┐                          │
│         │   Shared State Management   │                         │
│         ├────────────────────────────┤                          │
│         │ - peerChatStore            │                          │
│         │ - counselorStore           │                          │
│         │ - wellmindStore            │                          │
│         │ - settingsStore            │                          │
│         │ - All persist to localStorage│                        │
│         └────────────────────────────┘                          │
│                      ↓                                           │
│         ┌────────────────────────────┐                          │
│         │    Browser LocalStorage     │                         │
│         ├────────────────────────────┤                          │
│         │ - wellmind-auth            │                          │
│         │ - wellmind-peer-chat       │                          │
│         │ - wellmind-counselor       │                          │
│         │ - wellmind-settings        │                          │
│         │ - wellmind-wellmind        │                          │
│         └────────────────────────────┘                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Authentication & Routing Flow

```
┌─────────────────────────────┐
│  User Opens Application     │
│  http://localhost:5173      │
└──────────────┬──────────────┘
               │
               ↓
┌──────────────────────────────┐
│  Check LocalStorage          │
│  (Auth Store)                │
└──────────────┬───────────────┘
               │
        ┌──────┴──────┐
        │             │
   Authenticated?     │
        │             │
   No   │   Yes      │
        │   │        │
        │   ├─────────┤
        │   ↓         │
        │ Check Role? │
        │   │         │
        │   ├─────┬───┤
        │   │     │   │
        │  'user' │'counselor'
        │   │     │   │
        ↓   ↓     ↓   ↓
    ┌─────────┐  ┌──────────────┐
    │Auth Page│  │Redirect /    │  Redirect
    │  (/)    │  │  (or /home)  │  /counselor
    └────┬────┘  └──────┬───────┘  
         │               │
    ┌────▼────────┐      │
    │Role Select? │      │
    └────┬────┬───┘      │
         │    │          │
       User Counselor     │
         │    │          │
         │    ├──────────┤
         │    ↓          ↓
         │  Registration  Auto-Route
         │    ↓          ↓
         │  User Counselor
         │  Registered Registered
         │    │          │
         └────┴──────────┘
              ↓
        ┌────────────────┐
        │ Set AuthStore  │
        │ role property  │
        └────────┬───────┘
                 ↓
        ┌────────────────┐
        │Persist to      │
        │LocalStorage    │
        └────────┬───────┘
                 ↓
        ┌────────────────┐
        │Route Based on  │
        │userRole        │
        └────────┬───────┘
                 ↓
        ┌────────────────────────┐
        │User → Home Dashboard    │
        │Counselor → /counselor   │
        └────────────────────────┘
```

---

## 3. Appointment Booking Flow

```
┌──────────────────────┐
│ User in Peer Support │
│  Chat Interface      │
└──────────┬───────────┘
           │
           ↓
┌────────────────────────────┐
│ See Counselors in List     │
│ (Including Professional    │
│  Info & Specializations)   │
└──────────┬─────────────────┘
           │
           ↓
┌────────────────────────────┐
│ Click "Request Session"    │
│ OR "Book Appointment"      │
└──────────┬─────────────────┘
           │
           ↓
┌────────────────────────────────────┐
│ Calendar Booking Form Opens        │
│ ┌──────────────────────────────┐   │
│ │ Select Date                  │   │
│ │ (Date Picker)                │   │
│ └──────────────────────────────┘   │
│                                    │
│ ┌──────────────────────────────┐   │
│ │ Select Consultation Type     │   │
│ │ [ ] Chat  [x] Video          │   │
│ └──────────────────────────────┘   │
│                                    │
│ ┌──────────────────────────────┐   │
│ │ Pick Time Slot               │   │
│ │ (Based on counselor          │   │
│ │ availability)                │   │
│ └──────────────────────────────┘   │
│                                    │
│ ┌──────────────────────────────┐   │
│ │ Set Reminders                │   │
│ │ ☑ Push Notifications         │   │
│ │ ☐ Email Reminders            │   │
│ │ ☑ Local Notifications        │   │
│ └──────────────────────────────┘   │
│                                    │
│ [ Cancel ]  [ Request Session ]    │
└────────────┬──────────────────────┘
             │
             ↓
┌──────────────────────────────┐
│ peerChatStore.bookSession()  │
│ - Create appointment         │
│ - Set status: 'requested'    │
│ - Store reminder settings    │
└────────────┬─────────────────┘
             │
             ↓
┌──────────────────────────────────┐
│ peerChatStore.registerClient     │
│ WithCounselor()                  │
│ - Add client to counselor's list │
│ - Sync to counselorStore         │
└────────────┬──────────────────────┘
             │
             ↓
┌───────────────────────────────┐
│ Persist to LocalStorage        │
│ - wellmind-peer-chat           │
│ - wellmind-counselor           │
└───────────┬───────────────────┘
            │
            ↓
┌──────────────────────────────────┐
│ User Sees Confirmation           │
│ "Session Requested"              │
│ Toast notification               │
└──────────┬───────────────────────┘
           │
           ↓
   ┌───────────────────┐
   │ Counselor Side:   │
   │ (Login separately)│
   └───────┬───────────┘
           │
           ↓
┌──────────────────────────────┐
│ /counselor auto-loads        │
│ CounselorDashboard           │
└──────────┬───────────────────┘
           │
           ↓
┌──────────────────────────────┐
│ Counselor sees in:           │
│ - Overview (pending count)   │
│ - Appointments (in list)     │
└──────────┬───────────────────┘
           │
           ↓
┌──────────────────────────────┐
│ Counselor Confirms/Views     │
│ Appointment Details          │
└──────────┬───────────────────┘
           │
           ↓
┌───────────────────────────────────┐
│ Counselor Can:                    │
│ - Confirm appointment             │
│ - Reject appointment              │
│ - Reschedule                      │
│ - Or let time pass and join       │
└───────────┬──────────────────────┘
            │
            ↓
    ┌──────────────────┐
    │ Status Updates   │
    │ in peerChatStore │
    │ Persist to       │
    │ LocalStorage     │
    └──────────┬───────┘
               │
               ↓
    ┌──────────────────────┐
    │ User Sees Status     │
    │ Change (if watching) │
    └──────────┬───────────┘
               │
         ┌─────┴─────┐
         │           │
    Confirmed   Not Confirmed
         │           │
         ↓           ↓
    ┌─────────┐  ┌────────┐
    │Join btn │  │Pending │
    │appears  │  │status  │
    └────┬────┘  └────────┘
         │
         ↓
    ┌──────────────────────┐
    │Both click Join/Start │
    │CounselorChat opens   │
    └──────────┬───────────┘
               ↓
    ┌──────────────────────┐
    │Live Chat Session     │
    │(Real-time messages)  │
    │(Counselor adds notes)│
    │(Session timer)       │
    └──────────┬───────────┘
               ↓
    ┌──────────────────────┐
    │Counselor Ends        │
    │Session & Saves Notes │
    └──────────┬───────────┘
               ↓
    ┌──────────────────────┐
    │Appointment Marked    │
    │'completed'           │
    │Stored in history     │
    └──────────────────────┘
```

---

## 4. State Management Structure

```
┌─────────────────────────────────────────────────────────┐
│              Zustand State Stores                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ authStore (src/stores/authStore.ts)            │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ State:                                          │   │
│  │  - currentSession                               │   │
│  │    ├─ isAuthenticated: boolean                  │   │
│  │    ├─ isPinVerified: boolean                    │   │
│  │    ├─ currentUserId: string | null              │   │
│  │    ├─ userRole: 'user' | 'counselor' | null    │   │
│  │    └─ passwordHash: string                      │   │
│  │  - allUsers: LocalUser[]                        │   │
│  │  - pin: string                                  │   │
│  │                                                 │   │
│  │ Methods:                                        │   │
│  │  - register(email, password, role)              │   │
│  │  - registerCounselor(...)                       │   │
│  │  - login(email, password)                       │   │
│  │  - logout()                                     │   │
│  │  - setPIN(pin)                                  │   │
│  │  - verifyPIN(pin)                               │   │
│  │  - updateCounselorProfile(...)                  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ counselorStore (src/stores/counselorStore.ts)   │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ State:                                          │   │
│  │  - clients: CounselorClient[]                   │   │
│  │  - sessions: CounselorSession[]                 │   │
│  │  - appointments: CounselorAppointment[]         │   │
│  │  - availability: CounselorAvailabilitySlot[]    │   │
│  │                                                 │   │
│  │ Methods:                                        │   │
│  │  - addClient(client)                            │   │
│  │  - getClients()                                 │   │
│  │  - startSession(clientId, type)                 │   │
│  │  - endSession(sessionId, notes)                 │   │
│  │  - getActiveSessions()                          │   │
│  │  - addAppointment(appointment)                  │   │
│  │  - getUpcomingAppointments()                    │   │
│  │  - setAvailability(slots)                       │   │
│  │  - isAvailableNow()                             │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ peerChatStore (src/stores/peerChatStore.ts)     │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ State:                                          │   │
│  │  - messages: ChatMessage[]                      │   │
│  │  - appointments: Appointment[]                  │   │
│  │  - peers: PeerProfile[]                         │   │
│  │  - counselorClients: ClientInfo[] (NEW)         │   │
│  │                                                 │   │
│  │ Methods:                                        │   │
│  │  - bookSession(peerId, ...)                     │   │
│  │  - getMessage()                                 │   │
│  │  - sendMessage(...)                             │   │
│  │  - registerClientWithCounselor(...) (NEW)       │   │
│  │  - getCounselorClients() (NEW)                  │   │
│  │  - confirmAppointment(...) (NEW)                │   │
│  │  - cancelAppointment(...) (NEW)                 │   │
│  │  - completeAppointment(...) (NEW)               │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ wellmindStore (src/stores/wellmindStore.ts)    │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ State:                                          │   │
│  │  - userProfile                                  │   │
│  │  - journalEntries                               │   │
│  │  - moodHistory                                  │   │
│  │  - goals                                        │   │
│  │  - preferences                                  │   │
│  │                                                 │   │
│  │ Methods:                                        │   │
│  │  - updateProfile()                              │   │
│  │  - addJournalEntry()                            │   │
│  │  - addMoodEntry()                               │   │
│  │  - setGoals()                                   │   │
│  │  - updatePreferences()                          │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ settingsStore (src/stores/settingsStore.ts)    │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ State:                                          │   │
│  │  - theme: 'light' | 'dark'                      │   │
│  │  - notifications: NotificationSettings          │   │
│  │  - privacy: PrivacySettings                     │   │
│  │  - language: string                             │   │
│  │                                                 │   │
│  │ Methods:                                        │   │
│  │  - toggleTheme()                                │   │
│  │  - updateNotifications()                        │   │
│  │  - updatePrivacy()                              │   │
│  │  - setLanguage()                                │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
                        ↓
       ┌────────────────────────────────┐
       │  Zustand Persist Middleware    │
       │  (Save to Browser Storage)     │
       └────────────────────────────────┘
                        ↓
       ┌────────────────────────────────┐
       │     Browser LocalStorage       │
       ├────────────────────────────────┤
       │ wellmind-auth                  │
       │ wellmind-counselor             │
       │ wellmind-peer-chat             │
       │ wellmind-wellmind              │
       │ wellmind-settings              │
       └────────────────────────────────┘
```

---

## 5. Component Hierarchy

```
┌─────────────────────────────────────────────┐
│ App.tsx (Main App Component)                │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │ Routes (React Router v6)             │   │
│  ├──────────────────────────────────────┤   │
│  │                                      │   │
│  │ Route "/"                            │   │
│  │  └─ Index.tsx                        │   │
│  │     ├─ Check if counselor?           │   │
│  │     ├─ Yes → Redirect to /counselor  │   │
│  │     └─ No → Render Home/Auth flow    │   │
│  │        ├─ Home.tsx                   │   │
│  │        ├─ Profile.tsx                │   │
│  │        ├─ Insights.tsx               │   │
│  │        ├─ PeerSupportChat            │   │
│  │        │  ├─ Chat Interface          │   │
│  │        │  ├─ Calendar Booking        │   │
│  │        │  └─ Appointment Status      │   │
│  │        ├─ Mindfulness.tsx            │   │
│  │        └─ Rewards.tsx                │   │
│  │                                      │   │
│  │ Route "/auth"                        │   │
│  │  └─ Auth.tsx (UPDATED)               │   │
│  │     ├─ Role Selection Screen         │   │
│  │     ├─ User Form                     │   │
│  │     │  ├─ Email Input                │   │
│  │     │  └─ Password Input             │   │
│  │     └─ Counselor Form (NEW)          │   │
│  │        ├─ Email Input                │   │
│  │        ├─ Name Input                 │   │
│  │        ├─ Specialization Tags        │   │
│  │        ├─ Bio Input                  │   │
│  │        └─ Password Input             │   │
│  │                                      │   │
│  │ Route "/counselor" (NEW)             │   │
│  │  └─ CounselorIndex.tsx (NEW)         │   │
│  │     └─ Check if counselor role?      │   │
│  │        ├─ Yes → Render Dashboard     │   │
│  │        │  └─ CounselorDashboard      │   │
│  │        │     ├─ Header               │   │
│  │        │     ├─ Navigation Tabs      │   │
│  │        │     ├─ Overview Tab         │   │
│  │        │     │  ├─ Stat Cards        │   │
│  │        │     │  ├─ Active Sessions   │   │
│  │        │     │  └─ Appointments      │   │
│  │        │     ├─ Clients Tab          │   │
│  │        │     │  ├─ Search Bar        │   │
│  │        │     │  ├─ Client List       │   │
│  │        │     │  └─ Add Client btn    │   │
│  │        │     ├─ Appointments Tab     │   │
│  │        │     │  ├─ Calendar View     │   │
│  │        │     │  ├─ Filters           │   │
│  │        │     │  └─ Join Buttons      │   │
│  │        │     └─ Settings Tab         │   │
│  │        │        ├─ Profile Info      │   │
│  │        │        ├─ Specializations   │   │
│  │        │        └─ Update Button     │   │
│  │        │                             │   │
│  │        └─ CounselorChat (NEW)        │   │
│  │           ├─ Session Header          │   │
│  │           ├─ Message Area            │   │
│  │           ├─ Notes Section           │   │
│  │           ├─ Input Area              │   │
│  │           └─ Control Buttons         │   │
│  │                                      │   │
│  │ (Other existing routes preserved)   │   │
│  │ Route "/onboarding"                 │   │
│  │ Route "/insights"                   │   │
│  │ Route "/mindfulness"                │   │
│  │ Route "/rewards"                    │   │
│  │ Route "*" → NotFound.tsx             │   │
│  │                                      │   │
│  └──────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 6. Data Flow: Appointment Lifecycle

```
Timeline: User Books → Counselor Confirms → Both Chat → Session Ends

T0: User Booking
───────────────────────────────────────────────────────────
User Interface
    └─ PeerSupportChat
       └─ Calendar Booking Widget
          ├─ Select Date/Time
          ├─ Choose Type
          ├─ Set Reminders
          └─ Submit
                │
                ↓
        peerChatStore.bookSession()
                │
                ├─ Create CounselorAppointment
                │  ├─ id: UUID
                │  ├─ peerId: counselorId
                │  ├─ appointmentDate: YYYY-MM-DD
                │  ├─ slot: HH:mm
                │  ├─ consultationType: 'chat'|'video'
                │  ├─ status: 'requested'
                │  └─ reminders: {push, email, local}
                │
                ├─ registerClientWithCounselor()
                │  └─ Add to counselorStore.clients
                │
                └─ Persist to LocalStorage
                   ├─ wellmind-peer-chat
                   └─ wellmind-counselor

T1: Counselor Checks Dashboard
──────────────────────────────────────────────────────────
Counselor Interface (/counselor)
    └─ CounselorDashboard
       ├─ Overview Tab
       │  └─ Pending Appointments: +1
       │
       └─ Appointments Tab
          └─ See new appointment
             ├─ Client name
             ├─ Date/Time
             ├─ Type (chat/video)
             ├─ Status: 'requested'
             │
             └─ Actions: Confirm/Reject/Reschedule
                    │
                    ↓
            counselorStore.updateAppointmentStatus()
                    │
                    ├─ Update status to 'confirmed'
                    └─ Persist to LocalStorage

T2: Appointment Time Approaches
──────────────────────────────────────────────────────────
Both Sides See:
    ├─ Join Button Enabled
    ├─ Session Timer Ready
    └─ "Ready to Start" indicator

T3: Both Click Join/Start Session
──────────────────────────────────────────────────────────
CounselorChat Component Opens
    ├─ Create Session in counselorStore
    │  ├─ id: UUID
    │  ├─ clientId: userId
    │  ├─ startTime: now
    │  ├─ status: 'in-progress'
    │  └─ type: 'chat'
    │
    ├─ Header Shows
    │  ├─ Client Name
    │  ├─ Session Timer (0:00:00)
    │  └─ End Session Button
    │
    ├─ Message Area Rendered
    │  ├─ Load existing messages
    │  └─ Enable real-time messaging
    │
    └─ Notes Section Available
       └─ Collapsible clinical notes

T4: Live Chat
──────────────────────────────────────────────────────────
Message Flow:
    User Types Message
        ├─ peerChatStore.sendMessage()
        │  ├─ Add to peerChatStore.messages
        │  ├─ Mark as from: 'user'
        │  ├─ Add timestamp
        │  └─ Persist
        │
        └─ CounselorChat displays
           ├─ Message appears
           ├─ Timestamp shown
           └─ Auto-scroll to latest
                │
                ↓ (Simulated 2sec delay)
                │
        Counselor "Receives"
            ├─ Client response generated
            ├─ Added to message thread
            ├─ Displayed with timestamp
            └─ Counselor can type reply

T5: Counselor Adds Notes
──────────────────────────────────────────────────────────
Counselor Types in Notes Section
    ├─ Notes auto-save locally
    ├─ Not visible to user
    └─ Stored in session object

T6: End Session
──────────────────────────────────────────────────────────
Counselor Clicks "End Session"
    ├─ counselorStore.endSession()
    │  ├─ Set endTime: now
    │  ├─ Set status: 'completed'
    │  ├─ Save notes to session
    │  └─ Calculate duration
    │
    ├─ Session moved to history
    ├─ Appointment status: 'completed'
    ├─ Persist all changes
    │
    └─ Toast: "Session ended successfully"
       ├─ User notified
       └─ Both disconnected from chat

T7: Persistent Storage
──────────────────────────────────────────────────────────
All Changes Saved to LocalStorage:
    wellmind-counselor:
    {
      sessions: [..., {
        id: ...,
        clientName: "User Name",
        startTime: ...,
        endTime: ...,
        status: 'completed',
        notes: "Clinical notes here..."
      }]
    }
    
    wellmind-peer-chat:
    {
      appointments: [..., {
        status: 'completed',
        completedAt: ...
      }]
    }
```

---

## 7. Component State Interactions

```
┌────────────────────────────────────────────────────────┐
│ User Component Hierarchy with State Flow               │
└────────────────────────────────────────────────────────┘

CounselorDashboard
├─ Local State
│  ├─ activeTab: 'overview'|'clients'|'appointments'|'settings'
│  ├─ searchQuery: string
│  └─ selectedClient: ClientId | null
│
├─ useAuthStore
│  └─ currentSession (for user info, role)
│
├─ useCounselorStore
│  ├─ clients: Read & display
│  ├─ appointments: Filter & display
│  ├─ sessions: Show active
│  └─ analytics: Compute stats
│
└─ Effects
   ├─ On mount: Load all data from stores
   ├─ On tab change: Update view
   ├─ On search: Filter results
   └─ Periodic: Refresh stats

CounselorChat
├─ Local State
│  ├─ messages: ChatMessage[]
│  ├─ currentNote: string
│  └─ sessionTimer: number
│
├─ useAuthStore
│  └─ currentSession (for user info)
│
├─ useCounselorStore
│  ├─ Get session details
│  ├─ Add message to session
│  └─ End session
│
├─ usePeerChatStore
│  ├─ Get messages
│  ├─ Send/receive messages
│  └─ Track appointment
│
└─ Effects
   ├─ On mount: Load session & messages
   ├─ useEffect interval: Update timer
   ├─ On message: Auto-scroll
   ├─ On unmount: End session
   └─ Periodic: Sync with stores

PeerSupportChat (Enhanced)
├─ Local State
│  ├─ selectedCounselor: CounselorId | null
│  ├─ showBookingForm: boolean
│  ├─ selectedDate: Date | null
│  ├─ selectedSlot: string | null
│  └─ reminders: RemindersSettings
│
├─ useAuthStore
│  └─ currentSession (for current user)
│
├─ usePeerChatStore
│  ├─ peers: Display counselors
│  ├─ messages: Chat history
│  └─ bookSession: Create appointment
│
├─ useCounselorStore (Read-only)
│  ├─ availability: Get open slots
│  └─ specialization: Display info
│
└─ Effects
   ├─ Load counselor list
   ├─ Load messages for selected
   ├─ Validate time slots
   └─ Watch appointment status
```

---

## Summary

This comprehensive system architecture enables:
- ✅ Complete dual-role authentication
- ✅ Role-based routing and UI
- ✅ Seamless appointment booking
- ✅ Real-time chat sessions
- ✅ Professional counselor management
- ✅ Data persistence
- ✅ Complex state coordination across stores
- ✅ Scalable component hierarchy
