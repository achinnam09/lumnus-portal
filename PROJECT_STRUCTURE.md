# PROJECT_STRUCTURE.md

> Architectural map for AI agents and developers. Enables quick navigation and dependency analysis.

## Overview

**Lumnus Portal** is a **full-stack monorepo** built with **React 19 + Vite 6 (frontend) and Express 5 + Prisma 6 (backend)**.

### Stack

| Layer    | Technology                                         |
| -------- | -------------------------------------------------- |
| Frontend | React 19, React Router 7, Axios                   |
| Backend  | Express 5, Prisma 6, Multer 2                      |
| Database | PostgreSQL (Supabase-hosted)                       |
| Storage  | Supabase Storage (resumes, headshots buckets)      |
| Build    | Vite 6, Nodemon                                    |
| Styles   | Plain CSS (component-scoped)                       |
| Linting  | ESLint 9 (react-hooks, react-refresh plugins)      |

---

## Project Tree

<details>
<summary>Expand full structure</summary>

```
lumnus-portal/
├── client/                       # React + Vite frontend
│   ├── index.html                # HTML entry point
│   ├── package.json              # Frontend dependencies & scripts
│   ├── vite.config.js            # Vite configuration
│   ├── eslint.config.js          # ESLint flat config
│   ├── public/
│   │   └── vite.svg              # Static favicon
│   └── src/
│       ├── main.jsx              # React entry point (BrowserRouter setup)
│       ├── App.jsx               # Root component (routes & layout)
│       ├── App.css               # Global app styles
│       ├── index.css             # Base/reset styles
│       ├── assets/
│       │   └── react.svg
│       ├── components/
│       │   ├── Navbar.jsx        # Top navigation bar
│       │   ├── Navbar.css
│       │   └── scoring/          # Scoring feature components
│       │       ├── ApplicantScoringForm.jsx  # 1-5 category scoring (Case Study / Assessment Center)
│       │       ├── ApplicantScoringForm.css
│       │       ├── FlagForm.jsx              # Flag + comment form (Info Night / Speed Networking)
│       │       ├── FlagForm.css
│       │       ├── CandidateNav.jsx          # Multi-candidate carousel nav
│       │       └── CandidateNav.css
│       ├── pages/
│       │   ├── ApplicationForm.jsx   # Application submission form
│       │   ├── ApplicationForm.css
│       │   ├── AttendanceForm.jsx    # Event attendance check-in
│       │   ├── AttendanceForm.css
│       │   ├── Dashboard.jsx         # Applicant review dashboard
│       │   ├── Dashboard.css
│       │   ├── ScoringForm.jsx       # Consultant scoring page (/scoring)
│       │   └── ScoringForm.css
│       └── utils/
│           ├── recruitmentCycle.js   # Shared getCurrentRecruitmentCycle()
│           └── scoringApi.js         # Axios wrappers with auth header for scoring endpoints
├── server/                       # Node.js + Express backend
│   ├── index.js                  # Express server & all API routes
│   ├── package.json              # Backend dependencies & scripts
│   ├── supabase.js               # Supabase client initialization
│   ├── .env                      # Environment variables (not committed)
│   ├── middleware/
│   │   └── multer.js             # File upload config (memory storage, 10MB limit)
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema definition
│   │   └── migrations/           # SQL migration history
│   └── generated/
│       └── prisma/               # Auto-generated Prisma client
├── CLAUDE.md                     # AI agent instructions
└── README.md                     # Project readme
```

</details>

---

## NPM Scripts

### Frontend (`client/`)

| Script            | Description                       |
| ----------------- | --------------------------------- |
| `npm run dev`     | Start Vite dev server (port 5173) |
| `npm run build`   | Production build                  |
| `npm run lint`    | Run ESLint                        |
| `npm run preview` | Preview production build          |

### Backend (`server/`)

| Script                    | Description                      |
| ------------------------- | -------------------------------- |
| `npm run dev`             | Start with Nodemon (auto-reload) |
| `npm start`               | Start production server          |
| `npx prisma migrate dev`  | Create/apply DB migrations       |
| `npx prisma generate`     | Regenerate Prisma client         |

---

## Source Structure

### Frontend Entry Points

- `client/src/main.jsx` — App bootstrap (React 19, StrictMode, BrowserRouter)
- `client/src/App.jsx` — Root component with route definitions

### Routes

| Path          | Component       | Description                             |
| ------------- | --------------- | --------------------------------------- |
| `/attendance` | AttendanceForm  | Event check-in form                     |
| `/apply`      | ApplicationForm | Application submission form             |
| `/dashboard`  | Dashboard       | Applicant review & scoring              |
| `/scoring`    | ScoringForm     | Consultant scoring (password-protected) |

### Components (`client/src/components/`)

- **Navbar.jsx** — Top navigation links to all 4 routes
- **scoring/ApplicantScoringForm.jsx** — Controlled form for 1–5 category scoring per candidate. Used for Case Study Night and Assessment Center. Email lookup on blur, flag toggle, per-category comments.
- **scoring/FlagForm.jsx** — Controlled form for flag + comment per candidate. Used for Info Night and Speed Networking. Name-based lookup with multi-result picker, overwrite warning for existing flags.
- **scoring/CandidateNav.jsx** — Carousel navigation for multi-candidate sessions (add/remove/prev/next).

### Pages (`client/src/pages/`)

| Page               | Description                                                                       |
| ------------------ | --------------------------------------------------------------------------------- |
| ApplicationForm    | Multi-field form with resume/headshot uploads, essay word limits, track selection |
| AttendanceForm     | Event check-in with auto-detected recruitment cycle, duplicate prevention         |
| Dashboard          | Filterable applicant list with inline scoring, status categorization, flags       |
| ScoringForm        | Password gate → intake (proctor + event) → event-specific form                   |

### Backend (`server/index.js`)

Single-file API server with all routes:

| Endpoint                            | Method | Description                                                        |
| ----------------------------------- | ------ | ------------------------------------------------------------------ |
| `/`                                 | GET    | Health check                                                       |
| `/api/application`                  | POST   | Submit application with resume/headshot uploads                    |
| `/api/attendance`                   | POST   | Record event attendance                                            |
| `/api/scoring/auth`                 | POST   | Validate consultant password                                       |
| `/api/scoring/validate-attendance`  | GET    | Check attendance by email + event (legacy, used by old flow)       |
| `/api/scoring/lookup-attendee`      | GET    | Lookup candidate by email + event; returns name + attendance status|
| `/api/scoring/lookup-by-name`       | GET    | Lookup candidates by name (insensitive contains); returns all matches with attendance + existing flag per proctor |
| `/api/scoring/info-night`           | POST   | Upsert Info Night flag + comment                                   |
| `/api/scoring/speed-networking`     | POST   | Upsert Speed Networking flag + comment                             |
| `/api/scoring/case-study`           | POST   | Batch create Case Study scores (one per proctor per candidate)     |
| `/api/scoring/assessment-center`    | POST   | Batch create Assessment Center scores (one per proctor per station per candidate) |

Supporting modules:

- `supabase.js` — Supabase client (storage operations)
- `middleware/multer.js` — Memory-based file upload handling (10MB limit)

---

## Database Schema (Prisma)

### Models

| Model                  | Key Fields                                                        | Unique Constraint                              |
| ---------------------- | ----------------------------------------------------------------- | ---------------------------------------------- |
| RecruitmentCycle       | id, label                                                         | label                                          |
| Applicant              | id, name, email, cycleId                                          | [email, cycleId]                               |
| Event                  | id, name, date, cycleId                                           | —                                              |
| Attendance             | id, applicantId, eventId, timestamp                               | [applicantId, eventId]                         |
| Application            | id, applicantId, cycleId, year, email, major, minor, track, essays, resumeUrl, headshotUrl, heardFrom | [applicantId, cycleId] |
| InfoNightComment       | id, applicantId, cycleId, proctorName, proctorEmail, flag, comment | [applicantId, proctorEmail, cycleId]          |
| SpeedNetworkingComment | id, applicantId, cycleId, proctorName, proctorEmail, flag, comment | [applicantId, proctorEmail, cycleId]          |
| CaseStudyScore         | id, applicantId, cycleId, proctorName, proctorEmail, communicationScore, analyticalScore, personableScore, commitmentScore, totalScore, per-category comments, flag, flagComment | [applicantId, proctorEmail, cycleId] |
| AssessmentCenterScore  | same as CaseStudyScore + station                                   | [applicantId, proctorEmail, station, cycleId] |

### Enums

- **Track**: `Strategy`, `DataAnalytics`

### Scoring model notes

- All category scores are **1–5** (Float stored in DB)
- **CaseStudyScore** weights: Communication 35%, Analytical 30%, Personable 30%, Commitment 5%
- **AssessmentCenterScore** weights: Communication 29%, Analytical 36%, Personable 29%, Commitment 6%
- Multiple proctors can independently score the same candidate — uniqueness is per-proctor, not per-candidate
- Flag/comment forms (**InfoNightComment**, **SpeedNetworkingComment**) use upsert — a proctor can overwrite their own previous entry

---

## Configuration

### Vite (Frontend Build)

- Plugin: `@vitejs/plugin-react`
- Dev server: port 5173, HMR enabled
- Output: `client/dist/`

### ESLint

- Flat config format (ESLint 9)
- Plugins: react-hooks, react-refresh
- Custom rule: unused vars ignore pattern `^[A-Z_]`

### Environment Variables (`server/.env`)

- `DATABASE_URL` — PostgreSQL connection string
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key
- `CONSULTANT_PASSWORD` — Shared password for the scoring page

---

## Key Architectural Patterns

### Find-or-Create Pattern

Used consistently across attendance, case-study, and assessment-center endpoints for shared entities (RecruitmentCycle, Applicant, Event) — ensuring idempotent record creation without requiring pre-seeded data.

### Scoring Flow

```
ScoringForm (password gate) → intake form (proctor name/email + event [+ station for AC])
→ FlagForm or ApplicantScoringForm depending on event
→ CandidateNav carousel for multi-candidate sessions
→ Axios POST → requireConsultantAuth middleware → find-or-create cycle/event/applicant
→ Prisma create (scoring) or upsert (flag comments)
```

### File Upload Flow

```
Client (FormData) → Multer (memory buffer) → Supabase Storage → URL stored in Prisma DB
```

Files are never written to disk; they pass through memory buffers directly to Supabase Storage, with the resulting public URLs persisted in the Application record.

---

## External Integrations

| Integration      | Purpose                        | Config Location        |
| ---------------- | ------------------------------ | ---------------------- |
| Supabase DB      | PostgreSQL hosting             | `server/.env`          |
| Supabase Storage | Resume & headshot file storage | `server/supabase.js`   |

---

## Maintenance

### When to Update This File

- New route or API endpoint added
- New page or shared component created
- Database schema changes (new model/field)
- NPM script added/changed
- New external integration introduced

### Verification Commands

```bash
# Lint frontend
cd client && npm run lint

# Validate Prisma schema
cd server && npx prisma validate

# Build check
cd client && npm run build
```

---

> **Note**: This document is a navigation aid. Keep it accurate but don't over-document. Update when architecture changes, not for every file addition.
