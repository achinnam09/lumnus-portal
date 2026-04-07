import { useState } from "react";
import { validateAttendance, submitInfoNight } from "../../utils/scoringApi";
import "./InfoNightForm.css";

const InfoNightForm = ({ proctorName, proctorPid }) => {
  const [candidatePid, setCandidatePid] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [candidateId, setCandidateId] = useState(null);
  const [validated, setValidated] = useState(false);

  const [flag, setFlag] = useState(null);
  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleValidate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await validateAttendance(candidatePid, "Info Night");
      setCandidateName(res.data.applicant.name);
      setCandidateId(res.data.applicant.id);
      setValidated(true);
    } catch (err) {
      const msg = err.response?.data?.error || "No attendance record found for this PID.";
      setError(msg);
    }
  };

  const handleFlagToggle = (value) => {
    setFlag((prev) => (prev === value ? null : value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await submitInfoNight({
        candidatePid,
        candidateName,
        candidateId,
        proctorName,
        proctorPid,
        flag,
        comment,
      });
      setSuccess("Score submitted successfully!");
      setCandidatePid("");
      setCandidateName("");
      setCandidateId(null);
      setValidated(false);
      setFlag(null);
      setComment("");
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to submit score. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setCandidatePid("");
    setCandidateName("");
    setCandidateId(null);
    setValidated(false);
    setFlag(null);
    setComment("");
    setError("");
    setSuccess("");
  };

  return (
    <div className="info-night-form">
      <h3 className="info-night-form__title">Info Night Scoring</h3>

      {success && <p className="scoring-success">{success}</p>}
      {error && <p className="scoring-error">{error}</p>}

      {/* Step 1: Validate candidate PID */}
      {!validated && (
        <form onSubmit={handleValidate}>
          <div className="scoring-form-group">
            <label>Candidate PID:</label>
            <input
              type="text"
              value={candidatePid}
              onChange={(e) => setCandidatePid(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="scoring-button">
            Validate Attendance
          </button>
        </form>
      )}

      {/* Step 2: Scoring form */}
      {validated && (
        <form onSubmit={handleSubmit}>
          <div className="info-night-form__candidate-display">
            <span className="info-night-form__candidate-label">Candidate:</span>
            <span className="info-night-form__candidate-name">{candidateName}</span>
          </div>

          {/* Flag toggle buttons */}
          <div className="scoring-form-group">
            <label>Flag:</label>
            <div className="info-night-form__flag-row">
              <button
                type="button"
                className={`info-night-form__flag-btn info-night-form__flag-btn--green ${flag === "green" ? "info-night-form__flag-btn--active-green" : ""}`}
                onClick={() => handleFlagToggle("green")}
              >
                Green Flag
              </button>
              <button
                type="button"
                className={`info-night-form__flag-btn info-night-form__flag-btn--red ${flag === "red" ? "info-night-form__flag-btn--active-red" : ""}`}
                onClick={() => handleFlagToggle("red")}
              >
                Red Flag
              </button>
            </div>
          </div>

          {/* Comment */}
          <div className="scoring-form-group">
            <label>Comment:</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Enter your observations about this candidate..."
              required
            />
          </div>

          <button
            type="submit"
            className="scoring-button"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Score"}
          </button>

          <button
            type="button"
            className="scoring-button scoring-button--secondary"
            onClick={resetForm}
          >
            Clear / Next Candidate
          </button>
        </form>
      )}
    </div>
  );
};

export default InfoNightForm;
