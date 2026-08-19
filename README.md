# SILENT TRIGGER

## AI-Enabled Discreet Emergency Detection & Real-Time Response System

> When asking for help openly isn't safe, Silent Trigger provides a discreet path to emergency response.

Silent Trigger is a personal safety and emergency response ecosystem. The software platform receives emergency events from a proposed independent wearable device (silently triggered, no phone required) and provides real-time monitoring, incident management, simulated GPS/audio/video, and a responder dashboard.

This is a **hackathon prototype**. All hardware-originated data (GPS, audio, video, device status) is **SIMULATED**.

---

## Problem

Conventional SOS systems have critical limitations:
- Openly calling for help can escalate danger
- Most SOS apps require a smartphone (can be confiscated, out of battery, or out of reach)
- Unlocking a phone and navigating to an app wastes precious seconds
- Traditional SOS does not capture location, audio, or video evidence

## Solution

Silent Trigger bridges the gap between silent activation and rapid emergency response:

```
Silent Trigger → Emergency Detection → Location → Audio/Video → Emergency Platform → Responder
```

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Maps | Leaflet + OpenStreetMap |
| State | TanStack Query, React Router |
| Forms | React Hook Form + Zod |
| Backend | Supabase (PostgreSQL, Auth, RLS) |
| Icons | Lucide React |

---

## Features

- **Landing page** with hero, problem, solution, features, technology, and roadmap sections
- **Authentication** — register, login, logout with Supabase Auth
- **Role-based access** — USER and RESPONDER roles with protected routes
- **User dashboard** — safety status, device status, battery, incident counts, trigger button
- **Silent Trigger simulation** — creates a real incident with simulated GPS, audio, video, timeline
- **Active emergency page** — map, audio monitor (waveform animation), video monitor (simulated feed), timeline
- **Responder dashboard** — real-time stats, active incidents list
- **Responder incident view** — user info, emergency contacts, device, location map, media, timeline, response actions
- **Acknowledge → Respond → Resolve** workflow with state machine validation
- **Incident history** — search, filter, sort, view details
- **Emergency contacts** — full CRUD (add, edit, delete, set priority)
- **Device management** — simulated device status with proposed hardware roadmap
- **Profile** — view and edit personal info
- **Settings** — notification preferences, security, demo settings
- **Toast notifications**, confirmation dialogs, loading states, skeleton loaders, empty states, error states
- **Responsive design** — desktop, tablet, mobile
- **404 and Unauthorized pages**

---

## Demo Accounts

The app includes a **one-click demo login** button that automatically seeds demo accounts. You can also fill credentials manually:

| Role | Email | Password |
|------|-------|----------|
| User | `demo@silenttrigger.local` | `Demo@2024` |
| Responder | `responder@silenttrigger.local` | `Responder@2024` |

---

## Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck
```

The Supabase database and authentication are pre-configured. No manual environment setup is required.

---

## Demo Flow

The complete demo takes approximately 2–3 minutes:

1. **Login** — Use the one-click demo login or fill credentials manually
2. **User Dashboard** — Shows SAFE status, device ONLINE, battery 87%
3. **Simulate Silent Trigger** — Click the large red button, confirm activation
4. **Emergency Activated** — Incident created in database, redirect to active emergency page
5. **Location Displayed** — Simulated GPS on interactive map with accuracy circle
6. **Audio/Video Status** — Simulated audio waveform + simulated video feed
7. **Responder Dashboard** — Login as responder (or open in another browser), see the new incident
8. **Acknowledge** — Click Acknowledge Incident → status changes to ACKNOWLEDGED
9. **Responding** — Click Mark Responding → status changes to RESPONDING
10. **Resolve** — Click Resolve Incident → status changes to RESOLVED, incident moves to history

---

## Database Schema

| Table | Description |
|-------|-------------|
| `profiles` | Extends auth.users with name, phone, role |
| `devices` | Simulated Silent Trigger hardware units |
| `emergency_incidents` | Core incident record with status state machine |
| `incident_locations` | Simulated GPS coordinates per incident |
| `emergency_contacts` | User-managed emergency contacts (CRUD) |
| `incident_media` | Simulated AUDIO/VIDEO stream records |
| `notifications` | In-app simulated notifications |
| `activity_logs` | Timeline events per incident |

All tables have **Row-Level Security (RLS)** enabled. Users can only access their own data; responders can read all incidents and update status.

---

## Incident State Machine

```
TRIGGERED → ALERT_GENERATED → ACKNOWLEDGED → RESPONDING → RESOLVED
```

Invalid transitions are prevented (e.g., a RESOLVED incident cannot be acknowledged again).

---

## API Design

The frontend talks directly to Supabase via the JS client:

- **Auth**: `supabase.auth.signUp()`, `signInWithPassword()`, `signOut()`
- **Devices**: `supabase.from('devices').select()`
- **Emergency**: `supabase.from('emergency_incidents')` — insert, select, update
- **Location**: `supabase.from('incident_locations')`
- **Media**: `supabase.from('incident_media')`
- **Contacts**: `supabase.from('emergency_contacts')` — full CRUD
- **History**: `supabase.from('emergency_incidents').select()`
- **Activity Logs**: `supabase.from('activity_logs')`

---

## Prototype Limitations

- All hardware data (GPS, audio, video, device status) is **SIMULATED**
- No real hardware device is connected
- No real SMS/WhatsApp/police API integration
- Risk analysis uses a simple rule-based engine (not AI)
- No real-time WebSocket updates (uses TanStack Query polling)

---

## Future Implementation

- Physical Silent Trigger wearable device
- GPS module, cellular (4G/LTE), camera, microphone
- Independent emergency communication (no phone required)
- Real emergency service integration
- AI-based voice distress & threat detection
- False alarm detection and context-aware risk scoring

---

## Project Structure

```
src/
├── components/
│   ├── layouts/       — Sidebar layouts (user + responder)
│   ├── ui/            — Button, Card, Badge, Input, Modal, Skeleton, etc.
│   ├── AudioMonitor.tsx
│   ├── VideoMonitor.tsx
│   ├── MapView.tsx
│   ├── Timeline.tsx
│   └── ProtectedRoute.tsx
├── context/
│   ├── AuthContext.tsx
│   └── ToastContext.tsx
├── lib/
│   ├── types.ts
│   ├── constants.ts
│   ├── utils.ts
│   └── supabase.ts
├── pages/
│   ├── Landing.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── Device.tsx
│   ├── Contacts.tsx
│   ├── IncidentHistory.tsx
│   ├── IncidentDetail.tsx
│   ├── Profile.tsx
│   ├── Settings.tsx
│   ├── ResponderDashboard.tsx
│   ├── ResponderIncidents.tsx
│   ├── ResponderIncidentDetail.tsx
│   ├── ResponderMisc.tsx
│   └── NotFound.tsx
├── services/
│   └── emergencyService.ts
└── App.tsx
```
