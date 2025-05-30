// Import required libraries
import express from "express";
import cors from "cors";
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

    const resumeUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/resumes/${resumePath}`;
    const headshotUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/headshots/${headshotPath}`;

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
  
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

