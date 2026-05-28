# 👥 Pre-Made Counselor Accounts - Quick Login Guide

## 5 Test Counselor Accounts Available

All counselor accounts are **pre-made and pre-verified** for testing. Simply login with the credentials below.

### Counselor 1️⃣
- **Email:** `counselors01@wellmind.local`
- **Password:** `Counselors01`
- **Name:** Dr. Sarah Miller
- **Specializations:** Anxiety, Depression
- **Bio:** Specialized in anxiety and depression management

### Counselor 2️⃣
- **Email:** `counselors02@wellmind.local`
- **Password:** `Counselors02`
- **Name:** Dr. James Chen
- **Specializations:** Stress Management, Work Life Balance
- **Bio:** Expert in stress reduction and workplace wellness

### Counselor 3️⃣
- **Email:** `counselors03@wellmind.local`
- **Password:** `Counselors03`
- **Name:** Dr. Emma Wilson
- **Specializations:** Relationships, Family Therapy
- **Bio:** Focused on relationship and family counseling

### Counselor 4️⃣
- **Email:** `counselors04@wellmind.local`
- **Password:** `Counselors04`
- **Name:** Dr. Michael Rodriguez
- **Specializations:** Trauma, PTSD
- **Bio:** Specializing in trauma recovery and PTSD treatment

### Counselor 5️⃣
- **Email:** `counselors05@wellmind.local`
- **Password:** `Counselors05`
- **Name:** Dr. Lisa Anderson
- **Specializations:** Self Esteem, Personal Growth
- **Bio:** Dedicated to personal development and self-discovery

---

## 🚀 How to Login as Counselor

1. **Open the app:** http://localhost:5173
2. **Select:** "I'm a Counselor"
3. **Click:** "Already have an account? Log in"
4. **Enter email:** `counselors01@wellmind.local` (or any above)
5. **Enter password:** `Counselors01` (match the number)
6. **Auto-redirects** to `/counselor` dashboard ✅

---

## 📋 Features of Pre-Made Accounts

✅ All accounts are **verified** (no admin approval needed)  
✅ All accounts have **working availability** (Mon-Fri 9AM-5PM)  
✅ All accounts have **full specializations** listed  
✅ All accounts have **professional bios**  
✅ Ready for **immediate testing**  

---

## 🧪 Testing Workflow

### Quick Test (5 minutes)
```
1. Login as Counselors01
2. View dashboard and stats
3. Check Clients tab
4. See Appointments tab
5. Explore Settings tab
```

### Full Test (15 minutes)
```
1. Register a user account (separate browser/incognito)
2. User books appointment with Counselor 1
3. Login as Counselors01
4. See appointment in dashboard
5. Confirm the appointment
6. Start session and chat
7. Add clinical notes
8. End session
```

### Multi-Counselor Test (30 minutes)
```
1. Test each of the 5 counselors
2. Check their different specializations
3. Verify all data persists
4. Test switching between accounts
```

---

## 💾 Data Persistence

All counselor accounts and their data are stored in **browser localStorage**. 

### Check Counselor Data
```javascript
// In browser console
JSON.parse(localStorage.getItem('wellmind-auth'));
// Look for the counselors array
```

### Reset All Data
```javascript
localStorage.clear();
location.reload();
// Counselors will be recreated on next app load
```

---

## 📝 Password Pattern

The passwords follow a simple pattern:
- Counselor 1: `Counselors01`
- Counselor 2: `Counselors02`
- Counselor 3: `Counselors03`
- Counselor 4: `Counselors04`
- Counselor 5: `Counselors05`

This makes it easy to remember and test all accounts.

---

## ✅ Ready to Test!

All accounts are now:
- ✅ Created and stored
- ✅ Pre-verified (no admin needed)
- ✅ Ready to login
- ✅ Fully functional
- ✅ Ready for testing

**Start testing:** `npm run dev` → Select "I'm a Counselor" → Login!

---

**Version:** 1.0  
**Date:** May 11, 2026  
**Status:** ✅ Ready to Use
