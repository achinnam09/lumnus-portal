import { useState, useEffect } from "react";
import { checkAuth } from "../utils/scoringApi";
import InfoNightForm from "../components/scoring/InfoNightForm";
import CaseStudyForm from "../components/scoring/CaseStudyForm";
import "./ConsultantScoring.css";

const EVENTS = [
  "Info Night",
  "Case Study Night",
  "Speed Networking",
  "Assessment Center",
  "Interview",
];

const ConsultantScoring = () => {
  const [password, setPassword] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [authError, setAuthError] = useState("");

  const [proctorName, setProctorName] = useState("");
  const [proctorPid, setProctorPid] = useState("");
  const [proctorLocked, setProctorLocked] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState("");
  const [eventDropdown, setEventDropdown] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("consultantPassword");
    if (stored) {
      checkAuth(stored)
        .then(() => setIsAuthed(true))
        .catch(() => sessionStorage.removeItem("consultantPassword"));
    }
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      await checkAuth(password);
      sessionStorage.setItem("consultantPassword", password);
      setIsAuthed(true);
    } catch {
      setAuthError("Invalid password. Please try again.");
    }
  };

  const handleProctorSubmit = (e) => {
    e.preventDefault();
    setProctorLocked(true);
  };

  const handleEventSelect = (e) => {
    e.preventDefault();
    setSelectedEvent(eventDropdown);
  };

  const handleChangeProctor = () => {
    setProctorLocked(false);
    setSelectedEvent("");
    setEventDropdown("");
  };

  const handleBackToEvents = () => {
    setSelectedEvent("");
    setEventDropdown("");
  };

  /* ---------- Gate 1: Password ---------- */
  if (!isAuthed) {
    return (
      <div className="scoring-page">
        <form onSubmit={handleAuthSubmit} className="scoring-card">
          <h2 className="scoring-title">Consultant Scoring</h2>
          <p className="scoring-subtitle">Enter the consultant password to continue.</p>

          <div className="scoring-form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {authError && <p className="scoring-error">{authError}</p>}

          <button type="submit" className="scoring-button">Enter</button>
        </form>
      </div>
    );
  }

  /* ---------- Gate 2: Proctor Identity ---------- */
  if (!proctorLocked) {
    return (
      <div className="scoring-page">
        <form onSubmit={handleProctorSubmit} className="scoring-card">
          <h2 className="scoring-title">Proctor Identity</h2>

          <div className="scoring-form-group">
            <label>Your Name:</label>
            <input
              type="text"
              value={proctorName}
              onChange={(e) => setProctorName(e.target.value)}
              required
            />
          </div>

          <div className="scoring-form-group">
            <label>Your PID:</label>
            <input
              type="text"
              value={proctorPid}
              onChange={(e) => setProctorPid(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="scoring-button">Continue</button>
        </form>
      </div>
    );
  }

  /* ---------- Gate 3: Event Selection ---------- */
  if (!selectedEvent) {
    return (
      <div className="scoring-page">
        <form onSubmit={handleEventSelect} className="scoring-card">
          <h2 className="scoring-title">Select Event</h2>

          <div className="scoring-form-group">
            <label>Event:</label>
            <select
              value={eventDropdown}
              onChange={(e) => setEventDropdown(e.target.value)}
              required
            >
              <option value="">-- Select an event --</option>
              {EVENTS.map((ev) => (
                <option key={ev} value={ev}>{ev}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="scoring-button">Select</button>

          <button
            type="button"
            className="scoring-button scoring-button--secondary"
            onClick={handleChangeProctor}
          >
            Change Proctor
          </button>
        </form>
      </div>
    );
  }

  /* ---------- Gate 4: Event-specific Form ---------- */
  return (
    <div className="scoring-page">
      <div className="scoring-card">
        <button
          type="button"
          className="scoring-back-link"
          onClick={handleBackToEvents}
        >
          &larr; Back to Events
        </button>

        {selectedEvent === "Info Night" && (
          <InfoNightForm proctorName={proctorName} proctorPid={proctorPid} />
        )}

        {selectedEvent === "Case Study Night" && (
          <CaseStudyForm proctorName={proctorName} proctorPid={proctorPid} />
        )}

        {selectedEvent !== "Info Night" && selectedEvent !== "Case Study Night" && (
          <p className="scoring-coming-soon">
            Scoring form for {selectedEvent} coming soon.
          </p>
        )}
      </div>
    </div>
  );
};

export default ConsultantScoring;
