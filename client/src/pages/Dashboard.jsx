import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import "./Dashboard.css";

const NOTES_STORAGE_KEY = "lumnus-dashboard-applicant-notes";

const SAMPLE_RESUME_PDF =
  "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

const initialApplicants = [
  {
    name: "Alex Chen",
    track: "Strategy",
    year: "2nd",
    major: "Economics",
    minor: "Data Science",
    gpa: "3.82",
    resumeUrl: SAMPLE_RESUME_PDF,
    csProctor: "Jordan Lee",
    acProctors: ["R. Patel", "M. Ortiz"],
    interviewers: ["A. Kim", "S. Brooks"],
    pitch: "8/10",
    logic: "7/10",
    creativity: "9/10",
    estimation: "6/10",
    interview: "8.5/10",
    attendance: ["IN", "CSN", "SN"],
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    status: "none",
    redFlag: true,
  },
  {
    name: "Sasha Kim",
    track: "Data Analytics",
    year: "3rd",
    major: "Cognitive Science",
    minor: "Computer Science",
    gpa: "3.91",
    resumeUrl: SAMPLE_RESUME_PDF,
    csProctor: "Taylor Nguyen",
    acProctors: ["K. Washington"],
    interviewers: ["L. Chen", "J. Park", "D. Ali"],
    pitch: "7/10",
    logic: "9/10",
    creativity: "6/10",
    estimation: "8/10",
    interview: "9/10",
    attendance: ["IN", "AC"],
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    status: "none",
  },
  {
    name: "Priya Sharma",
    track: "Strategy",
    year: "1st",
    major: "Political Science",
    minor: "Business",
    gpa: "3.67",
    resumeUrl: SAMPLE_RESUME_PDF,
    csProctor: "Chris Morgan",
    acProctors: ["E. Flores", "N. Shah", "H. Wright"],
    interviewers: ["M. Okonkwo"],
    pitch: "9/10",
    logic: "6/10",
    creativity: "7/10",
    estimation: "7.5/10",
    interview: "8/10",
    attendance: ["IN", "SN"],
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
    status: "none",
  },
  {
    name: "Marcus Li",
    track: "Data Analytics",
    year: "4th",
    major: "Data Science",
    minor: "Math",
    gpa: "3.78",
    resumeUrl: SAMPLE_RESUME_PDF,
    csProctor: "Jordan Lee",
    acProctors: ["R. Patel", "V. Singh"],
    interviewers: ["A. Kim", "T. Rossi"],
    pitch: "6.5/10",
    logic: "8.5/10",
    creativity: "6/10",
    estimation: "9/10",
    interview: "7.5/10",
    attendance: ["IN", "CSN", "AC"],
    photo: "https://randomuser.me/api/portraits/men/75.jpg",
    status: "none",
  },
  {
    name: "Emily Nguyen",
    track: "Strategy",
    year: "3rd",
    major: "Psychology",
    minor: "Marketing",
    gpa: "3.95",
    resumeUrl: SAMPLE_RESUME_PDF,
    csProctor: "Taylor Nguyen",
    acProctors: ["K. Washington", "B. Cole"],
    interviewers: ["S. Brooks", "L. Chen"],
    pitch: "9/10",
    logic: "7.5/10",
    creativity: "9.5/10",
    estimation: "6/10",
    interview: "8.8/10",
    attendance: ["CSN"],
    photo: "https://randomuser.me/api/portraits/women/65.jpg",
    status: "none",
  },
  {
    name: "Daniel Orozco",
    track: "Data Analytics",
    year: "2nd",
    major: "Computer Science",
    minor: "Statistics",
    gpa: "3.71",
    resumeUrl: SAMPLE_RESUME_PDF,
    csProctor: "Chris Morgan",
    acProctors: ["E. Flores"],
    interviewers: ["J. Park", "D. Ali", "M. Okonkwo"],
    pitch: "7.5/10",
    logic: "9/10",
    creativity: "7/10",
    estimation: "8/10",
    interview: "8.2/10",
    attendance: ["IN", "AC"],
    photo: "https://randomuser.me/api/portraits/men/81.jpg",
    status: "none",
  },
];

function loadNotesMap() {
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

function persistNotesMap(map) {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Private mode or quota — state still updates in memory
  }
}

const Dashboard = () => {
  const [search, setSearch] = useState("");
  const [applicants, setApplicants] = useState(initialApplicants);
  const [pendingStatus, setPendingStatus] = useState({});
  const [pendingRedFlag, setPendingRedFlag] = useState({});
  const [viewMode, setViewMode] = useState("board");
  const [boardFilter, setBoardFilter] = useState("all");
  const [singleFilter, setSingleFilter] = useState("unreviewed");
  const [singleIndex, setSingleIndex] = useState(0);
  const [notesByApplicant, setNotesByApplicant] = useState(loadNotesMap);
  const [notesApplicantName, setNotesApplicantName] = useState(null);
  const [notesSavedVisible, setNotesSavedVisible] = useState(false);
  const notesSavedDebounceRef = useRef(null);
  const notesSavedHideRef = useRef(null);

  const scheduleNotesSavedIndicator = useCallback(() => {
    if (notesSavedDebounceRef.current) {
      clearTimeout(notesSavedDebounceRef.current);
    }
    if (notesSavedHideRef.current) {
      clearTimeout(notesSavedHideRef.current);
    }
    setNotesSavedVisible(false);
    notesSavedDebounceRef.current = setTimeout(() => {
      notesSavedDebounceRef.current = null;
      setNotesSavedVisible(true);
      notesSavedHideRef.current = setTimeout(() => {
        notesSavedHideRef.current = null;
        setNotesSavedVisible(false);
      }, 1400);
    }, 450);
  }, []);

  useEffect(() => {
    return () => {
      if (notesSavedDebounceRef.current) {
        clearTimeout(notesSavedDebounceRef.current);
      }
      if (notesSavedHideRef.current) {
        clearTimeout(notesSavedHideRef.current);
      }
    };
  }, []);

  const handleStatusChange = (name, newStatus) => {
    setPendingStatus((prev) => ({
      ...prev,
      [name]: prev[name] === newStatus ? "none" : newStatus,
    }));
  };

  const getCurrentRedFlag = (applicant) => {
    if (applicant.name in pendingRedFlag) {
      return pendingRedFlag[applicant.name];
    }
    return applicant.redFlag === true;
  };

  const handleRedFlagToggle = (name) => {
    const applicant = applicants.find((a) => a.name === name);
    if (!applicant) return;
    const saved = applicant.redFlag === true;
    const current = name in pendingRedFlag ? pendingRedFlag[name] : saved;
    const nextVal = !current;
    setPendingRedFlag((prev) => {
      if (nextVal === saved) {
        const next = { ...prev };
        delete next[name];
        return next;
      }
      return { ...prev, [name]: nextVal };
    });
  };

  const applyChanges = () => {
    const updated = applicants.map((app) => ({
      ...app,
      status: pendingStatus[app.name] ?? app.status,
      redFlag:
        app.name in pendingRedFlag
          ? pendingRedFlag[app.name]
          : app.redFlag === true,
    }));
    setApplicants(updated);
    setPendingStatus({});
    setPendingRedFlag({});
  };

  const resetChanges = () => {
    setPendingStatus({});
    setPendingRedFlag({});
  };

  const confirmResetChanges = () => {
    const message =
      "Are you sure you want to reset? All unsaved changes (Pass, Reject, Accept, Flag) will be discarded.";
    if (window.confirm(message)) {
      resetChanges();
    }
  };

  const hasPendingChanges =
    Object.keys(pendingStatus).length > 0 ||
    Object.keys(pendingRedFlag).length > 0;

  const getCurrentStatus = (applicant) =>
    pendingStatus[applicant.name] ?? applicant.status;

  const baseList = useMemo(
    () =>
      applicants.filter((a) =>
        a.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [applicants, search],
  );

  const grouped = useMemo(() => {
    const statusOf = (a) => pendingStatus[a.name] ?? a.status;
    return {
      blue: baseList.filter((a) => statusOf(a) === "blue"),
      green: baseList.filter((a) => statusOf(a) === "green"),
      red: baseList.filter((a) => statusOf(a) === "red"),
      none: baseList.filter((a) => statusOf(a) === "none"),
    };
  }, [baseList, pendingStatus]);

  const singleList = useMemo(() => {
    const statusOf = (a) => pendingStatus[a.name] ?? a.status;
    return baseList.filter((a) => {
      const s = statusOf(a);
      if (singleFilter === "unreviewed") return s === "none";
      return s !== "none";
    });
  }, [baseList, singleFilter, pendingStatus]);

  useEffect(() => {
    setSingleIndex(0);
  }, [singleFilter, viewMode]);

  useEffect(() => {
    setSingleIndex((prev) => {
      if (singleList.length === 0) return 0;
      return Math.min(prev, singleList.length - 1);
    });
  }, [singleList.length, search]);

  const currentApplicant =
    singleList.length > 0 ? singleList[singleIndex] : null;

  useEffect(() => {
    if (viewMode === "single") {
      if (currentApplicant) {
        setNotesApplicantName(currentApplicant.name);
      } else {
        setNotesApplicantName(null);
      }
    }
  }, [viewMode, currentApplicant]);

  const handleNoteChange = (applicantName, value) => {
    setNotesByApplicant((prev) => {
      const next = { ...prev, [applicantName]: value };
      persistNotesMap(next);
      return next;
    });
    scheduleNotesSavedIndicator();
  };

  const renderApplicantCard = (applicant, options = {}) => {
    const { notesSelectable = false, isNotesTarget = false } = options;
    const status = getCurrentStatus(applicant);
    const redFlagOn = getCurrentRedFlag(applicant);

    const cardProps = notesSelectable
      ? {
          role: "button",
          tabIndex: 0,
          className: `applicant-card${isNotesTarget ? " applicant-card--notes-target" : ""}`,
          onClick: () => setNotesApplicantName(applicant.name),
          onKeyDown: (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setNotesApplicantName(applicant.name);
            }
          },
        }
      : {
          className: `applicant-card${isNotesTarget ? " applicant-card--notes-target" : ""}`,
        };

    return (
      <div key={applicant.name} {...cardProps}>
        <div className="applicant-photo-container">
          <img
            src={applicant.photo}
            alt={applicant.name}
            className="applicant-photo"
          />
          <div className="flag-buttons right-aligned">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRedFlagToggle(applicant.name);
              }}
              className={`status-btn status-btn--flag${redFlagOn ? " status-btn--flag-active" : ""}`}
            >
              Flag
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(applicant.name, "green");
              }}
              className={`status-btn ${status === "green" ? "green" : ""}`}
            >
              Pass
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(applicant.name, "red");
              }}
              className={`status-btn ${status === "red" ? "red" : ""}`}
            >
              Reject
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(applicant.name, "blue");
              }}
              className={`status-btn ${status === "blue" ? "blue" : ""}`}
            >
              Accept
            </button>
          </div>
        </div>
        <div className="applicant-info">
          <h3 className="applicant-name">{applicant.name}</h3>
          <div className="applicant-info-columns">
            <ul className="applicant-info-primary">
              <li>
                <strong>Track:</strong> {applicant.track}
              </li>
              <li>
                <strong>Year:</strong> {applicant.year}
              </li>
              <li>
                <strong>Major:</strong> {applicant.major}
              </li>
              <li>
                <strong>Minor:</strong> {applicant.minor}
              </li>
              <li>
                <strong>GPA:</strong> {applicant.gpa}
              </li>
              <li>
                <strong>Resume:</strong>{" "}
                <a
                  href={applicant.resumeUrl}
                  className="applicant-resume-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  Open resume
                </a>
              </li>
              <li>
                <strong>CS Proctors:</strong> {applicant.csProctor}
              </li>
              <li>
                <strong>AC proctors:</strong>{" "}
                {applicant.acProctors.join(", ")}
              </li>
              <li>
                <strong>Interviewers:</strong>{" "}
                {applicant.interviewers.join(", ")}
              </li>
              <li>
                <strong>Interview:</strong> {applicant.interview}
              </li>
              <li>
                <strong>Attendance:</strong> {applicant.attendance.join(", ")}
              </li>
            </ul>
            <div
              className="applicant-info-scores"
              aria-label="Category scores"
            >
              <div className="applicant-scores-stack">
                <div>
                  <strong>Pitch:</strong> {applicant.pitch}
                </div>
                <div>
                  <strong>Logic:</strong> {applicant.logic}
                </div>
                <div>
                  <strong>Creativity:</strong> {applicant.creativity}
                </div>
                <div>
                  <strong>Estimation:</strong> {applicant.estimation}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const cardOptionsFor = (applicant) => ({
    notesSelectable: viewMode === "board",
    isNotesTarget: notesApplicantName === applicant.name,
  });

  const renderSection = (title, color, list) =>
    list.length > 0 && (
      <div className="dashboard-section">
        <h2 className="dashboard-section-header" style={{ color }}>
          {title} ({list.length})
        </h2>
        {list.map((applicant) =>
          renderApplicantCard(applicant, cardOptionsFor(applicant)),
        )}
      </div>
    );

  const showReviewedSections =
    boardFilter === "all" || boardFilter === "reviewed";
  const showUnreviewedSection =
    boardFilter === "all" || boardFilter === "unreviewed";

  const activeNoteText =
    notesApplicantName != null
      ? notesByApplicant[notesApplicantName] ?? ""
      : "";

  const notesPanelBody = () => {
    if (viewMode === "single" && singleList.length === 0) {
      return (
        <p className="dashboard-notes-empty">
          No applicants in this queue. Notes are unavailable.
        </p>
      );
    }
    if (viewMode === "board" && !notesApplicantName) {
      return (
        <p className="dashboard-notes-empty">
          Click an applicant card to open their notes. Each person has their own
          notepad; edits save automatically.
        </p>
      );
    }
    if (notesApplicantName) {
      return (
        <>
          <label className="dashboard-notes-label" htmlFor="dashboard-applicant-notes">
            Notes for {notesApplicantName}
          </label>
          <textarea
            id="dashboard-applicant-notes"
            className="dashboard-notes-textarea"
            value={activeNoteText}
            onChange={(e) =>
              handleNoteChange(notesApplicantName, e.target.value)
            }
            placeholder="Private notes for this applicant…"
            aria-label={`Notes for ${notesApplicantName}`}
            rows={14}
          />
          <p className="dashboard-notes-saved" role="status" aria-live="polite">
            {notesSavedVisible ? "Saved" : "\u00a0"}
          </p>
        </>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar" aria-label="Dashboard controls">
        <h1 className="dashboard-title">Applicant Dashboard</h1>

        <div className="dashboard-toolbar">
          <div
            className="dashboard-view-toggle"
            role="group"
            aria-label="Dashboard layout"
          >
            <button
              type="button"
              className={`dashboard-segment ${viewMode === "board" ? "dashboard-segment--active" : ""}`}
              onClick={() => setViewMode("board")}
            >
              Scroll
            </button>
            <button
              type="button"
              className={`dashboard-segment ${viewMode === "single" ? "dashboard-segment--active" : ""}`}
              onClick={() => setViewMode("single")}
            >
              One at a time
            </button>
          </div>

          {viewMode === "board" && (
            <div
              className="dashboard-filter-group"
              role="group"
              aria-label="Review status filter"
            >
              <span className="dashboard-filter-label">Applicants</span>
              <div className="dashboard-chip-row">
                <button
                  type="button"
                  className={`dashboard-chip ${boardFilter === "all" ? "dashboard-chip--active" : ""}`}
                  onClick={() => setBoardFilter("all")}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`dashboard-chip ${boardFilter === "unreviewed" ? "dashboard-chip--active" : ""}`}
                  onClick={() => setBoardFilter("unreviewed")}
                >
                  Unreviewed
                </button>
                <button
                  type="button"
                  className={`dashboard-chip ${boardFilter === "reviewed" ? "dashboard-chip--active" : ""}`}
                  onClick={() => setBoardFilter("reviewed")}
                >
                  Reviewed
                </button>
              </div>
            </div>
          )}

          {viewMode === "single" && (
            <div
              className="dashboard-filter-group"
              role="group"
              aria-label="Queue filter"
            >
              <span className="dashboard-filter-label">Queue</span>
              <div className="dashboard-chip-row">
                <button
                  type="button"
                  className={`dashboard-chip ${singleFilter === "unreviewed" ? "dashboard-chip--active" : ""}`}
                  onClick={() => setSingleFilter("unreviewed")}
                >
                  Unreviewed
                </button>
                <button
                  type="button"
                  className={`dashboard-chip ${singleFilter === "completed" ? "dashboard-chip--active" : ""}`}
                  onClick={() => setSingleFilter("completed")}
                >
                  Completed
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="search-bar-wrapper">
          <input
            type="search"
            placeholder="Search by name…"
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search applicants by name"
          />
        </div>
        <div className="button-row">
          <button
            type="button"
            className={`apply-button ${hasPendingChanges ? "active" : ""}`}
            onClick={applyChanges}
            disabled={!hasPendingChanges}
          >
            Apply Changes
          </button>
          <button
            type="button"
            className="reset-button"
            onClick={confirmResetChanges}
            disabled={!hasPendingChanges}
          >
            Reset Changes
          </button>
        </div>
      </aside>

      <div className="dashboard-main">
        <div className="applicant-scroll-container">
          {viewMode === "board" && (
            <>
              {showReviewedSections &&
                renderSection("Accepted", "#2563eb", grouped.blue)}
              {showReviewedSections &&
                renderSection("Pass", "#2e7d32", grouped.green)}
              {showUnreviewedSection &&
                renderSection("Unreviewed", "#5c6b80", grouped.none)}
              {showReviewedSections &&
                renderSection("Rejected", "#c62828", grouped.red)}
            </>
          )}

          {viewMode === "single" && (
            <div className="dashboard-single">
              {singleList.length === 0 ? (
                <p className="dashboard-single-empty">
                  No applicants match this filter and search.
                </p>
              ) : (
                <>
                  <div className="dashboard-single-nav">
                    <button
                      type="button"
                      className="dashboard-single-arrow"
                      onClick={() =>
                        setSingleIndex((i) => Math.max(0, i - 1))
                      }
                      disabled={singleIndex <= 0}
                      aria-label="Previous applicant"
                    >
                      ←
                    </button>
                    <span className="dashboard-single-counter">
                      {singleIndex + 1} of {singleList.length}
                    </span>
                    <button
                      type="button"
                      className="dashboard-single-arrow"
                      onClick={() =>
                        setSingleIndex((i) =>
                          Math.min(singleList.length - 1, i + 1),
                        )
                      }
                      disabled={singleIndex >= singleList.length - 1}
                      aria-label="Next applicant"
                    >
                      →
                    </button>
                  </div>
                  {currentApplicant &&
                    renderApplicantCard(currentApplicant, {
                      notesSelectable: false,
                      isNotesTarget: true,
                    })}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <aside
        className="dashboard-notes-panel"
        aria-label="Applicant notes"
      >
        <h2 className="dashboard-notes-heading">Notes</h2>
        {notesPanelBody()}
      </aside>
    </div>
  );
};

export default Dashboard;
