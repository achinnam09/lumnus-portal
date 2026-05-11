import { useEffect, useMemo, useState } from "react";
import {
  checkAuth,
  lookupAttendee,
  lookupByName,
  submitCaseStudy,
  submitAssessmentCenter,
  submitInfoNight,
  submitSpeedNetworking,
} from "../utils/scoringApi";
import CandidateNav from "../components/scoring/CandidateNav";
import ApplicantScoringForm from "../components/scoring/ApplicantScoringForm";
import FlagForm from "../components/scoring/FlagForm";
import "./ScoringForm.css";

const EVENTS = ["Info Night", "Case Study Night", "Speed Networking", "Assessment Center"];
const FLAG_EVENTS = ["Info Night", "Speed Networking"];
const STATIONS = ["Pitch", "Logic", "Creativity", "Estimation"];
const WEIGHTS = {
  "Case Study Night": { communication: 0.35, analytical: 0.30, personable: 0.30, commitment: 0.05 },
  "Assessment Center": { communication: 0.29, analytical: 0.36, personable: 0.29, commitment: 0.06 },
};

const STAGE = {
  PASSWORD: "password",
  INTAKE: "intake",
  SCORING: "scoring",
};

const SCORE_KEYS = [
  "communicationScore",
  "analyticalScore",
  "personableScore",
  "commitmentScore",
];

function createBlankCandidate() {
  return {
    email: "",
    name: "",
    validated: false,
    lookupStatus: null,
    communicationScore: "",
    analyticalScore: "",
    personableScore: "",
    commitmentScore: "",
    communicationComment: "",
    analyticalComment: "",
    personableComment: "",
    commitmentComment: "",
    flag: null,
    flagComment: "",
  };
}

function createBlankFlagCandidate() {
  return {
    nameQuery: "",
    name: "",
    email: "",
    hasAttendance: false,
    lookupResults: [],
    lookupStatus: null,
    existingFlag: null,
    flag: null,
    comment: "",
  };
}

function blankCandidateForEvent(eventName) {
  return FLAG_EVENTS.includes(eventName)
    ? createBlankFlagCandidate()
    : createBlankCandidate();
}

function isValidScore(value) {
  if (value === "" || value === null || value === undefined) return false;
  const num = Number(value);
  return !Number.isNaN(num) && num >= 1 && num <= 5;
}

function computeWeightedScore(candidate, weights) {
  if (!weights) return null;
  const allFilled = SCORE_KEYS.every((key) => isValidScore(candidate[key]));
  if (!allFilled) return null;
  return (
    weights.communication * Number(candidate.communicationScore) +
    weights.analytical * Number(candidate.analyticalScore) +
    weights.personable * Number(candidate.personableScore) +
    weights.commitment * Number(candidate.commitmentScore)
  );
}

const ScoringForm = () => {
  // RBAC stub — replace with role check when RBAC is implemented
  const [stage, setStage] = useState(STAGE.PASSWORD);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  const [proctorName, setProctorName] = useState("");
  const [proctorEmail, setProctorEmail] = useState("");
  const [event, setEvent] = useState("");
  const [station, setStation] = useState("");
  const [intakeError, setIntakeError] = useState("");

  const [candidates, setCandidates] = useState([createBlankCandidate()]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [candidateErrors, setCandidateErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // RBAC stub — replace with role check when RBAC is implemented
  useEffect(() => {
    const stored = sessionStorage.getItem("consultantPassword");
    if (!stored) {
      setAuthChecked(true);
      return;
    }
    checkAuth(stored)
      .then(() => setStage(STAGE.INTAKE))
      .catch(() => sessionStorage.removeItem("consultantPassword"))
      .finally(() => setAuthChecked(true));
  }, []);

  const weights = WEIGHTS[event] || null;
  const current = candidates[currentIndex];
  const currentWeightedScore = useMemo(
    () => computeWeightedScore(current, weights),
    [current, weights]
  );

  const handleAuthSubmit = async (submitEvent) => {
    submitEvent.preventDefault();
    setAuthError("");
    try {
      await checkAuth(password);
      sessionStorage.setItem("consultantPassword", password);
      setStage(STAGE.INTAKE);
    } catch {
      setAuthError("Invalid password. Please try again.");
    }
  };

  const handleIntakeSubmit = (submitEvent) => {
    submitEvent.preventDefault();
    setIntakeError("");
    if (!proctorName.trim() || !proctorEmail.trim() || !event) {
      setIntakeError("Please complete all required fields.");
      return;
    }
    if (event === "Assessment Center" && !station) {
      setIntakeError("Please select a station for the Assessment Center.");
      return;
    }
    setCandidates([blankCandidateForEvent(event)]);
    setCurrentIndex(0);
    setCandidateErrors({});
    setError("");
    setSuccess("");
    setStage(STAGE.SCORING);
  };

  const handleBackToIntake = () => {
    setStage(STAGE.INTAKE);
    setCandidates([blankCandidateForEvent(event)]);
    setCurrentIndex(0);
    setCandidateErrors({});
    setError("");
    setSuccess("");
  };

  const updateCandidate = (index, updates) => {
    setCandidates((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  const handleEmailLookup = async (email) => {
    const trimmed = email.trim();
    if (!trimmed) return;
    try {
      const res = await lookupAttendee(event, trimmed);
      const found = res.data;
      updateCandidate(currentIndex, {
        name: found.name || "",
        validated: !!(found.name && found.name.trim()),
        lookupStatus: found.hasAttendance ? "found" : "found-no-attendance",
      });
    } catch (err) {
      if (err.response?.status === 404) {
        updateCandidate(currentIndex, { lookupStatus: "not-found" });
        return;
      }
      updateCandidate(currentIndex, { lookupStatus: "error" });
    }
  };

  const handleNameLookup = async (nameQuery) => {
    const trimmed = nameQuery.trim();
    if (!trimmed) return;
    try {
      const res = await lookupByName(event, trimmed, proctorEmail);
      const results = res.data;
      if (results.length === 1) {
        const match = results[0];
        updateCandidate(currentIndex, {
          name: match.name,
          email: match.email,
          hasAttendance: match.hasAttendance,
          existingFlag: match.existingFlag,
          lookupStatus: "found",
          lookupResults: [],
          validated: true,
        });
      } else {
        updateCandidate(currentIndex, {
          lookupStatus: "multiple",
          lookupResults: results,
        });
      }
    } catch (err) {
      if (err.response?.status === 404) {
        updateCandidate(currentIndex, { lookupStatus: "not-found" });
        return;
      }
      updateCandidate(currentIndex, { lookupStatus: "error" });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < candidates.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleAdd = () => {
    setCandidates((prev) => {
      const next = [...prev, blankCandidateForEvent(event)];
      setCurrentIndex(next.length - 1);
      return next;
    });
  };

  const handleRemove = () => {
    if (candidates.length === 1) return;
    setCandidates((prev) => prev.filter((_, i) => i !== currentIndex));
    setCurrentIndex((prev) => Math.min(prev, candidates.length - 2));
  };

  const validateAllCandidates = () => {
    const errors = {};
    candidates.forEach((candidate, index) => {
      if (!candidate.email.trim() || !candidate.name.trim()) {
        errors[index] = "Please provide both email and name.";
        return;
      }
      const missingScore = SCORE_KEYS.find((key) => !isValidScore(candidate[key]));
      if (missingScore) {
        errors[index] = "All four category scores (1-5) are required.";
      }
    });
    return errors;
  };

  const handleSubmit = async (submitEvent) => {
    submitEvent.preventDefault();
    setError("");
    setSuccess("");

    const errors = validateAllCandidates();
    setCandidateErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Please fix the highlighted candidate(s) before submitting.");
      return;
    }

    const candidatePayload = candidates.map((candidate) => ({
      candidateName: candidate.name.trim(),
      candidateEmail: candidate.email.trim(),
      communicationScore: Number(candidate.communicationScore),
      analyticalScore: Number(candidate.analyticalScore),
      personableScore: Number(candidate.personableScore),
      commitmentScore: Number(candidate.commitmentScore),
      communicationComment: candidate.communicationComment || null,
      analyticalComment: candidate.analyticalComment || null,
      personableComment: candidate.personableComment || null,
      commitmentComment: candidate.commitmentComment || null,
      flag: candidate.flag || null,
      flagComment: candidate.flagComment || null,
    }));

    setSubmitting(true);
    try {
      if (event === "Case Study Night") {
        await submitCaseStudy({
          proctorName: proctorName.trim(),
          proctorEmail: proctorEmail.trim(),
          candidates: candidatePayload,
        });
      } else {
        await submitAssessmentCenter({
          proctorName: proctorName.trim(),
          proctorEmail: proctorEmail.trim(),
          station,
          candidates: candidatePayload,
        });
      }
      setSuccess("All candidate scores submitted successfully!");
      setCandidates([blankCandidateForEvent(event)]);
      setCurrentIndex(0);
      setCandidateErrors({});
    } catch (err) {
      const status = err.response?.status;
      const serverMessage = err.response?.data?.error;
      if (status === 409 && serverMessage) {
        setError(serverMessage);
      } else {
        setError(serverMessage || "Failed to submit scores. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleFlagSubmit = async (submitEvent) => {
    submitEvent.preventDefault();
    setError("");
    setSuccess("");

    const errors = {};
    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i];
      if (!c.email || !c.name) {
        errors[i] = "Please select a candidate.";
        continue;
      }
      if (!c.comment.trim()) {
        errors[i] = "A comment is required.";
      }
    }
    if (Object.keys(errors).length > 0) {
      setCandidateErrors(errors);
      setError("Please fix the highlighted candidate(s) before submitting.");
      return;
    }
    setCandidateErrors({});

    const submitFn = event === "Info Night" ? submitInfoNight : submitSpeedNetworking;

    setSubmitting(true);
    try {
      for (const c of candidates) {
        await submitFn({
          candidateEmail: c.email,
          proctorName: proctorName.trim(),
          proctorEmail: proctorEmail.trim(),
          flag: c.flag || null,
          comment: c.comment.trim(),
        });
      }
      setSuccess("All flags submitted successfully!");
      setCandidates([createBlankFlagCandidate()]);
      setCurrentIndex(0);
      setCandidateErrors({});
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // RBAC stub — replace with role check when RBAC is implemented
  if (stage === STAGE.PASSWORD) {
    if (!authChecked) {
      return (
        <div className="scoring-page">
          <div className="scoring-card" />
        </div>
      );
    }
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

  if (stage === STAGE.INTAKE) {
    return (
      <div className="scoring-page">
        <form onSubmit={handleIntakeSubmit} className="scoring-card">
          <h2 className="scoring-title">Proctor & Event</h2>

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
            <label>Your Email:</label>
            <input
              type="email"
              value={proctorEmail}
              onChange={(e) => setProctorEmail(e.target.value)}
              required
            />
          </div>

          <div className="scoring-form-group">
            <label>Event:</label>
            <select
              value={event}
              onChange={(e) => {
                setEvent(e.target.value);
                if (e.target.value !== "Assessment Center") {
                  setStation("");
                }
              }}
              required
            >
              <option value="">-- Select an event --</option>
              {EVENTS.map((ev) => (
                <option key={ev} value={ev}>{ev}</option>
              ))}
            </select>
          </div>

          {event === "Assessment Center" && (
            <div className="scoring-form-group">
              <label>Station:</label>
              <select
                value={station}
                onChange={(e) => setStation(e.target.value)}
                required
              >
                <option value="">-- Select a station --</option>
                {STATIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {intakeError && <p className="scoring-error">{intakeError}</p>}

          <button type="submit" className="scoring-button">Continue</button>
        </form>
      </div>
    );
  }

  const isFlagEvent = FLAG_EVENTS.includes(event);
  const hasExistingFlag = isFlagEvent && candidates.some((c) => c.existingFlag !== null);
  const submitLabel = isFlagEvent
    ? hasExistingFlag
      ? submitting ? "Submitting..." : "Overwrite & Submit All"
      : submitting ? "Submitting..." : "Submit All Candidates"
    : submitting ? "Submitting..." : "Submit All Candidates";

  return (
    <div className="scoring-page">
      <form
        onSubmit={isFlagEvent ? handleFlagSubmit : handleSubmit}
        className="scoring-card scoring-card--wide"
      >
        <div className="scoring-header">
          <button
            type="button"
            className="scoring-back-link"
            onClick={handleBackToIntake}
          >
            &larr; Back
          </button>
          <div className="scoring-header__meta">
            <span className="scoring-header__event">{event}</span>
            {event === "Assessment Center" && station && (
              <span className="scoring-header__station">{station}</span>
            )}
          </div>
        </div>

        <CandidateNav
          candidates={candidates}
          currentIndex={currentIndex}
          onPrev={handlePrev}
          onNext={handleNext}
          onAdd={handleAdd}
          onRemove={handleRemove}
        />

        {isFlagEvent ? (
          <FlagForm
            candidate={current}
            onChange={(updates) => updateCandidate(currentIndex, updates)}
            onNameLookup={handleNameLookup}
          />
        ) : (
          <ApplicantScoringForm
            candidate={current}
            weights={weights}
            onChange={(updates) => updateCandidate(currentIndex, updates)}
            onEmailBlur={handleEmailLookup}
          />
        )}

        {!isFlagEvent && currentWeightedScore !== null && (
          <div className="scoring-total">
            <span>Weighted Score:</span>
            <span className="scoring-total__value">
              {currentWeightedScore.toFixed(2)} / 5
            </span>
          </div>
        )}

        {candidateErrors[currentIndex] && (
          <p className="scoring-error">{candidateErrors[currentIndex]}</p>
        )}

        {error && <p className="scoring-error">{error}</p>}
        {success && <p className="scoring-success">{success}</p>}

        <button
          type="submit"
          className="scoring-button"
          disabled={submitting}
        >
          {submitLabel}
        </button>
      </form>
    </div>
  );
};

export default ScoringForm;
