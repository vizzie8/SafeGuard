# SafeGuard 🛡️
 
**A personal-safety web app with multi-trigger SOS, a live risk-zone map, and real-time distress video streaming.**
 
SafeGuard helps a person in danger raise an alarm through *any* channel available to them — a button press, a spoken code word, a scream, a phone thrown in panic, or even the device powering off — and shares their live location (and optionally a live video feed) with emergency contacts and services.
 
Built for the Pune region as a demonstration; the risk-zone data and emergency-service directory are localized to Pune but the architecture is location-agnostic.
 
---
 
## Table of Contents
 
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Repository Layout](#repository-layout)
- [How the Core Flows Work](#how-the-core-flows-work)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Status & Honest Limitations](#project-status--honest-limitations)
- [Roadmap](#roadmap)
---
 
## Features
 
**Multi-trigger SOS.** An alert can be raised five different ways, so a victim isn't dependent on being able to reach a button:
- **Manual** — press the SOS button.
- **Voice code word** — a spoken keyword (default "help") detected via the browser Speech Recognition API.
- **Scream detection** — sound level crossing a configurable dB threshold.
- **Throw / impact detection** — a sudden accelerometer spike (phone thrown or dropped).
- **Power-off / tab-close** — the device shutting down or the browser closing fires a last-known-location beacon.
**Two alert tiers.**
- *Primary SOS* notifies the user's saved emergency contacts.
- *Secondary / Auto SOS* notifies emergency services (police, hospitals, women's helpline, ambulance).
Each alert includes a timestamp and a live Google Maps location link, delivered via the device's native SMS composer.
 
**Live risk-zone map.** A Leaflet map renders color-coded safety zones (Safe → Danger, risk levels 1–5) over OpenStreetMap tiles, plus markers for nearby emergency services and the user's live position.
 
**Emergency video streaming.** On SOS activation, the app can open a peer-to-peer WebRTC video/audio stream from the victim's device directly to a monitoring admin dashboard, with the backend acting only as a signaling relay.
 
**Admin dashboard.** Role-gated view of platform stats and a live incident log.
 
---
 
## Architecture
 
SafeGuard is a **three-tier client–server application** with a real-time peer-to-peer media layer.
 
```
┌──────────────────────────────────────────────────────────────┐
│  CLIENT                                                        │
│  React SPA (frontend/)  +  vanilla-JS prototype (root)        │
└───────────────┬──────────────────────────────┬───────────────┘
                │ REST (HTTP)                   │ WebSocket
                │ auth · contacts · SOS log     │ (Socket.io signaling)
                ▼                               ▼
┌──────────────────────────────┐   ┌───────────────────────────┐
│  Node / Express API          │   │  FastAPI AI service        │
│  (backend-node/)             │   │  (backend-ai/)             │
│  · JWT auth · REST routes    │   │  · /analyze-risk           │
│  · Socket.io signaling       │   │    (RAG/FAISS — planned)   │
│         │ Prisma ORM         │   └───────────────────────────┘
│         ▼                    │
│   PostgreSQL   +   Redis     │
└──────────────────────────────┘
 
        VICTIM ⇄ ADMIN video flows PEER-TO-PEER over WebRTC —
        it does NOT pass through the server. The server only
        helps the two peers discover each other (signaling).
```
 
The important design decision: **application data travels client → server → database, but the video does not.** WebRTC establishes a direct peer-to-peer connection so that live media never touches the server — the server only relays the connection handshake (SDP offer/answer + ICE candidates) over Socket.io. This keeps latency low and avoids server bandwidth and storage costs.
 
---
 
## Tech Stack
 
| Layer | Technology | Role |
|---|---|---|
| Frontend | React 19, Vite, TypeScript | Component-based SPA, fast dev/build |
| Styling | Tailwind CSS | Utility-first styling |
| Maps | Leaflet + OpenStreetMap | Risk-zone heatmap & markers |
| Visuals | Three.js, Framer Motion, Recharts | Background, animation, charts |
| API server | Node.js, Express | REST routing, middleware |
| ORM | Prisma | Type-safe DB access |
| Database | PostgreSQL | Persistent relational store |
| Cache/Queue | Redis | Provisioned (future caching/queue) |
| Real-time | Socket.io | WebRTC signaling channel |
| Media | WebRTC (STUN) | P2P victim→admin video |
| Auth | JWT + bcrypt | Stateless auth, hashed passwords |
| AI service | FastAPI, Pydantic | Risk-scoring endpoint (stub) |
| Sensors | Web Audio, SpeechRecognition, DeviceMotion, Battery, Geolocation APIs | Multi-trigger detection |
| Infra | Docker Compose | MYSQL + Redis containers |
 
---
 
## Repository Layout
 
```
SafeGuard/
├── index.html, app.js, sos.js,          # Self-contained vanilla-JS prototype
│   sensor.js, map.js, safety_zone.js,   #   (works end-to-end, localStorage-backed)
│   style.css
│
├── frontend/                            # Production React SPA
│   └── src/
│       ├── pages/       (Home, Dashboard, Login, Register, Admin)
│       ├── components/  (Navbar, Heatmap, ParticleWaveBackground)
│       ├── hooks/       (useFallDetection, useVoiceRecognition,
│       │                 useLocationTracking, useWebRTCStream, useWebRTCAdmin)
│       └── context/     (SettingsContext)
│
├── backend-node/                        # Express + Prisma + Socket.io API
│   ├── src/
│   │   ├── server.ts                    # App entry + Socket.io signaling
│   │   ├── routes/      (auth, contacts, sos, admin)
│   │   └── middlewares/ (authMiddleware — JWT verification)
│   └── prisma/
│       ├── schema.prisma                # User, Contact, Event, Incident
│       └── seed.ts
│
├── backend-ai/                          # FastAPI risk-scoring service
│   └── main.py                          # /analyze-risk (stub for RAG/FAISS)
│
├── docker-compose.yml                   # Postgres + Redis
└── package.json                         # npm workspaces (frontend, backend-node)
```
 
> **Two frontends, on purpose.** The root vanilla-JS app is the original rapid prototype and runs standalone with zero backend. The `frontend/` React app is the production-grade rebuild that talks to the real backend. The prototype is the reference for feature behavior.
 
---
 
## How the Core Flows Work
 
### SOS flow (press → alert)
1. A trigger fires (button, code word, scream, throw, or power-off).
2. A re-entry guard (`sosActive`) ensures only one alert is in flight at a time.
3. The app requests the current GPS position (with a timeout fallback to "location unavailable").
4. It composes a message with the trigger type, timestamp, and a Google Maps link.
5. Recipients are resolved: saved contacts (Primary) or emergency services (Secondary).
6. Native `sms:` composer links are opened per recipient, staggered so the OS handles them one at a time.
7. Authenticated clients also POST the event to `/api/sos/trigger`, which logs it to PostgreSQL.
### Throw / fall detection
The `devicemotion` stream gives acceleration on x/y/z. The app computes the vector magnitude √(x²+y²+z²) and requires it to exceed the threshold for **several consecutive frames** before triggering — this debouncing rejects single-frame noise. A cancelable countdown then gives the user a few seconds to abort a false alarm.
 
### Emergency video (WebRTC)
On SOS, the victim's browser captures camera+mic, connects to the Socket.io server, and creates an `RTCPeerConnection` using a public **STUN** server for NAT traversal. The SDP **offer/answer** and **ICE candidates** are relayed to the admin room through Socket.io; once negotiated, encrypted media (DTLS-SRTP) flows **directly** victim → admin.
 
---
 
## Getting Started
 
### Prerequisites
- Node.js 18+
- Python 3.10+
- Docker & Docker Compose
### 1. Start the databases
```bash
docker compose up -d        # starts PostgreSQL (5432) and Redis (6379)
```
 
### 2. Backend (Node API)
```bash
cd backend-node
npm install
npx prisma migrate dev      # apply schema
npx prisma db seed          # optional: seed data
npm run dev                 # http://localhost:4000
```
 
### 3. AI service
```bash
cd backend-ai
python -m venv venv && source venv/bin/activate
pip install fastapi uvicorn pydantic
uvicorn main:app --reload --port 8000   # http://localhost:8000
```
 
### 4. Frontend
```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```
 
### Or run the zero-setup prototype
Just open `index.html` in a browser (best on a phone or with device emulation) — no backend required. Grant location, microphone, and motion permissions to exercise the sensor triggers.
 
---
 
## Environment Variables
 
`backend-node/.env`:
 
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign JWTs — **must be a strong, secret value** |
| `PORT` | API port (default 4000) |
 
> ⚠️ **Never commit real secrets.** Add `.env` to `.gitignore`, use a `.env.example` with placeholder values, and rotate any secret that has ever been committed.
 
---
 
## Project Status & Honest Limitations
 
This is a working demonstration project, not a production-ready safety service. Known limitations, stated plainly:
 
- **SMS is not automated.** The app opens the device's native SMS composer via `sms:` links; the user still taps *send*. True server-initiated SMS requires a gateway such as Twilio.
- **The AI service is a stub.** `/analyze-risk` returns hardcoded values; the RAG/FAISS risk model is scaffolded but not implemented.
- **The risk heatmap is curated, not learned.** Zones are hand-authored static data, not model output.
- **No TURN server.** WebRTC uses STUN only, so streaming can fail between peers behind strict/symmetric NATs.
- **Power-off detection is best-effort.** `beforeunload` is unreliable, and the Battery API is deprecated/removed in many browsers.
- **Database provider is inconsistent** between the Prisma schema (SQLite) and the deployment config (PostgreSQL); PostgreSQL is the intended target.
Treating these as a real safety product would require hardening, redundant delivery channels, and formal reliability testing.
---
 
## Roadmap
 
- [ ] Implement the RAG/FAISS risk-scoring model in the AI service
- [ ] Integrate Twilio (or similar) for automated SMS/voice alerts
- [ ] Add a TURN server for reliable WebRTC connectivity
- [ ] Replace curated zones with data-driven risk scoring
- [ ] Add automated tests around the SOS trigger paths
- [ ] Background/offline SOS via a service worker
---
 
