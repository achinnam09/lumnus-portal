# Lumnus Consulting Portal

Internal recruiting and operations portal for Lumnus Consulting — manages applications, event attendance, and applicant review.

**ALWAYS RESPOND IN ENGLISH**

## Core Working Principles

1. For maximum efficiency, whenever you need to perform multiple independent operations, invoke all relevant tools simultaneously and in parallel.
2. Before you finish, please verify your solution
3. Do what has been asked; nothing more, nothing less.
4. NEVER create files unless they're absolutely necessary for achieving your goal.
5. ALWAYS prefer editing an existing file to creating a new one.
6. NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.

## Project Stack

- **React 19** - Frontend UI framework (JSX, no TypeScript)
- **Vite 6** - Build tool and dev server
- **React Router 7** - Client-side routing
- **Axios** - HTTP client for API requests
- **Express 5** - Backend REST API framework
- **Prisma 6** - Database ORM
- **PostgreSQL** - Database (hosted on Supabase)
- **Supabase Storage** - File storage for resumes and headshots
- **Multer** - Multipart file upload handling
- **Plain CSS** - Component-scoped stylesheets (no preprocessor or CSS-in-JS)
- **ESLint 9** - Code linting
- **Node.js 18+** - Runtime

## Architectural Principles

**"As simple as possible, but not simpler"**

- **KISS + DRY + YAGNI + Occam's Razor**: each new entity must justify its existence
- **Prior-art first**: look for existing solutions first, then write our own
- **Documentation = part of code**: architectural decisions are recorded in code and comments
- **No premature optimization**
- **100% certainty**: evaluate cascading effects before changes

## Code Quality Standards

**All code checks are mandatory - code must be CLEAN!**
No errors. No formatting issues. No compiler warnings.

**Architectural standards:**

- Minimally sufficient patterns (don't overcomplicate)
- Decomposition: break tasks into subtasks
- Cascading effects: evaluate impact of changes

## Main Project Features

1. **Application Submission** - Multi-field form with resume/headshot uploads, essay word limits, track selection (Strategy/Data Analytics)
2. **Attendance Tracking** - Event check-in with auto-detected recruitment cycle, duplicate prevention
3. **Applicant Review Dashboard** - Filterable applicant list with inline scoring, status categorization (Accepted/Final Round/Unreviewed/Rejected), red flag indicators
4. **Consultant Scoring** - Password-protected scoring page for club members to evaluate candidates per event. Route `/scoring`, visible in Navbar. Supports four events:
   - **Info Night** - Name-based candidate lookup, green/red flag + comment (upsert per proctor per candidate per cycle)
   - **Case Study Night** - 1–5 scores across 4 weighted categories (Communication 35%, Analytical 30%, Personable 30%, Commitment 5%), multi-candidate carousel
   - **Speed Networking** - Same flag + comment form as Info Night
   - **Assessment Center** - Same 1–5 category scoring as Case Study Night, with a station selector (Pitch, Logic, Creativity, Estimation). Weights differ: Communication 29%, Analytical 36%, Personable 29%, Commitment 6%
   - **Interview** - Not yet implemented

## Architectural Patterns

### Data Flow

**Application submission:**

```
Form → Axios POST → Express → Multer (file buffer) → Supabase Storage + Prisma DB
```

**Attendance tracking:**

```
Form → Axios POST → Express → Prisma DB (cycle/event/applicant lookup/creation)
```

**Consultant scoring:**

```
Password gate (sessionStorage) → Proctor identity + event selection (single intake form)
→ Event-specific form (FlagForm for Info Night/Speed Networking, ApplicantScoringForm for Case Study/Assessment Center)
→ Axios POST (with x-consultant-password header) → Express (requireConsultantAuth middleware)
→ find-or-create cycle/event/applicant → Prisma DB (create or upsert scoring records)
```

### Frontend Architecture

- **Component-based** React with local `useState` state management
- **Client-side routing** via BrowserRouter (4 main routes, 1 hidden)
- **Component-scoped CSS** files alongside each component
- **Shared utilities** in `client/src/utils/` (recruitmentCycle, scoringApi)

### Backend Architecture

- **REST API** with Express routes
- **Prisma ORM** for type-safe PostgreSQL access
- **Multer middleware** for in-memory file handling (10MB limit)
- **Supabase Storage** buckets: `resumes`, `headshots`
- **Consultant auth** via shared password (`CONSULTANT_PASSWORD` env var) with timing-safe comparison

### Database Models

- **RecruitmentCycle** → has many Events, Applicants, Applications, InfoNightComments, SpeedNetworkingComments, CaseStudyScores, AssessmentCenterScores
- **Applicant** → has many Applications (one per cycle enforced by unique constraint), Attendance records, InfoNightComments, SpeedNetworkingComments, CaseStudyScores, AssessmentCenterScores
- **Event** → has many Attendance records
- **InfoNightComment** → proctor flag (green/red, optional) + required comment per candidate per cycle (unique on [applicantId, proctorEmail, cycleId])
- **SpeedNetworkingComment** → identical structure to InfoNightComment (unique on [applicantId, proctorEmail, cycleId])
- **CaseStudyScore** → flat 1–5 scores per category (Communication, Analytical, Personable, Commitment), weighted total, optional per-category comments and flag/flagComment (unique on [applicantId, proctorEmail, cycleId]; multiple proctors can each score the same candidate)
- **AssessmentCenterScore** → same structure as CaseStudyScore plus a `station` field (Pitch/Logic/Creativity/Estimation). Unique on [applicantId, proctorEmail, station, cycleId]
- **Track enum**: Strategy, DataAnalytics

## Project Structure

```
lumnus-portal/
  client/                 # React + Vite frontend
    src/
      main.jsx            # React entry point
      App.jsx             # Routes and layout
      components/         # Shared components
        Navbar.jsx        # Navigation (includes /scoring link)
        scoring/          # Scoring feature components
          ApplicantScoringForm.jsx/.css  # 1-5 category scoring form (Case Study / Assessment Center)
          FlagForm.jsx/.css              # Flag + comment form (Info Night / Speed Networking)
          CandidateNav.jsx/.css          # Multi-candidate carousel nav
      pages/              # Page components
        ApplicationForm.jsx/.css
        AttendanceForm.jsx/.css
        Dashboard.jsx/.css
        ScoringForm.jsx/.css  # Route: /scoring — password gate, intake, event-specific form
      utils/
        recruitmentCycle.js  # Shared getCurrentRecruitmentCycle()
        scoringApi.js        # Axios wrappers with auth header for all scoring endpoints
    vite.config.js        # Vite configuration
  server/                 # Node.js + Express backend
    index.js              # Express server and API routes (incl. scoring endpoints)
    supabase.js           # Supabase client init
    middleware/multer.js  # File upload config
    prisma/schema.prisma  # Database schema
```

## Verification Checkpoints

**Stop and check** at these moments:

- After implementing a complete function
- Before starting a new component/module
- Before declaring "done"

Run check:
- Frontend: `cd client && npm run lint`
- Backend: `cd server && npx prisma validate`

## Coding Standards

### FORBIDDEN:

- **NO console.log** in production code - use proper logging!
- **NO hardcoded values** - use constants and configs!
- **NO code duplication** - reuse components and utilities!
- **NO ignoring errors** - handle all exceptions!
- **NO TODOs** in final code

### Mandatory rules:

- Use constants and configuration
- Reuse existing components and utilities
- Always handle exceptions
- **Meaningful names** for variables and functions
- **Early returns** to reduce nesting
- **Error handling** explicit and clear

## Implementation Standards

### Code is considered ready when:

- Build passes without errors (`npm run build` in client)
- Lint passes (`npm run lint` in client)
- Prisma schema validates (`npx prisma validate` in server)
- Function works end-to-end
- Old/unused code removed
- Code is understandable to junior developer

### Security always:

- Validate all external data
- Don't store sensitive data openly
- Use HTTPS/TLS for communication
- Escape user input

## Development Commands

### Frontend (client/)

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Backend (server/)

- `npm run dev` - Start with Nodemon (auto-reload)
- `npm start` - Start production server
- `npx prisma migrate dev` - Create/apply DB migrations
- `npx prisma generate` - Regenerate Prisma client

### Development mode

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000`
- **Hot reloading**: Enabled (Vite HMR + Nodemon)

---

# Important Instructions Reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.
