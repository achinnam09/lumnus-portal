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
4. **Consultant Scoring** - Password-protected scoring page for club members to evaluate candidates per event. Hidden route (`/consultant/score`), not in Navbar. Supports Info Night (flag + comment) and Case Study Night (weighted multi-category scoring with multi-candidate carousel). Speed Networking, Assessment Center, and Interview forms are planned but not yet implemented.

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
Password gate (sessionStorage) → Proctor identity → Event selection → Event-specific form
→ Axios POST (with x-consultant-password header) → Express (requireConsultantAuth middleware)
→ Attendance validation → Prisma DB (upsert scoring records)
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

- **RecruitmentCycle** → has many Events, Applicants, Applications, InfoNightComments, CaseStudyScores
- **Applicant** → has one Application per cycle, has many Attendance records, InfoNightComments, CaseStudyScores
- **Event** → has many Attendance records
- **InfoNightComment** → proctor comment + optional red/green flag per candidate per cycle (unique on [applicantId, proctorPid, cycleId])
- **CaseStudyScore** → weighted scoring across 4 categories (Communication 35%, Analytical 30%, Personable 30%, Commitment 5%) with raw sub-criteria in JSON, computed category averages and total as Float columns (unique on [applicantId, proctorPid, cycleId])
- **Track enum**: Strategy, DataAnalytics

## Project Structure

```
lumnus-portal/
  client/                 # React + Vite frontend
    src/
      main.jsx            # React entry point
      App.jsx             # Routes and layout
      components/         # Shared components
        Navbar.jsx        # Navigation (does NOT include scoring route)
        scoring/          # Scoring feature components
          InfoNightForm.jsx/.css
          CaseStudyForm.jsx/.css
          CandidateNav.jsx/.css
      pages/              # Page components
        ApplicationForm.jsx/.css
        AttendanceForm.jsx/.css
        Dashboard.jsx/.css
        ConsultantScoring.jsx/.css  # Hidden route: /consultant/score
      utils/
        recruitmentCycle.js  # Shared getCurrentRecruitmentCycle()
        scoringApi.js        # Axios wrapper with auth header for scoring endpoints
    vite.config.js        # Vite configuration
  server/                 # Node.js + Express backend
    index.js              # Express server and API routes (incl. scoring endpoints)
    supabase.js           # Supabase client init
    middleware/multer.js   # File upload config
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
