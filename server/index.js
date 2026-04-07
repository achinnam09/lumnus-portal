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
      name, pid, email, year, major, minor, track,
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
    let applicant = await prisma.applicant.findUnique({
      where: {
        pid_cycleId: { pid, cycleId: cycle.id}, // compound unique
      },
    });
    if (!applicant) {
      applicant = await prisma.applicant.create({
        data: {
          name,
          pid,
          cycleId: cycle.id,
        },
      });
    }

    // Step 3: Upload files to Supabase
    const resumePath = `${pid}-${uuidv4()}.pdf`
    const headshotPath = `${pid}-${uuidv4()}.${headshotFile.mimetype.split("/")[1]}`;

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
  const { name, pid, eventName, recruitmentCycleLabel, eventDate } = req.body;

  // Basic field validation
  if (!name || !pid || !eventName || !recruitmentCycleLabel || !eventDate) {
    return res.status(400).json({ error: "All fields are required." });
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

    // 3. Check for existing applicant with same PID in this cycle
    let applicant = await prisma.applicant.findFirst({
      where: {
        pid,
        cycleId: cycle.id
      }
    });

    // If applicant exists, reuse it. If not, create a new one
    if (!applicant) {
      applicant = await prisma.applicant.create({
        data: {
          name,
          pid,
          cycleId: cycle.id
        }
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
    const { pid, eventName } = req.query;

    if (!pid || !eventName) {
      return res.status(400).json({ error: "pid and eventName are required." });
    }

    const cycleLabel = getCurrentRecruitmentCycle();

    const cycle = await prisma.recruitmentCycle.findUnique({
      where: { label: cycleLabel },
    });

    if (!cycle) {
      return res.status(404).json({ error: "No active recruitment cycle found." });
    }

    const applicant = await prisma.applicant.findUnique({
      where: { pid_cycleId: { pid, cycleId: cycle.id } },
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
      applicant: { id: applicant.id, name: applicant.name, pid: applicant.pid },
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error." });
  }
});

// POST /api/scoring/info-night - Submit Info Night comment
app.post("/api/scoring/info-night", requireConsultantAuth, async (req, res) => {
  try {
    const { candidatePid, proctorName, proctorPid, flag, comment } = req.body;

    if (!comment) {
      return res.status(400).json({ error: "Comment is required." });
    }

    if (!candidatePid || !proctorName || !proctorPid) {
      return res.status(400).json({ error: "candidatePid, proctorName, and proctorPid are required." });
    }

    const cycleLabel = getCurrentRecruitmentCycle();

    const cycle = await prisma.recruitmentCycle.findUnique({
      where: { label: cycleLabel },
    });

    if (!cycle) {
      return res.status(404).json({ error: "No active recruitment cycle found." });
    }

    const applicant = await prisma.applicant.findUnique({
      where: { pid_cycleId: { pid: candidatePid, cycleId: cycle.id } },
    });

    if (!applicant) {
      return res.status(404).json({ error: "Applicant not found." });
    }

    const infoNightEvent = await prisma.event.findFirst({
      where: { name: "Info Night", cycleId: cycle.id },
    });

    if (!infoNightEvent) {
      return res.status(404).json({ error: "Candidate has no attendance record for Info Night" });
    }

    const attendance = await prisma.attendance.findFirst({
      where: { applicantId: applicant.id, eventId: infoNightEvent.id },
    });

    if (!attendance) {
      return res.status(404).json({ error: "Candidate has no attendance record for Info Night" });
    }

    const record = await prisma.infoNightComment.upsert({
      where: {
        applicantId_proctorPid_cycleId: {
          applicantId: applicant.id,
          proctorPid,
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
        proctorPid,
        flag: flag || null,
        comment,
      },
    });

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: "Internal server error." });
  }
});

// POST /api/scoring/case-study - Submit Case Study scores (batch)
app.post("/api/scoring/case-study", requireConsultantAuth, async (req, res) => {
  try {
    const { proctorName, proctorPid, candidates } = req.body;

    if (!proctorName || !proctorPid || !Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ error: "proctorName, proctorPid, and a non-empty candidates array are required." });
    }

    const cycleLabel = getCurrentRecruitmentCycle();

    const cycle = await prisma.recruitmentCycle.findUnique({
      where: { label: cycleLabel },
    });

    if (!cycle) {
      return res.status(404).json({ error: "No active recruitment cycle found." });
    }

    const caseStudyEvent = await prisma.event.findFirst({
      where: { name: "Case Study Night", cycleId: cycle.id },
    });

    if (!caseStudyEvent) {
      return res.status(404).json({ error: "Case Study Night event not found." });
    }

    const upsertOperations = [];

    for (const candidate of candidates) {
      const { candidatePid, rawScores, communicationComment, analyticalComment, personableComment, commitmentComment } = candidate;

      if (!candidatePid || !rawScores) {
        return res.status(400).json({ error: "Each candidate must have candidatePid and rawScores." });
      }

      const categories = ["communication", "analytical", "personable", "commitment"];
      for (const category of categories) {
        const scores = rawScores[category];
        if (!scores || typeof scores !== "object") {
          return res.status(400).json({ error: `rawScores.${category} is required and must be an object.` });
        }
        const nonNullValues = Object.values(scores).filter((v) => v !== null && v !== undefined);
        if (nonNullValues.length === 0) {
          return res.status(400).json({ error: `rawScores.${category} must have at least 1 non-null value.` });
        }
        for (const val of nonNullValues) {
          if (typeof val !== "number" || val < 0 || val > 100) {
            return res.status(400).json({ error: `rawScores.${category} values must be numbers between 0 and 100.` });
          }
        }
      }

      const applicant = await prisma.applicant.findUnique({
        where: { pid_cycleId: { pid: candidatePid, cycleId: cycle.id } },
      });

      if (!applicant) {
        return res.status(404).json({ error: `Applicant with PID ${candidatePid} not found.` });
      }

      const attendance = await prisma.attendance.findFirst({
        where: { applicantId: applicant.id, eventId: caseStudyEvent.id },
      });

      if (!attendance) {
        return res.status(404).json({ error: `Candidate ${candidatePid} has no attendance record for Case Study Night.` });
      }

      const computeAverage = (categoryScores) => {
        const values = Object.values(categoryScores).filter((v) => v !== null && v !== undefined);
        return values.reduce((sum, val) => sum + val, 0) / values.length;
      };

      const communicationScore = computeAverage(rawScores.communication);
      const analyticalScore = computeAverage(rawScores.analytical);
      const personableScore = computeAverage(rawScores.personable);
      const commitmentScore = computeAverage(rawScores.commitment);
      const totalScore =
        0.35 * communicationScore +
        0.30 * analyticalScore +
        0.30 * personableScore +
        0.05 * commitmentScore;

      upsertOperations.push(
        prisma.caseStudyScore.upsert({
          where: {
            applicantId_proctorPid_cycleId: {
              applicantId: applicant.id,
              proctorPid,
              cycleId: cycle.id,
            },
          },
          update: {
            proctorName,
            communicationScore,
            analyticalScore,
            personableScore,
            commitmentScore,
            totalScore,
            rawScores,
            communicationComment: communicationComment || null,
            analyticalComment: analyticalComment || null,
            personableComment: personableComment || null,
            commitmentComment: commitmentComment || null,
          },
          create: {
            applicantId: applicant.id,
            cycleId: cycle.id,
            proctorName,
            proctorPid,
            communicationScore,
            analyticalScore,
            personableScore,
            commitmentScore,
            totalScore,
            rawScores,
            communicationComment: communicationComment || null,
            analyticalComment: analyticalComment || null,
            personableComment: personableComment || null,
            commitmentComment: commitmentComment || null,
          },
        })
      );
    }

    const results = await prisma.$transaction(upsertOperations);

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

