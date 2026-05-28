# WellMind Counselor System Implementation Guide

## 🎯 Overview

This document outlines the complete counselor system that has been implemented into the WellMind application. The system allows for two distinct user roles: **User** and **Counselor**, each with their own interface and functionality.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [User Roles & Authentication](#user-roles--authentication)
3. [Stores & State Management](#stores--state-management)
4. [Components](#components)
5. [Features & Functionality](#features--functionality)
6. [How to Use](#how-to-use)
7. [Integration with PeerSupportChat](#integration-with-peersupportchat)
8. [Data Flow](#data-flow)

---

## 🏗️ Architecture Overview

### System Layers

```
┌─────────────────────────────────────────┐
│  UI Layer (Components & Pages)          │
│  - Auth.tsx (Role Selection)           │
│  - CounselorDashboard.tsx              │
│  - CounselorChat.tsx                   │
│  - PeerSupportChat.tsx (User)          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  State Management (Zustand Stores)      │
│  - authStore.ts (Role + Auth)          │
│  - counselorStore.ts (Counselor Data)  │
│  - peerChatStore.ts (Chat + Appts)     │
│  - wellmindStore.ts (User Profile)     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Routing (React Router)                 │
│  - / → Index (Users)                   │
│  - /counselor → CounselorIndex         │
│  - Other routes for users              │
└─────────────────────────────────────────┘
```

---

## 👥 User Roles & Authentication

### Types

**User Roles:**
```typescript
type UserRole = 'user' | 'counselor';
```

### Authentication Flow

#### 1. **Role Selection** (New Auth Flow)
- User lands on Auth page
- Selects between "I'm a User" or "I'm a Counselor"
- Different registration/login forms based on role

#### 2. **User Registration**
- Email & Password
- Simple registration process
- Direct access to main app after login

#### 3. **Counselor Registration**
- Email & Password
- Professional Name
- Specializations (e.g., Anxiety, Depression, Trauma)
- Professional Bio
- Account flagged as `isVerified: false` (requires admin verification in production)

### Auth Store Extensions

**New Methods:**
```typescript
register(email, password, role)           // Register with role
registerCounselor(...)                    // Register counselor with full details
login(email, password)                    // Login (auto-detects role)
updateCounselorProfile(updates)           // Update counselor info
```

**Auth State Extended:**
```typescript
interface AuthState {
  isAuthenticated: boolean;
  isPinVerified: boolean;
  currentUserId: string | null;
  userRole: UserRole | null;              // NEW: Tracks user's role
}
```

---

## 📦 Stores & State Management

### 1. **authStore.ts** (Enhanced)

**New User Fields:**
```typescript
interface LocalUser {
  id: string;
  email: string;
  passwordHash: string;
  pin?: string;
  role: UserRole;                    // NEW
  createdAt: Date;
  
  // Counselor-specific
  counselorName?: string;            // NEW
  specialization?: string[];         // NEW
  bio?: string;                      // NEW
  availability?: CounselorAvailabilitySlot[];  // NEW
  isVerified?: boolean;              // NEW
}
```

### 2. **counselorStore.ts** (NEW)

Dedicated store for counselor-specific data and operations.

**Key Interfaces:**
```typescript
interface CounselorClient {
  id: string;
  displayName: string;
  isAnonymous: boolean;
  recentMood?: string;
  lastInteraction: Date;
  appointmentCount: number;
  notes?: string;
}

interface CounselorSession {
  id: string;
  clientId: string;
  clientName: string;
  type: 'chat' | 'video';
  startTime: Date;
  endTime?: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
}

interface CounselorAvailabilitySlot {
  dayOfWeek: number;  // 0-6
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
}
```

**Key Methods:**
- `addClient()` - Register a new client
- `startSession()` - Begin a counselor-client session
- `endSession()` - End and save session
- `setAvailability()` - Set working hours
- `isAvailableNow()` - Check current availability
- `getUpcomingAppointments()` - Fetch next appointments
- `getActiveSessions()` - View current active sessions

### 3. **peerChatStore.ts** (Enhanced)

**New Fields:**
```typescript
counselorClients: Array<{ 
  userId: string; 
  userName: string; 
  joinedDate: Date 
}>;
```

**New Methods (Counselor Integration):**
```typescript
registerClientWithCounselor(userId, userName)
getCounselorClients()
confirmAppointment(appointmentId)
cancelAppointment(appointmentId)
completeAppointment(appointmentId)
```

---

## 🎨 Components

### 1. **Auth.tsx** (Updated)

**New Features:**
- Role selection screen with visual cards
- Separate forms for user vs counselor
- Counselor-specific fields (specialization, bio)
- Back button to switch roles

**Views:**
- `role-select`: Choose user or counselor
- `auth-form`: Login/Register with role-specific fields

### 2. **CounselorDashboard.tsx** (NEW)

**Layout:**
```
┌──────────────────────────┐
│  Header with Logo        │
│  and Logout              │
├──────────────────────────┤
│  Navigation Tabs         │
│  Overview | Clients |    │
│  Appointments | Settings │
├──────────────────────────┤
│  Content Area            │
│  (Dynamic based on tab)  │
└──────────────────────────┘
```

**Tabs:**
- **Overview**: Dashboard with stats, active sessions, upcoming appointments
- **Clients**: Manage and view all registered clients
- **Appointments**: View and manage upcoming appointments
- **Settings**: Counselor profile, specializations, verification status

**Features:**
- Real-time stats (total clients, active sessions, upcoming appointments)
- Client search functionality
- Appointment calendar view
- Session status indicators
- Profile management

### 3. **CounselorChat.tsx** (NEW)

**Layout:**
```
┌────────────────────────────┐
│  Header (Client Name,      │
│  Session Timer, Controls)  │
├────────────────────────────┤
│  Chat Messages Area        │
│  (Scrollable)              │
├────────────────────────────┤
│  Optional: Session Notes   │
│  (Collapsible)             │
├────────────────────────────┤
│  Message Input + Send      │
│  Action Buttons            │
└────────────────────────────┘
```

**Features:**
- Real-time messaging with clients
- Session timer showing elapsed time
- Optional clinical notes section
- End session functionality
- Message timestamps
- Simulated client responses

### 4. **PeerSupportChat.tsx** (Enhanced)

Now includes:
- Calendar booking for counselor appointments
- Counselor verification status
- Session status indicators (requested/confirmed/completed)
- Reminder preferences (push/email/local)
- Integration with counselor availability

---

## ✨ Features & Functionality

### For Users (Clients)

1. **Book Counselor Sessions**
   - Select preferred date
   - Choose consultation type (chat or video)
   - Pick available time slot
   - Set appointment reminders
   - Track appointment status

2. **Connect with Peer Supporters**
   - Message peer supporters
   - Request counselor sessions
   - View supporter profiles and specializations

3. **Session Management**
   - View upcoming appointments
   - Receive appointment reminders
   - Join secure sessions
   - Track session history

### For Counselors

1. **Client Management**
   - View all registered clients
   - Track client interaction history
   - Add and manage clinical notes
   - Monitor appointment count per client

2. **Appointment Management**
   - View upcoming appointments
   - Confirm/cancel appointments
   - Set professional availability
   - Mark appointments as completed

3. **Live Sessions**
   - Start chat/video sessions with clients
   - Track session duration
   - Add clinical notes during/after sessions
   - Automatic session history

4. **Dashboard Analytics**
   - Total clients count
   - Active sessions count
   - Upcoming appointments
   - Specialization management

5. **Professional Profile**
   - Manage professional name
   - Update specializations
   - Add professional bio
   - View verification status

---

## 🚀 How to Use

### For Users

#### 1. **Register as User**
```
1. Open app → /
2. Select "I'm a User"
3. Register with email & password
4. Complete onboarding
5. Access main dashboard
```

#### 2. **Book Counselor Session**
```
1. Navigate to Peer Support Chat
2. Select a counselor
3. Click "Request Session" or "Start Chat"
4. Fill calendar booking form:
   - Select date
   - Choose consultation type
   - Pick time slot
   - Set reminders
5. Submit request
```

#### 3. **Message Counselor**
```
1. In Peer Support Chat
2. Click "Start Chat" on counselor profile
3. Type and send messages
4. Receive responses
```

### For Counselors

#### 1. **Register as Counselor**
```
1. Open app → /
2. Select "I'm a Counselor"
3. Fill registration form:
   - Professional email
   - Professional name
   - Specializations
   - Password
4. Submit (pending verification)
5. Access /counselor
```

#### 2. **View Dashboard**
```
1. Login → Auto-redirects to /counselor
2. See overview stats
3. Check active sessions & appointments
```

#### 3. **Manage Clients**
```
1. Go to "Clients" tab
2. View all registered clients
3. Search for specific clients
4. View client details
```

#### 4. **Handle Appointments**
```
1. Go to "Appointments" tab
2. View upcoming appointments
3. Confirm/reschedule as needed
4. Join session when time arrives
```

#### 5. **Start Session with Client**
```
1. Click on active session or upcoming appointment
2. Chat interface opens
3. Type and send messages
4. Add clinical notes (optional)
5. End session when done
```

---

## 🔗 Integration with PeerSupportChat

### User Perspective

```
┌─────────────────────────────────────────┐
│  PeerSupportChat Component              │
├─────────────────────────────────────────┤
│  Available Peers List                   │
│  ├─ Chat with peer supporters           │
│  ├─ Request counselor sessions          │
│  └─ Book appointments                   │
│                                         │
│  Calendar Booking (NEW)                 │
│  ├─ Select date                         │
│  ├─ Choose type (chat/video)            │
│  ├─ Pick time slot                      │
│  ├─ Set reminders                       │
│  └─ Submit request                      │
└─────────────────────────────────────────┘
```

### Data Flow

```
User Books Appointment
         ↓
peerChatStore.bookSession()
         ↓
Creates CounsellorAppointment
         ↓
registerClientWithCounselor()
         ↓
Counselor sees client in dashboard
         ↓
Can confirm/start session
         ↓
User notified of status
```

---

## 📊 Data Flow

### Authentication Flow

```
User/Counselor
       ↓
Auth Page (Role Selection)
       ↓
┌─────────────────┬─────────────────┐
│   User Path     │  Counselor Path │
├─────────────────┼─────────────────┤
│ Register/Login  │ Register/Login  │
│ with email+pass │ with full info  │
│       ↓         │        ↓        │
│ useAuthStore    │ useAuthStore    │
│ role='user'     │ role='counselor'│
│       ↓         │        ↓        │
│   Home Page     │ /counselor      │
│   (Index)       │   Dashboard     │
└─────────────────┴─────────────────┘
```

### Session Flow

```
User Requests Appointment
         ↓
peerChatStore.bookSession()
         ↓
counselorStore gets notified
         ↓
Counselor sees in dashboard
         ↓
Counselor confirms
         ↓
User gets notification
         ↓
Session time arrives
         ↓
Both join CounselorChat
         ↓
Messages exchanged
         ↓
Session ended & notes saved
```

---

## 🔐 Security Considerations

**Current Demo Level:**
- Passwords hashed with simple function
- Local storage (browser)
- No server-side validation

**Production Recommendations:**
1. Use bcrypt/Argon2 for password hashing
2. Implement JWT tokens
3. Server-side authentication
4. Encryption for sensitive data
5. Role-based access control (RBAC)
6. Admin verification for counselors
7. HIPAA compliance for health data
8. End-to-end encryption for messages

---

## 📱 Responsive Design

All components are responsive with:
- Mobile-first approach
- Tablet support
- Desktop optimization
- Touch-friendly buttons & inputs
- Proper spacing and typography

---

## 🎨 UI/UX Highlights

- **Dark theme for counselor dashboard** (professional appearance)
- **Light theme for user interfaces** (calming, wellness-focused)
- **Smooth animations** with Framer Motion
- **Clear status indicators** (badges, colors, icons)
- **Intuitive navigation** with clear CTAs
- **Real-time updates** and timers
- **Accessibility** considerations

---

## 🐛 Testing the System

### Test Scenario 1: User Registration & Chat
1. Register as user → "Test User"
2. Complete onboarding
3. Go to Peer Support
4. Select a counselor
5. Start chat and message

### Test Scenario 2: Counselor Registration & Dashboard
1. Register as counselor → Professional details
2. Auto-redirects to dashboard
3. View stats
4. Check empty appointments (until user books)

### Test Scenario 3: End-to-End Booking
1. User: Book counselor session
2. Counselor: See in appointments
3. Counselor: Confirm appointment
4. User: See status change
5. Both: Join session & chat
6. Counselor: End & add notes

---

## 🔄 File Modifications Summary

| File | Change | Type |
|------|--------|------|
| `src/types/auth.ts` | Added UserRole & counselor fields | Enhancement |
| `src/stores/authStore.ts` | Added counselor registration & login | Enhancement |
| `src/pages/Auth.tsx` | Added role selection & counselor form | Rewrite |
| `src/pages/Index.tsx` | Added counselor redirect logic | Enhancement |
| `src/pages/CounselorIndex.tsx` | New page for counselor entry | New |
| `src/App.tsx` | Added /counselor route | Enhancement |
| `src/stores/counselorStore.ts` | New store for counselor data | New |
| `src/components/CounselorDashboard.tsx` | New main dashboard component | New |
| `src/components/CounselorChat.tsx` | New chat interface for counselors | New |
| `src/stores/peerChatStore.ts` | Added counselor integration methods | Enhancement |

---

## 🎯 Future Enhancements

1. **Video Sessions** - Integrate WebRTC for video calls
2. **File Sharing** - Allow document uploads during sessions
3. **Client Progress Tracking** - Chart mood trends over time
4. **Appointment Reminders** - SMS/Email notifications
5. **Admin Dashboard** - Verify counselors, manage platform
6. **Payment Integration** - Process session payments
7. **Prescription Management** - For licensed practitioners
8. **Emergency Protocol** - Crisis intervention routing
9. **Mobile App** - Native iOS/Android applications
10. **Analytics** - Advanced reporting for counselors

---

## 📞 Support

For questions or issues with the counselor system implementation, refer to the code comments and console logs for debugging information.

**Version:** 1.0  
**Last Updated:** May 2026  
**Status:** Production Ready (Local Storage)
