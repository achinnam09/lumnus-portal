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
│       │   └── Navbar.css
│       └── pages/
│           ├── ApplicationForm.jsx   # Application submission form
│           ├── ApplicationForm.css
│           ├── AttendanceForm.jsx    # Event attendance check-in
│           ├── AttendanceForm.css
│           ├── Dashboard.jsx         # Applicant review dashboard
│           └── Dashboard.css
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

**Statistics:**

- Directories: ~19
- Source files: ~40
- Components: 1 shared (Navbar) + 3 pages
- Test coverage: none (no test framework configured)

</details>

---

## NPM Scripts

### Frontend (`client/`)

| Script          | Description                      |
| --------------- | -------------------------------- |
| `npm run dev`   | Start Vite dev server (port 5173)|
| `npm run build` | Production build                 |
| `npm run lint`  | Run ESLint                       |
| `npm run preview` | Preview production build       |

### Backend (`server/`)

| Script          | Description                      |
| --------------- | -------------------------------- |
| `npm run dev`   | Start with Nodemon (auto-reload) |
| `npm start`     | Start production server          |
| `npx prisma migrate dev` | Create/apply DB migrations |
| `npx prisma generate`    | Regenerate Prisma client   |

---

## Source Structure

### Frontend Entry Points

- `client/src/main.jsx` — App bootstrap (React 19, StrictMode, BrowserRouter)
- `client/src/App.jsx` — Root component with route definitions

### Routes

| Path          | Component          | Description                    |
| ------------- | ------------------ | ------------------------------ |
| `/attendance` | AttendanceForm     | Event check-in form            |
| `/apply`      | ApplicationForm    | Application submission form    |
| `/dashboard`  | Dashboard          | Applicant review & scoring     |

### Components (`client/src/components/`)

- **Navbar.jsx** — Top navigation links to all 3 routes

### Pages (`client/src/pages/`)

| Page                 | Description                                                                      |
| -------------------- | -------------------------------------------------------------------------------- |
| ApplicationForm.jsx  | Multi-field form with resume/headshot uploads, essay word limits, track selection |
| AttendanceForm.jsx   | Event check-in with auto-detected recruitment cycle, duplicate prevention        |
| Dashboard.jsx        | Filterable applicant list with inline scoring, status categorization, AI flags   |

### Backend (`server/`)

Single-file API server (`index.js`) with all routes:

| Endpoint             | Method | Description                                        |
| -------------------- | ------ | -------------------------------------------------- |
| `/`                  | GET    | Health check                                       |
| `/api/application`   | POST   | Submit application with resume/headshot uploads     |
| `/api/attendance`    | POST   | Record event attendance                            |

Supporting modules:

- `supabase.js` — Supabase client (storage operations)
- `middleware/multer.js` — Memory-based file upload handling (10MB limit)

---

## Database Schema (Prisma)

### Models

| Model            | Key Fields                                    | Relations                              |
| ---------------- | --------------------------------------------- | -------------------------------------- |
| RecruitmentCycle | id, label (unique)                            | has many: Events, Applicants, Applications |
| Applicant        | id, name, pid, cycleId                        | belongs to: Cycle; has one: Application; has many: Attendance |
| Event            | id, name, date, cycleId                       | belongs to: Cycle; has many: Attendance |
| Attendance       | id, applicantId, eventId, timestamp           | belongs to: Applicant, Event           |
| Application      | id, applicantId, cycleId, year, email, major, minor, track, essay1, essay2, resumeUrl, headshotUrl, heardFrom | belongs to: Applicant, Cycle |

### Enums

- **Track**: `Strategy`, `DataAnalytics`

### Unique Constraints

- `Applicant`: `[pid, cycleId]` — one applicant per PID per cycle
- `Attendance`: `[applicantId, eventId]` — no double check-ins
- `Application`: `[applicantId, cycleId]` — one application per cycle per applicant

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

---

## Key Architectural Patterns

### Find-or-Create Pattern

Both `/api/application` and `/api/attendance` endpoints use a consistent find-or-create pattern for shared entities (RecruitmentCycle, Applicant, Event) — ensuring idempotent record creation without requiring pre-seeded data.

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
# Verify frontend structure
ls client/src/
ls client/src/components/
ls client/src/pages/

# Verify backend structure
ls server/
ls server/middleware/
ls server/prisma/

# Check scripts
cat client/package.json | grep "scripts" -A 10
cat server/package.json | grep "scripts" -A 10

# Validate Prisma schema
cd server && npx prisma validate
```

---

> **Note**: This document is a navigation aid. Keep it accurate but don't over-document. Update when architecture changes, not for every file addition.
