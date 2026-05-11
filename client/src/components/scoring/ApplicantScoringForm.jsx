import "./ApplicantScoringForm.css";

const CATEGORIES = [
  { key: "communication", label: "Communication" },
  { key: "analytical", label: "Analytical / Strategy" },
  { key: "personable", label: "Personable" },
  { key: "commitment", label: "Commitment" },
];

function clampScore(rawValue) {
  if (rawValue === "") return "";
  const parsed = parseInt(rawValue, 10);
  if (Number.isNaN(parsed)) return "";
  const clamped = Math.max(1, Math.min(5, parsed));
  return String(clamped);
}

const ApplicantScoringForm = ({ candidate, weights, onChange, onEmailBlur }) => {
  const handleEmailChange = (event) => {
    onChange({
      email: event.target.value,
      lookupStatus: null,
      validated: false,
    });
  };

  const handleEmailBlur = (event) => {
    if (typeof onEmailBlur === "function") {
      onEmailBlur(event.target.value);
    }
  };

  const handleNameChange = (event) => {
    const value = event.target.value;
    onChange({
      name: value,
      validated: !!value.trim(),
    });
  };

  const handleScoreChange = (categoryKey) => (event) => {
    onChange({ [`${categoryKey}Score`]: clampScore(event.target.value) });
  };

  const handleCommentChange = (categoryKey) => (event) => {
    onChange({ [`${categoryKey}Comment`]: event.target.value });
  };

  const handleFlagToggle = (value) => {
    if (candidate.flag === value) {
      onChange({ flag: null, flagComment: "" });
      return;
    }
    onChange({ flag: value });
  };

  const handleFlagCommentChange = (event) => {
    onChange({ flagComment: event.target.value });
  };

  return (
    <div className="applicant-form">
      <div className="applicant-form__identity">
        <div className="scoring-form-group">
          <label>Candidate Email:</label>
          <input
            type="email"
            value={candidate.email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            placeholder="candidate@example.com"
          />
        </div>
        <div className="scoring-form-group">
          <label>Candidate Name:</label>
          <input
            type="text"
            value={candidate.name}
            onChange={handleNameChange}
            placeholder="First Last"
          />
        </div>
      </div>

      {candidate.lookupStatus === "not-found" && (
        <p className="applicant-form__notice">
          Not in attendance records — will be auto-enrolled on submission.
        </p>
      )}

      {CATEGORIES.map(({ key, label }) => {
        const weightPct = Math.round((weights?.[key] ?? 0) * 100);
        return (
          <div className="applicant-form__category" key={key}>
            <div className="applicant-form__category-header">
              <span className="applicant-form__category-label">
                {label} ({weightPct}%)
              </span>
              <div className="applicant-form__score-row">
                <label htmlFor={`score-${key}`}>Score:</label>
                <input
                  id={`score-${key}`}
                  type="number"
                  min={1}
                  max={5}
                  step={1}
                  className="applicant-form__score-input"
                  value={candidate[`${key}Score`]}
                  onChange={handleScoreChange(key)}
                  placeholder="1-5"
                />
              </div>
            </div>
            <textarea
              className="applicant-form__comment"
              rows={2}
              placeholder={`Comments for ${label}...`}
              value={candidate[`${key}Comment`]}
              onChange={handleCommentChange(key)}
            />
          </div>
        );
      })}

      <div className="applicant-form__flag-section">
        <label>Flag:</label>
        <div className="applicant-form__flag-row">
          <button
            type="button"
            className={`applicant-form__flag-btn applicant-form__flag-btn--green${
              candidate.flag === "green" ? " applicant-form__flag-btn--active-green" : ""
            }`}
            onClick={() => handleFlagToggle("green")}
          >
            Green Flag
          </button>
          <button
            type="button"
            className={`applicant-form__flag-btn applicant-form__flag-btn--red${
              candidate.flag === "red" ? " applicant-form__flag-btn--active-red" : ""
            }`}
            onClick={() => handleFlagToggle("red")}
          >
            Red Flag
          </button>
        </div>
        {candidate.flag && (
          <textarea
            className="applicant-form__comment"
            rows={2}
            placeholder="Add context for this flag..."
            value={candidate.flagComment}
            onChange={handleFlagCommentChange}
          />
        )}
      </div>
    </div>
  );
};

export default ApplicantScoringForm;
