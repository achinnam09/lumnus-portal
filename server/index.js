// Import required libraries
import express from "express";
import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import upload from "./middleware/multer.js";
import supabase from "./supabase.js";
import { v4 as uuidv4} from "uuid";

// Load environment varaibles from .env file
dotenv.config();

// Create Express app and Prisma client
const app = express();
const prisma = new PrismaClient();

// Enable CORS so frontend can talk to backend
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Basic test route to make sure the server is running
app.get("/", (req, res) => {
  res.send("Backend is live!");
});

app.post("/api/application", upload.fields([
  { name : "resume", maxCount: 1 },
  { name: "headshot", maxCount: 1 },
]), async(req, res) => {
  try {
    const {
      name, email, year, major, minor, track,
      essay1, essay2, heardFrom, recruitmentCycleLabel
    } = req.body;

    const resumeFile = req.files.resume?.[0];
    const headshotFile = req.files.headshot?.[0];

    console.log("Resume buffer:", !!resumeFile?.buffer);
    console.log("Headshot buffer:", !!headshotFile?.buffer);

    if (!resumeFile || !headshotFile) {
      return res.status(400).json({error: "Missing resume or headshot"});
    }

    // Step 1: Ensure recruitment cycle exists
    let cycle = await prisma.recruitmentCycle.findUnique({
      where: { label: recruitmentCycleLabel },
    });
    if (!cycle) {
      cycle = await prisma.recruitmentCycle.create({
        data: { label: recruitmentCycleLabel},
      });
    }

    // Step 2: Ensure applicant exists
    let applicant = await prisma.applicant.findFirst({
      where: { email, cycleId: cycle.id },
    });

    if (!applicant) {
      applicant = await prisma.applicant.create({
        data: { name, email, cycleId: cycle.id }
      });
    }

    // Step 3: Upload files to Supabase
    const resumePath = `${email}-${uuidv4()}.pdf`
    const headshotPath = `${email}-${uuidv4()}.${headshotFile.mimetype.split("/")[1]}`

    console.log("Uploading resume:", resumeFile?.originalname, resumeFile?.buffer?.length);
    console.log("Uploading headshot:", headshotFile?.originalname, headshotFile?.buffer?.length);


    const [resumeUpload, headshotUpload] = await Promise.all([
      supabase.storage.from("resumes").upload(resumePath, resumeFile.buffer, {
        contentType: "application/pdf",
        upsert: true,
      }),
      supabase.storage.from("headshots").upload(headshotPath, headshotFile.buffer, {
        contentType: headshotFile.mimetype,
        upsert: true,
      }),
    ]);

    if (resumeUpload.error || headshotUpload.error) {
      console.error("Supabase resume error:", resumeUpload.error);
      console.error("Supabase headshot error:", headshotUpload.error);
      return res.status(500).json({ error: "Error uploading files to Supabase."});
    }

    const resumeUrl = resumePath;
    const headshotUrl = headshotPath;

    const application = await prisma.application.create({
      data: {
        applicantId: applicant.id,
        cycleId: cycle.id,
        year,
        email,
        major,
        minor: minor || null,
        track,
        essay1,
        essay2,
        resumeUrl,
        headshotUrl,
        heardFrom
      },
    });


    res.status(201).json({ message: "Application submitted!", application });
  } catch (err) {
    console.error("Error processing application:", err);
    console.error(err);
    res.status(500).json({ error: "Internal server error."});
  }
});


const SIGNED_URL_EXPIRY = 3600; // 60 minutes in seconds

app.get("/api/application/:id/files", async (req, res) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    const [resumeResult, headshotResult] = await Promise.all([
      supabase.storage.from("resumes").createSignedUrl(application.resumeUrl, SIGNED_URL_EXPIRY),
      supabase.storage.from("headshots").createSignedUrl(application.headshotUrl, SIGNED_URL_EXPIRY),
    ]);

    if (resumeResult.error || headshotResult.error) {
      return res.status(500).json({ error: "Failed to generate file URLs." });
    }

    res.json({
      resumeUrl: resumeResult.data.signedUrl,
      headshotUrl: headshotResult.data.signedUrl,
    });
  } catch (err) {
    console.error("Error generating signed URLs:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.post("/api/attendance", async (req, res) => {
  const { name, email, eventName, recruitmentCycleLabel, eventDate } = req.body;

  if (!name || !email || !eventName || !recruitmentCycleLabel || !eventDate) {
    return res.status(400).json({ error: "Name, email, event name, recruitment cycle, and event date are required." });
  }

  try {
    // 1. Find or create RecruitmentCycle
    let cycle = await prisma.recruitmentCycle.findUnique({
      where: { label: recruitmentCycleLabel }
    });

    if (!cycle) {
      cycle = await prisma.recruitmentCycle.create({
        data: { label: recruitmentCycleLabel }
      });
    }

    // 2. Find or create Event
    let event = await prisma.event.findFirst({
      where: {
        name: eventName,
        cycleId: cycle.id
      }
    });

    if (!event) {
      event = await prisma.event.create({
        data: {
          name: eventName,
          date: new Date(eventDate),
          cycleId: cycle.id
        }
      });
    }

    // 3. Find existing applicant in this cycle by email, fall back to name
    let applicant = await prisma.applicant.findFirst({
      where: {
        cycleId: cycle.id,
        OR: [
          { email },
          { name },
        ]
      }
    });

    if (!applicant) {
      applicant = await prisma.applicant.create({
        data: { name, email, cycleId: cycle.id }
      });
    }

    // 4. Check if this applicant already signed into this event
    const alreadySignedIn = await prisma.attendance.findFirst({
      where: {
        applicantId: applicant.id,
        eventId: event.id
      }
    });

    if (alreadySignedIn) {
      return res.status(400).json({ error: "You have already signed in for this event." });
    }

    // 5. Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        applicantId: applicant.id,
        eventId: event.id
      }
    });

    res.status(201).json(attendance);
  } catch (err) {
    console.error("❌ Error in /api/attendance:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});
  
// --- Consultant Scoring Feature ---

if (!process.env.CONSULTANT_PASSWORD) {
  throw new Error("CONSULTANT_PASSWORD environment variable is required");
}

function getCurrentRecruitmentCycle() {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const season = month >= 8 && month <= 10 ? "Fall" : "Spring";
  return `${season}-${year}`;
}

function requireConsultantAuth(req, res, next) {
  const password = req.headers["x-consultant-password"] || "";
  const expected = process.env.CONSULTANT_PASSWORD || "";
  if (!password || !expected || password.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(password), Buffer.from(expected))) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// POST /api/scoring/auth - Validate consultant password
app.post("/api/scoring/auth", requireConsultantAuth, (req, res) => {
  res.json({ valid: true });
});

// GET /api/scoring/validate-attendance - Check candidate attendance for an event
app.get("/api/scoring/validate-attendance", requireConsultantAuth, async (req, res) => {
  try {
    const { email, name, eventName } = req.query;

    if ((!email && !name) || !eventName) {
      return res.status(400).json({ error: "email or name, and eventName are required." });
    }

    const cycleLabel = getCurrentRecruitmentCycle();

    const cycle = await prisma.recruitmentCycle.findUnique({
      where: { label: cycleLabel },
    });

    if (!cycle) {
      return res.status(404).json({ error: "No active recruitment cycle found." });
    }

    const applicant = await prisma.applicant.findFirst({
      where: {
        cycleId: cycle.id,
        OR: [
          email ? { email } : undefined,
          name ? { name } : undefined,
        ].filter(Boolean)
      },
    });

    if (!applicant) {
      return res.status(404).json({ error: "Applicant not found." });
    }

    const event = await prisma.event.findFirst({
      where: { name: eventName, cycleId: cycle.id },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    const attendance = await prisma.attendance.findFirst({
      where: { applicantId: applicant.id, eventId: event.id },
    });

    if (!attendance) {
      return res.status(404).json({ error: "No attendance record found." });
    }

    res.json({
      valid: true,
      applicant: { id: applicant.id, name: applicant.name, email: applicant.email },
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error." });
  }
});

// Supported flag events and their corresponding Prisma models.
const FLAG_EVENT_MODELS = {
  "Info Night": "infoNightComment",
  "Speed Networking": "speedNetworkingComment",
};

// Shared handler for flag-event comment submissions (Info Night / Speed Networking).
async function submitFlagComment({ eventName, req, res }) {
  try {
    const { candidateEmail, proctorName, proctorEmail, flag, comment } = req.body;

    if (!candidateEmail || !proctorName || !proctorEmail || !comment) {
      return res.status(400).json({
        error: "candidateEmail, proctorName, proctorEmail, and comment are required.",
      });
    }

    const cycleLabel = getCurrentRecruitmentCycle();

    let cycle = await prisma.recruitmentCycle.findUnique({
      where: { label: cycleLabel },
    });
    if (!cycle) {
      cycle = await prisma.recruitmentCycle.create({ data: { label: cycleLabel } });
    }

    const applicant = await prisma.applicant.findUnique({
      where: { email_cycleId: { email: candidateEmail, cycleId: cycle.id } },
    });

    if (!applicant) {
      return res.status(404).json({ error: "Applicant not found." });
    }

    const event = await findOrCreateEvent({ name: eventName, cycleId: cycle.id });
    await ensureAttendance({ applicantId: applicant.id, eventId: event.id });

    const modelKey = FLAG_EVENT_MODELS[eventName];
    const record = await prisma[modelKey].upsert({
      where: {
        applicantId_proctorEmail_cycleId: {
          applicantId: applicant.id,
          proctorEmail,
          cycleId: cycle.id,
        },
      },
      update: {
        proctorName,
        flag: flag || null,
        comment,
      },
      create: {
        applicantId: applicant.id,
        cycleId: cycle.id,
        proctorName,
        proctorEmail,
        flag: flag || null,
        comment,
      },
    });

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: "Internal server error." });
  }
}

// POST /api/scoring/info-night - Submit Info Night flag/comment
app.post("/api/scoring/info-night", requireConsultantAuth, (req, res) =>
  submitFlagComment({ eventName: "Info Night", req, res })
);

// POST /api/scoring/speed-networking - Submit Speed Networking flag/comment
app.post("/api/scoring/speed-networking", requireConsultantAuth, (req, res) =>
  submitFlagComment({ eventName: "Speed Networking", req, res })
);

// GET /api/scoring/lookup-by-name - Look up applicants by partial name for flag events
app.get("/api/scoring/lookup-by-name", requireConsultantAuth, async (req, res) => {
  try {
    const { name, eventName, proctorEmail } = req.query;

    if (!name || !eventName || !proctorEmail) {
      return res.status(400).json({
        error: "name, eventName, and proctorEmail are required.",
      });
    }

    if (!FLAG_EVENT_MODELS[eventName]) {
      return res.status(400).json({
        error: `eventName must be one of: ${Object.keys(FLAG_EVENT_MODELS).join(", ")}.`,
      });
    }

    const cycleLabel = getCurrentRecruitmentCycle();
    const cycle = await prisma.recruitmentCycle.findUnique({
      where: { label: cycleLabel },
    });

    if (!cycle) {
      return res.status(404).json({ error: "No active recruitment cycle found." });
    }

    const applicants = await prisma.applicant.findMany({
      where: {
        cycleId: cycle.id,
        name: { contains: name, mode: "insensitive" },
      },
    });

    if (applicants.length === 0) {
      return res.status(404).json({ error: "No candidates found matching that name." });
    }

    const event = await prisma.event.findFirst({
      where: { name: eventName, cycleId: cycle.id },
    });

    const modelKey = FLAG_EVENT_MODELS[eventName];

    const results = await Promise.all(
      applicants.map(async (applicant) => {
        let hasAttendance = false;
        if (event) {
          const attendance = await prisma.attendance.findFirst({
            where: { applicantId: applicant.id, eventId: event.id },
          });
          hasAttendance = !!attendance;
        }

        const existing = await prisma[modelKey].findUnique({
          where: {
            applicantId_proctorEmail_cycleId: {
              applicantId: applicant.id,
              proctorEmail,
              cycleId: cycle.id,
            },
          },
        });

        return {
          name: applicant.name,
          email: applicant.email,
          hasAttendance,
          existingFlag: existing ? { flag: existing.flag, comment: existing.comment } : null,
        };
      })
    );

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Internal server error." });
  }
});

// Validate that a score is a number 1-5
function isValidScore(value) {
  return typeof value === "number" && !Number.isNaN(value) && value >= 1 && value <= 5;
}

// Ensure an applicant exists for the email in the cycle, creating one with the
// provided name if not found.
async function findOrCreateApplicant({ email, name, cycleId }) {
  const existing = await prisma.applicant.findUnique({
    where: { email_cycleId: { email, cycleId } },
  });
  if (existing) return existing;
  return prisma.applicant.create({
    data: { name: name || email, email, cycleId },
  });
}

// Ensure an event with the given name exists in the cycle.
async function findOrCreateEvent({ name, cycleId }) {
  const existing = await prisma.event.findFirst({
    where: { name, cycleId },
  });
  if (existing) return existing;
  return prisma.event.create({
    data: { name, date: new Date(), cycleId },
  });
}

// Ensure an attendance record exists for the applicant at the event.
async function ensureAttendance({ applicantId, eventId }) {
  const existing = await prisma.attendance.findFirst({
    where: { applicantId, eventId },
  });
  if (existing) return existing;
  return prisma.attendance.create({
    data: { applicantId, eventId },
  });
}

// Validate the per-category scores (each 1-5) on a candidate payload.
function validateCandidateScores(candidate) {
  const categories = ["communicationScore", "analyticalScore", "personableScore", "commitmentScore"];
  for (const category of categories) {
    if (!isValidScore(candidate[category])) {
      return `Candidate ${candidate.candidateEmail || candidate.candidateName || ""} has an invalid ${category} (must be a number between 1 and 5).`;
    }
  }
  return null;
}

// POST /api/scoring/case-study - Submit Case Study scores (batch)
app.post("/api/scoring/case-study", requireConsultantAuth, async (req, res) => {
  try {
    const { proctorName, proctorEmail, candidates } = req.body;

    if (!proctorName || !proctorEmail || !Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ error: "proctorName, proctorEmail, and a non-empty candidates array are required." });
    }

    const cycleLabel = getCurrentRecruitmentCycle();

    let cycle = await prisma.recruitmentCycle.findUnique({
      where: { label: cycleLabel },
    });
    if (!cycle) {
      cycle = await prisma.recruitmentCycle.create({ data: { label: cycleLabel } });
    }

    // Validate every candidate up front so we never partially commit.
    for (const candidate of candidates) {
      const { candidateName, candidateEmail } = candidate;
      if (!candidateEmail || !candidateName) {
        return res.status(400).json({ error: "Each candidate must have a candidateName and candidateEmail." });
      }
      const scoreError = validateCandidateScores(candidate);
      if (scoreError) {
        return res.status(400).json({ error: scoreError });
      }
    }

    // Resolve applicants, ensure event + attendance, and check for duplicates
    // before opening a transaction with the create operations.
    const event = await findOrCreateEvent({ name: "Case Study Night", cycleId: cycle.id });

    const createOperations = [];

    for (const candidate of candidates) {
      const {
        candidateName,
        candidateEmail,
        communicationScore,
        analyticalScore,
        personableScore,
        commitmentScore,
        communicationComment,
        analyticalComment,
        personableComment,
        commitmentComment,
        flag,
        flagComment,
      } = candidate;

      const applicant = await findOrCreateApplicant({
        email: candidateEmail,
        name: candidateName,
        cycleId: cycle.id,
      });

      const existingScore = await prisma.caseStudyScore.findUnique({
        where: {
          applicantId_proctorEmail_cycleId: {
            applicantId: applicant.id,
            proctorEmail,
            cycleId: cycle.id,
          },
        },
      });

      if (existingScore) {
        return res.status(409).json({
          error: "You have already submitted scores for this candidate for Case Study Night.",
        });
      }

      await ensureAttendance({ applicantId: applicant.id, eventId: event.id });

      const totalScore =
        0.35 * communicationScore +
        0.30 * analyticalScore +
        0.30 * personableScore +
        0.05 * commitmentScore;

      createOperations.push(
        prisma.caseStudyScore.create({
          data: {
            applicantId: applicant.id,
            cycleId: cycle.id,
            proctorName,
            proctorEmail,
            communicationScore,
            analyticalScore,
            personableScore,
            commitmentScore,
            totalScore,
            communicationComment: communicationComment || null,
            analyticalComment: analyticalComment || null,
            personableComment: personableComment || null,
            commitmentComment: commitmentComment || null,
            flag: flag || null,
            flagComment: flagComment || null,
          },
        })
      );
    }

    const results = await prisma.$transaction(createOperations);

    res.status(201).json(results);
  } catch (err) {
    res.status(500).json({ error: "Internal server error." });
  }
});

// GET /api/scoring/lookup-attendee - Look up candidate by email + event
app.get("/api/scoring/lookup-attendee", requireConsultantAuth, async (req, res) => {
  try {
    const { eventName, email } = req.query;

    if (!eventName || !email) {
      return res.status(400).json({ error: "eventName and email are required." });
    }

    const cycleLabel = getCurrentRecruitmentCycle();

    const cycle = await prisma.recruitmentCycle.findUnique({
      where: { label: cycleLabel },
    });

    if (!cycle) {
      return res.status(404).json({ error: "No active recruitment cycle found." });
    }

    const applicant = await prisma.applicant.findUnique({
      where: { email_cycleId: { email, cycleId: cycle.id } },
    });

    if (!applicant) {
      return res.status(404).json({ error: "Applicant not found." });
    }

    const event = await prisma.event.findFirst({
      where: { name: eventName, cycleId: cycle.id },
    });

    let hasAttendance = false;
    if (event) {
      const attendance = await prisma.attendance.findFirst({
        where: { applicantId: applicant.id, eventId: event.id },
      });
      hasAttendance = !!attendance;
    }

    res.json({ name: applicant.name, hasAttendance });
  } catch (err) {
    res.status(500).json({ error: "Internal server error." });
  }
});

// POST /api/scoring/assessment-center - Submit Assessment Center scores (batch)
const ASSESSMENT_CENTER_STATIONS = ["Pitch", "Logic", "Creativity", "Estimation"];

app.post("/api/scoring/assessment-center", requireConsultantAuth, async (req, res) => {
  try {
    const { proctorName, proctorEmail, station, candidates } = req.body;

    if (!proctorName || !proctorEmail || !Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ error: "proctorName, proctorEmail, and a non-empty candidates array are required." });
    }

    if (!station || !ASSESSMENT_CENTER_STATIONS.includes(station)) {
      return res.status(400).json({
        error: `station is required and must be one of: ${ASSESSMENT_CENTER_STATIONS.join(", ")}.`,
      });
    }

    const cycleLabel = getCurrentRecruitmentCycle();

    let cycle = await prisma.recruitmentCycle.findUnique({
      where: { label: cycleLabel },
    });
    if (!cycle) {
      cycle = await prisma.recruitmentCycle.create({ data: { label: cycleLabel } });
    }

    for (const candidate of candidates) {
      const { candidateName, candidateEmail } = candidate;
      if (!candidateEmail || !candidateName) {
        return res.status(400).json({ error: "Each candidate must have a candidateName and candidateEmail." });
      }
      const scoreError = validateCandidateScores(candidate);
      if (scoreError) {
        return res.status(400).json({ error: scoreError });
      }
    }

    const event = await findOrCreateEvent({ name: "Assessment Center", cycleId: cycle.id });

    const createOperations = [];

    for (const candidate of candidates) {
      const {
        candidateName,
        candidateEmail,
        communicationScore,
        analyticalScore,
        personableScore,
        commitmentScore,
        communicationComment,
        analyticalComment,
        personableComment,
        commitmentComment,
        flag,
        flagComment,
      } = candidate;

      const applicant = await findOrCreateApplicant({
        email: candidateEmail,
        name: candidateName,
        cycleId: cycle.id,
      });

      const existingScore = await prisma.assessmentCenterScore.findUnique({
        where: {
          applicantId_proctorEmail_station_cycleId: {
            applicantId: applicant.id,
            proctorEmail,
            station,
            cycleId: cycle.id,
          },
        },
      });

      if (existingScore) {
        return res.status(409).json({
          error: "You have already submitted scores for this candidate at this station.",
        });
      }

      await ensureAttendance({ applicantId: applicant.id, eventId: event.id });

      const totalScore =
        0.29 * communicationScore +
        0.36 * analyticalScore +
        0.29 * personableScore +
        0.06 * commitmentScore;

      createOperations.push(
        prisma.assessmentCenterScore.create({
          data: {
            applicantId: applicant.id,
            cycleId: cycle.id,
            proctorName,
            proctorEmail,
            station,
            communicationScore,
            analyticalScore,
            personableScore,
            commitmentScore,
            totalScore,
            communicationComment: communicationComment || null,
            analyticalComment: analyticalComment || null,
            personableComment: personableComment || null,
            commitmentComment: commitmentComment || null,
            flag: flag || null,
            flagComment: flagComment || null,
          },
        })
      );
    }

    const results = await prisma.$transaction(createOperations);

    res.status(201).json(results);
  } catch (err) {
    res.status(500).json({ error: "Internal server error." });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

