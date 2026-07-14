# WellMind

WellMind is a mobile-first preventive mental wellness application designed to support users with emotional awareness, calming tools, self-reflection, and access to counselor-guided support. The platform combines a polished wellness experience for users with a dedicated counselor experience for support professionals.

## What the app provides

WellMind is not a replacement for professional diagnosis or therapy. Instead, it is a supportive, prevention-focused tool that helps users:

- track mood and emotional patterns
- access guided breathing, grounding, and relaxation activities
- complete self-assessments for stress, burnout, anxiety, and depression-related wellbeing signals
- use a dedicated MindBuddy companion for reflective conversations and wellness suggestions
- explore resources such as community support, volunteering, events, mentorship, and programs
- connect with counselors through anonymous support chat and appointment-based conversations
- receive reminders and mobile notifications for check-ins and support flows

## Core product experience

### User experience
- onboarding and account setup with role-based authentication
- PIN-protected access for privacy and session security
- home dashboard with mood logging, affirmations, daily suggestions, and panic support
- wellness modules for mindfulness, journaling, and calming activities
- emotion insights and personalized wellness planning
- counselor support and community resource navigation

### Counselor experience
- counselor account login and dashboard access
- counselor chat and support workflows
- availability and appointment coordination
- real-time communication features through Socket.IO

## Architecture overview

The project is a full-stack mobile application with a React frontend, an Express API, and a Capacitor Android layer.

### Frontend
- Vite + React + TypeScript
- Tailwind CSS and shadcn-style UI components
- Framer Motion for transitions and UI polish
- Zustand for app state and React Query for data-driven flows

### Backend API
- Express server in the api folder
- REST routes for users, counselors, chat, appointments, and notifications
- Socket.IO for real-time presence, messaging, and call signaling
- MongoDB via Mongoose models in the api/models folder

### Mobile packaging
- Capacitor configuration for Android deployment
- native permission and notification integration
- Android build output generated under android/app/build/outputs

## Project structure

- src/ – main frontend application code
  - components/ – reusable UI and feature modules
  - pages/ – auth, onboarding, and route-level screens
  - hooks/ – custom React hooks for mobile permissions, encryption, calls, and notifications
  - lib/ – API clients, chat logic, scheduling, and notification utilities
  - stores/ – Zustand state stores for auth, wellness, chat, and settings
- api/ – Express server and backend routes/models
- android/ – Capacitor Android project
- public/ – static assets

## Tech stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui-inspired component system
- Zustand
- React Query
- Express
- Socket.IO
- Mongoose
- Capacitor
- Android Gradle build

## Getting started

### Prerequisites
- Node.js and npm
- Android SDK tools if you want to build the mobile APK

### Install dependencies

```bash
npm install
```

### Run the app locally

The project includes a combined development script that starts the frontend and API together:

```bash
npm run dev
```

This will launch:
- the Vite frontend on http://localhost:5173
- the backend API on http://localhost:5001

If you want to run the API alone:

```bash
npm run api
```

### Environment variables

The frontend can be pointed at a different API host with:

```bash
$env:VITE_API_URL="https://your-api-url"
```

The backend reads environment values such as PORT and CLIENT_ORIGIN through the api environment setup.

## Build for Android

### Debug APK

```bash
npm run build
npx cap sync android
cd android
```

On Windows:

```powershell
.\gradlew.bat assembleDebug
```

On macOS or Linux:

```bash
./gradlew assembleDebug
```

The debug APK will be generated at:
- android/app/build/outputs/apk/debug/app-debug.apk

### Release APK

```powershell
.\gradlew.bat assembleRelease
```

Release output is placed under:
- android/app/build/outputs/apk/release/

## Ethical and safety note

WellMind is intended for emotional awareness, prevention, reflection, and supportive engagement. It is not a substitute for professional diagnosis or emergency mental health care. Users in crisis should seek immediate help from qualified professionals or emergency services.

## Project context

This project was developed as an academic mobile wellness platform and is intended for educational and prototype use.

## License

This project is intended for academic and educational purposes under the course context of the WellMind development work.