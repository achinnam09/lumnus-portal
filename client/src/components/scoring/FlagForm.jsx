import "./FlagForm.css";

const FlagForm = ({ candidate, onChange, onNameLookup }) => {
  const handleNameChange = (event) => {
    onChange({ nameQuery: event.target.value });
  };

  const handleNameBlur = (event) => {
    if (typeof onNameLookup === "function") {
      onNameLookup(event.target.value);
    }
  };

  const handleSelectResult = (result) => {
    onChange({
      name: result.name,
      email: result.email,
      hasAttendance: result.hasAttendance,
      existingFlag: result.existingFlag,
      lookupStatus: "found",
      lookupResults: [],
      validated: true,
    });
  };

  const handleChange = () => {
    onChange({
      name: "",
      email: "",
      lookupStatus: null,
      nameQuery: "",
      existingFlag: null,
      flag: null,
      comment: "",
      validated: false,
    });
  };

  const handleFlagToggle = (value) => {
    if (candidate.flag === value) {
      onChange({ flag: null });
      return;
    }
    onChange({ flag: value });
  };

  const handleCommentChange = (event) => {
    onChange({ comment: event.target.value });
  };

  const isFound = candidate.lookupStatus === "found";
  const isMultiple = candidate.lookupStatus === "multiple";
  const isNotFound = candidate.lookupStatus === "not-found";
  const isError = candidate.lookupStatus === "error";

  return (
    <div className="flag-form">
      <div className="flag-form__identity">
        {!isFound && (
          <div className="scoring-form-group">
            <label>Candidate Name:</label>
            <input
              type="text"
              value={candidate.nameQuery}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              placeholder="Start typing the candidate's name..."
            />
          </div>
        )}

        {isFound && (
          <div className="flag-form__resolved">
            <div>
              <div className="flag-form__resolved-name">{candidate.name}</div>
              <div className="flag-form__resolved-email">{candidate.email}</div>
            </div>
            <button
              type="button"
              className="flag-form__change-btn"
              onClick={handleChange}
            >
              Change
            </button>
          </div>
        )}
      </div>

      {isNotFound && (
        <p className="flag-form__notice">No candidate found with that name.</p>
      )}

      {isError && (
        <p className="flag-form__notice">
          Something went wrong searching for that name. Please try again.
        </p>
      )}

      {isMultiple && candidate.lookupResults.length > 0 && (
        <div className="flag-form__picker">
          <p className="flag-form__picker-label">
            Select the correct candidate:
          </p>
          {candidate.lookupResults.map((result) => (
            <button
              type="button"
              key={result.email}
              className="flag-form__picker-option"
              onClick={() => handleSelectResult(result)}
            >
              <span className="flag-form__picker-option-name">
                {result.name} ({result.email})
              </span>
              <span
                className={`flag-form__picker-option--attendance${
                  result.hasAttendance
                    ? " flag-form__picker-option--attendance-yes"
                    : " flag-form__picker-option--attendance-no"
                }`}
              >
                {result.hasAttendance ? "Attended" : "No attendance"}
              </span>
            </button>
          ))}
        </div>
      )}

      {isFound && candidate.existingFlag !== null && (
        <div className="flag-form__warning">
          You previously flagged this candidate as{" "}
          <strong>{candidate.existingFlag.flag || "no flag"}</strong>: &quot;
          {candidate.existingFlag.comment}&quot;. Submitting will overwrite.
        </div>
      )}

      {isFound && (
        <>
          <div className="flag-form__flag-section">
            <label>Flag:</label>
            <div className="flag-form__flag-row">
              <button
                type="button"
                className={`flag-form__flag-btn flag-form__flag-btn--green${
                  candidate.flag === "green" ? " flag-form__flag-btn--active-green" : ""
                }`}
                onClick={() => handleFlagToggle("green")}
              >
                Green Flag
              </button>
              <button
                type="button"
                className={`flag-form__flag-btn flag-form__flag-btn--red${
                  candidate.flag === "red" ? " flag-form__flag-btn--active-red" : ""
                }`}
                onClick={() => handleFlagToggle("red")}
              >
                Red Flag
              </button>
            </div>
          </div>

          <div className="scoring-form-group">
            <label>Comment:</label>
            <textarea
              className="flag-form__comment"
              rows={4}
              placeholder="Share your impression of this candidate..."
              value={candidate.comment}
              onChange={handleCommentChange}
              required
            />
          </div>
        </>
      )}
    </div>
  );
};

export default FlagForm;
