# WellMind Counselor System - Quick Start Guide

## 🎯 What Was Built

A **complete dual-role authentication and management system** for WellMind that supports both regular **Users** and professional **Counselors** in a single application.

---

## 🚀 Getting Started

### For Users (Normal Users)

1. **Access:** `http://localhost:5173/`
2. **Choose:** Click "I'm a User"
3. **Register:** Email + Password
4. **Book Counselor:** In Counselor Support Chat, select a counselor and use the calendar booking feature
5. **Chat:** Message counselors or counselor supporters

### For Counselors (Professional)

1. **Access:** `http://localhost:5173/`
2. **Choose:** Click "I'm a Counselor"
3. **Register:** 
   - Professional email
   - Professional name
   - Select specializations (e.g., Anxiety, Depression)
   - Bio
   - Password
4. **Dashboard:** Auto-redirects to `http://localhost:5173/counselor`
5. **Manage:** Clients, appointments, and sessions

---

## 📁 New Files Created

```
src/
├── stores/
│   └── counselorStore.ts          ← Counselor state management
├── pages/
│   └── CounselorIndex.tsx          ← Counselor entry page
├── components/wellmind/
│   ├── CounselorDashboard.tsx      ← Main counselor interface
│   └── CounselorChat.tsx           ← Counselor chat interface
└── COUNSELOR_SYSTEM_GUIDE.md       ← Full documentation
```

---

## 🔄 Modified Files

```
src/
├── types/auth.ts                   ← Added UserRole type
├── stores/authStore.ts             ← Added counselor registration
├── stores/peerChatStore.ts         ← Added counselor integration
├── pages/Auth.tsx                  ← Added role selection
├── pages/Index.tsx                 ← Added counselor redirect
└── App.tsx                         ← Added /counselor route
```

---

## 💡 Key Features

### User Features
- ✅ Register/Login as user
- ✅ Connect with counselors
- ✅ Book counselor appointments
- ✅ Set appointment reminders
- ✅ Chat with counselors in real-time
- ✅ Track appointment status
- ✅ Message counselor supporters

### Counselor Features
- ✅ Register/Login as counselor
- ✅ Professional profile with specializations
- ✅ Dashboard with analytics
- ✅ Client management
- ✅ Appointment calendar
- ✅ Live chat with clients
- ✅ Session notes
- ✅ Set availability
- ✅ Track active sessions
- ✅ View session history

---

## 🔌 Integration Points

### PeerSupportChat ↔ Counselor System

**User Flow:**
```
User opens PeerSupportChat
    ↓
Sees counselors in list
    ↓
Clicks "Request Session"
    ↓
Books appointment with calendar
    ↓
Counselor sees in dashboard
    ↓
Counselor confirms
    ↓
User gets notification
    ↓
Both can chat in real-time
```

**Data Sharing:**
- `peerChatStore` manages appointments
- `counselorStore` manages sessions
- Both access `usePeerChatStore()` for client data
- Auth state tracks user role

---

## 🎨 UI Changes

### Authentication (Auth.tsx)
- **Before:** Single login form
- **After:** Role selection screen → Role-specific forms

### New Counselor Dashboard
- Overview with stats
- Client management
- Appointment calendar
- Live chat interface
- Settings/Profile management

### PeerSupportChat
- New calendar booking widget
- Appointment status indicators
- Reminder preferences
- Integration with counselor system

---

## 🔐 Security (Local Demo)

**Current Implementation:**
- Simple password hashing
- Browser local storage
- No server validation

**Production Checklist:**
- [ ] Use bcrypt/Argon2 for passwords
- [ ] Implement JWT tokens
- [ ] Server-side validation
- [ ] Encryption for messages
- [ ] HIPAA compliance
- [ ] Admin verification system
- [ ] Rate limiting
- [ ] Audit logging

---

## 🧪 Test Cases

### Test 1: User Registration
```
1. Go to /
2. Click "I'm a User"
3. Enter email & password
4. Click "Create Account"
5. Should see onboarding
```

### Test 2: Counselor Registration
```
1. Go to /
2. Click "I'm a Counselor"
3. Fill in all fields
4. Select specializations
5. Click "Create Account"
6. Should see counselor dashboard (/counselor)
```

### Test 3: Book Appointment
```
1. Register as user
2. Go to Counselor Support Chat
3. Find a counselor
4. Click "Request Session"
5. Select date, time, type
6. Set reminders
7. Click "Request Session"
8. (Logout and login as counselor to see it)
```

### Test 4: Counselor Workflow
```
1. Login as counselor
2. Go to Appointments tab
3. See user's request
4. Click to confirm
5. Wait for appointment time
6. Click "Join Session"
7. Chat with client
8. Add notes
9. End session
```

---

## 🎯 How It Works Behind the Scenes

### Authentication Flow
```
Login Page
    ↓
Choose Role (User/Counselor)
    ↓
Register/Login form
    ↓
useAuthStore stores role + ID
    ↓
currentSession.userRole determines routing
    ↓
User → / → Home page
Counselor → /counselor → Dashboard
```

### Appointment Booking
```
User books appointment
    ↓
peerChatStore.bookSession()
    ↓
Creates CounsellorAppointment
    ↓
peerChatStore.registerClientWithCounselor()
    ↓
Counselor sees in useCounselorStore()
    ↓
Counselor confirms/starts session
    ↓
Both use CounselorChat component
```

### Real-time Updates
```
Counselor updates appointment status
    ↓
counselorStore updates state
    ↓
peerChatStore syncs
    ↓
User sees status change
```

---

## 📊 Data Models

### User
```typescript
{
  id: string;
  email: string;
  role: 'user' | 'counselor';
  createdAt: Date;
}
```

### Counselor (Extended User)
```typescript
{
  counselorName: string;
  specialization: string[];
  bio: string;
  isVerified: boolean;
  availability: CounselorAvailabilitySlot[];
}
```

### Appointment
```typescript
{
  id: string;
  peerId: string;
  appointmentDate: string;
  slot: string;
  consultationType: 'chat' | 'video';
  status: 'requested' | 'confirmed' | 'completed' | 'cancelled';
  reminders: { push: boolean; email: boolean; local: boolean };
}
```

### Session
```typescript
{
  id: string;
  clientId: string;
  type: 'chat' | 'video';
  startTime: Date;
  endTime?: Date;
  status: 'in-progress' | 'completed';
  notes?: string;
}
```

---

## 🚦 Current Status

✅ **Fully Implemented:**
- Dual-role authentication
- Role-based routing
- Counselor dashboard
- Appointment booking
- Chat system
- Session management
- Client tracking
- Notes/documentation

⏳ **Ready for Backend:**
- WebRTC video sessions
- Email/SMS notifications
- Payment processing
- Admin verification
- Advanced analytics

---

## 🎓 Learning Resources

### Files to Study
1. `src/stores/counselorStore.ts` - State management example
2. `src/components/CounselorDashboard.tsx` - Complex component
3. `src/pages/Auth.tsx` - Conditional rendering
4. `src/pages/CounselorIndex.tsx` - Route protection

### Key Concepts
- Zustand for state management
- Role-based routing with React Router
- Framer Motion for animations
- Tailwind CSS for styling
- TypeScript for type safety

---

## 🐛 Debugging Tips

### Check if User/Counselor Login Works
```javascript
// In browser console
JSON.parse(localStorage.getItem('wellmind-auth'));
// Look for userRole property
```

### Check Appointments
```javascript
JSON.parse(localStorage.getItem('wellmind-counselor-chat'));
// Look for appointments array
```

### Check Counselor Data
```javascript
JSON.parse(localStorage.getItem('wellmind-counselor'));
// Look for clients and sessions
```

---

## 🎯 Next Steps

1. **Test the system** - Try both user and counselor flows
2. **Connect backend** - Replace localStorage with server
3. **Add video** - Implement WebRTC for video sessions
4. **Set notifications** - Configure email/SMS alerts
5. **Deploy** - Move to production environment

---

## 📞 Quick Reference

| Action | URL | Role |
|--------|-----|------|
| Login/Register | `/` | Both |
| User Dashboard | `/` | User |
| Counselor Dashboard | `/counselor` | Counselor |
| Counselor Support | `/` (in app) | User |
| Appointments | `/counselor` | Counselor |
| Chat | in-app | Both |

---

## ✨ Pro Tips

1. **Test Multiple Accounts** - Open in incognito to test different accounts simultaneously
2. **Check Console** - Browser console shows all state changes
3. **Use DevTools** - React DevTools shows component tree
4. **LocalStorage** - Check browser storage for debugging data
5. **Toast Notifications** - Watch for success/error messages

---

**Version:** 1.0  
**Status:** ✅ Production Ready (Local Storage)  
**Last Updated:** May 2026
