import { useState } from "react";
import CandidateNav from "./CandidateNav";
import { validateAttendance, submitCaseStudy } from "../../utils/scoringApi";
import "./CaseStudyForm.css";

const CATEGORIES = {
  communication: {
    label: "Communication",
    weight: 0.35,
    criteria: [
      { key: "articulates", label: "Clearly articulates ideas and arguments" },
      { key: "listens", label: "Listens actively and builds upon others' points" },
      { key: "inclusive", label: "Being inclusive and inviting quieter members to speak" },
      { key: "energy", label: "Speaks with energy and enthusiasm" },
      { key: "compromising", label: "Compromising when conflict arises" }
    ]
  },
  analytical: {
    label: "Analytical/Strategy",
    weight: 0.30,
    criteria: [
      { key: "creative", label: "Offers creative and unique ideas" },
      { key: "structured", label: "Presents ideas in a logical and structured format" },
      { key: "interprets", label: "Interprets questions accurately" },
      { key: "numbers", label: "Comfortable with numbers" }
    ]
  },
  personable: {
    label: "Personable",
    weight: 0.30,
    criteria: [
      { key: "friendly", label: "Friendly to proctor and group members" },
      { key: "positive", label: "Positive and optimistic" },
      { key: "acceptsCriticism", label: "Accepts criticism and feedback" },
      { key: "constructive", label: "Provides constructive criticism" }
    ]
  },
  commitment: {
    label: "Commitment",
    weight: 0.05,
    criteria: [
      { key: "effort", label: "Consistently puts in effort" },
      { key: "interest", label: "Shows genuine interest in the activity" }
    ]
  }
};

const CATEGORY_KEYS = Object.keys(CATEGORIES);

function createBlankCandidate() {
  return {
    pid: "",
    name: "",
    validated: false,
    rawScores: {
      communication: { articulates: "", listens: "", inclusive: "", energy: "", compromising: "" },
      analytical: { creative: "", structured: "", interprets: "", numbers: "" },
      personable: { friendly: "", positive: "", acceptsCriticism: "", constructive: "" },
      commitment: { effort: "", interest: "" }
    },
    communicationComment: "",
    analyticalComment: "",
    personableComment: "",
    commitmentComment: ""
  };
}

function computeScores(candidate) {
  const categoryScores = {};
  let allCategoriesScored = true;

  for (const [catKey, catDef] of Object.entries(CATEGORIES)) {
    const values = catDef.criteria
      .map((c) => candidate.rawScores[catKey][c.key])
      .filter((v) => v !== "" && v !== null && v !== undefined)
      .map(Number);

    if (values.length === 0) {
      categoryScores[catKey] = null;
      allCategoriesScored = false;
    } else {
      categoryScores[catKey] = values.reduce((sum, v) => sum + v, 0) / values.length;
    }
  }

  let totalScore = null;
  if (allCategoriesScored) {
    totalScore = CATEGORY_KEYS.reduce((sum, key) => {
      return sum + categoryScores[key] * CATEGORIES[key].weight;
    }, 0);
  }

  return { categoryScores, totalScore };
}

const CaseStudyForm = ({ proctorName, proctorPid }) => {
  const [candidates, setCandidates] = useState([createBlankCandidate()]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    communication: true,
    analytical: true,
    personable: true,
    commitment: true
  });
  const [validationError, setValidationError] = useState("");

  const current = candidates[currentIndex];
  const { categoryScores, totalScore } = computeScores(current);

  const toggleSection = (catKey) => {
    setExpandedSections((prev) => ({ ...prev, [catKey]: !prev[catKey] }));
  };

  const updateCandidate = (index, updater) => {
    setCandidates((prev) => {
      const updated = [...prev];
      updated[index] = typeof updater === "function" ? updater(updated[index]) : { ...updated[index], ...updater };
      return updated;
    });
  };

  const updateScore = (category, criterion, value) => {
    updateCandidate(currentIndex, (c) => ({
      ...c,
      rawScores: {
        ...c.rawScores,
        [category]: {
          ...c.rawScores[category],
          [criterion]: value
        }
      }
    }));
  };

  const updateComment = (category, value) => {
    updateCandidate(currentIndex, (c) => ({
      ...c,
      [`${category}Comment`]: value
    }));
  };

  const handleValidate = async () => {
    setValidationError("");
    const pid = current.pid.trim();
    if (!pid) {
      setValidationError("Please enter a PID.");
      return;
    }

    try {
      const res = await validateAttendance(pid, "Case Study Night");
      updateCandidate(currentIndex, { name: res.data.applicant.name, validated: true });
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to validate attendance.";
      setValidationError(msg);
    }
  };

  const handleAdd = () => {
    setCandidates((prev) => {
      setCurrentIndex(prev.length);
      return [...prev, createBlankCandidate()];
    });
  };

  const handleRemove = () => {
    if (candidates.length === 1) return;
    setCandidates((prev) => prev.filter((_, i) => i !== currentIndex));
    setCurrentIndex((prev) => Math.min(prev, candidates.length - 2));
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < candidates.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i];
      if (!c.validated) {
        setError(`Candidate ${i + 1} has not been validated.`);
        return;
      }

      for (const [catKey, catDef] of Object.entries(CATEGORIES)) {
        const hasAtLeastOne = catDef.criteria.some(
          (cr) => c.rawScores[catKey][cr.key] !== "" && c.rawScores[catKey][cr.key] !== null
        );
        if (!hasAtLeastOne) {
          setError(`Candidate ${i + 1} (${c.name}) needs at least 1 score in ${catDef.label}.`);
          return;
        }
      }
    }

    const payload = {
      proctorName,
      proctorPid,
      candidates: candidates.map((c) => {
        const convertedScores = {};
        for (const catKey of CATEGORY_KEYS) {
          convertedScores[catKey] = {};
          for (const cr of CATEGORIES[catKey].criteria) {
            const val = c.rawScores[catKey][cr.key];
            convertedScores[catKey][cr.key] = val === "" ? null : Number(val);
          }
        }

        return {
          candidatePid: c.pid,
          candidateName: c.name,
          rawScores: convertedScores,
          communicationComment: c.communicationComment || null,
          analyticalComment: c.analyticalComment || null,
          personableComment: c.personableComment || null,
          commitmentComment: c.commitmentComment || null
        };
      })
    };

    setSubmitting(true);
    try {
      await submitCaseStudy(payload);
      setSuccess("All candidate scores submitted successfully!");
      setCandidates([createBlankCandidate()]);
      setCurrentIndex(0);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to submit scores.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleScoreChange = (category, criterion, rawValue) => {
    if (rawValue === "") {
      updateScore(category, criterion, "");
      return;
    }
    const num = parseInt(rawValue, 10);
    if (Number.isNaN(num)) return;
    const clamped = Math.max(0, Math.min(100, num));
    updateScore(category, criterion, String(clamped));
  };

  return (
    <div className="case-study-page">
      <form className="case-study-form" onSubmit={handleSubmit}>
        <h2 className="case-study-form__title">Case Study Night Scoring</h2>

        <CandidateNav
          candidates={candidates}
          currentIndex={currentIndex}
          onPrev={handlePrev}
          onNext={handleNext}
          onAdd={handleAdd}
          onRemove={handleRemove}
        />

        {!current.validated ? (
          <div className="case-study-form__validate">
            <label>Candidate PID:</label>
            <input
              type="text"
              value={current.pid}
              onChange={(e) => updateCandidate(currentIndex, { pid: e.target.value })}
              placeholder="Enter PID"
            />
            <button type="button" onClick={handleValidate}>
              Validate Attendance
            </button>
            {validationError && (
              <p className="case-study-form__error">{validationError}</p>
            )}
          </div>
        ) : (
          <>
            {CATEGORY_KEYS.map((catKey) => {
              const cat = CATEGORIES[catKey];
              const isExpanded = expandedSections[catKey];
              const avgDisplay = categoryScores[catKey] !== null
                ? categoryScores[catKey].toFixed(1)
                : "--";

              return (
                <div className="case-study-form__section" key={catKey}>
                  <button
                    type="button"
                    className="case-study-form__section-header"
                    onClick={() => toggleSection(catKey)}
                  >
                    <span className="case-study-form__section-arrow">
                      {isExpanded ? "\u25BC" : "\u25B6"}
                    </span>
                    <span>{cat.label} ({cat.weight * 100}%)</span>
                    <span className="case-study-form__section-avg">
                      Avg: {avgDisplay}/100
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="case-study-form__section-body">
                      {cat.criteria.map((cr) => (
                        <div className="case-study-form__criterion" key={cr.key}>
                          <span className="case-study-form__criterion-label">{cr.label}</span>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={1}
                            className="case-study-form__score-input"
                            value={current.rawScores[catKey][cr.key]}
                            onChange={(e) => handleScoreChange(catKey, cr.key, e.target.value)}
                            placeholder="0-100"
                          />
                        </div>
                      ))}
                      <textarea
                        className="case-study-form__comment"
                        rows={3}
                        placeholder={`Comments for ${cat.label}...`}
                        value={current[`${catKey}Comment`]}
                        onChange={(e) => updateComment(catKey, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            <div className="case-study-form__summary">
              <h3>Score Summary</h3>
              {CATEGORY_KEYS.map((catKey) => {
                const cat = CATEGORIES[catKey];
                const avg = categoryScores[catKey];
                return (
                  <div className="case-study-form__summary-row" key={catKey}>
                    <span>{cat.label}:</span>
                    <span>{avg !== null ? `${avg.toFixed(1)}/100` : "--"} (x{cat.weight})</span>
                  </div>
                );
              })}
              <div className="case-study-form__summary-total">
                <span>Total:</span>
                <span>{totalScore !== null ? `${totalScore.toFixed(1)}/100` : "--"}</span>
              </div>
            </div>
          </>
        )}

        {error && <p className="case-study-form__error">{error}</p>}
        {success && <p className="case-study-form__success">{success}</p>}

        {current.validated && (
          <button
            type="submit"
            className="case-study-form__submit"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit All Candidates"}
          </button>
        )}
      </form>
    </div>
  );
};

export default CaseStudyForm;
