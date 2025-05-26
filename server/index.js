// Import required libraries
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

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

app.post("/api/attendance", async (req, res) => {
    const { name, pid, eventName, recruitmentCycleLabel, eventDate } = req.body;
  
    if (!name || !pid || !eventName || !recruitmentCycleLabel || !eventDate) {
      return res.status(400).json({ error: "All fields are required." });
    }
  
    try {
      // 1. Find or create the recruitment cycle
      let cycle = await prisma.recruitmentCycle.findUnique({
        where: { label: recruitmentCycleLabel }
      });
  
      if (!cycle) {
        cycle = await prisma.recruitmentCycle.create({
          data: { label: recruitmentCycleLabel }
        });
      }
  
      // 2. Find or create the event
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
  
      // 3. Find or create the applicant
      let applicant = await prisma.applicant.findFirst({
        where: {
          pid: pid,
          cycleId: cycle.id
        }
      });
  
      if (!applicant) {
        applicant = await prisma.applicant.create({
          data: {
            name,
            pid,
            cycleId: cycle.id
          }
        });
      }
  
      // 4. Create the attendance record
      const attendance = await prisma.attendance.create({
        data: {
          applicantId: applicant.id,
          eventId: event.id
        }
      });
  
      res.status(201).json(attendance);
    } catch (err) {
      console.error("Error saving attendance:", err);
      res.status(500).json({ error: "Internal server error." });
    }
  });  
  
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

