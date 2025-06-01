// AttendanceForm.jsx
import { useState } from "react";
import axios from "axios"; // Used to send form data to backend
import "./AttendanceForm.css"; // External stylesheet for layout and styling

// Utility function to auto-fill recruitment cycle
function getCurrentRecruitmentCycle() {
  const now = new Date();
  const month = now.getMonth(); // 0 = January, 11 = December
  const year = now.getFullYear();
  const season = month >= 8 && month <= 10 ? "Fall" : "Spring";
  return `${season}-${year}`;
}

const AttendanceForm = () => {
  // Local state to track form inputs
  const [formData, setFormData] = useState({
    name: "",
    pid: "",
    event: ""
  });

  // Handle input changes and update state
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submission logic
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      pid: formData.pid,
      eventName: formData.event,
      eventDate: new Date().toISOString(),
      recruitmentCycleLabel: getCurrentRecruitmentCycle()
    };

    try {
      await axios.post("http://localhost:3000/api/attendance", payload);
      alert("Attendance recorded successfully!");
      // Optionally reset form
      setFormData({ name: "", pid: "", event: "" });
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "There was an error submitting the form.";
      alert(errorMessage);
    }
  };

  return (
    <div className="attendance-page">
      <form onSubmit={handleSubmit} className="attendance-form">
        <h2 className="form-title">Recruitment Event Attendance</h2>

        {/* Name input */}
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* PID input */}
        <div className="form-group">
          <label>PID:</label>
          <input
            type="text"
            name="pid"
            value={formData.pid}
            onChange={handleChange}
            required
          />
        </div>

        {/* Event dropdown */}
        <div className="form-group">
          <label>Event Name:</label>
          <select
            name="event"
            value={formData.event}
            onChange={handleChange}
            required
          >
            <option value="">-- Select an event --</option>
            <option value="Info Night">Info Night</option>
            <option value="Case Study Night">Case Study Night</option>
            <option value="Speed Networking">Speed Networking</option>
            <option value="Assessment Center">Assessment Center</option>
          </select>
        </div>

        {/* Submit button */}
        <button type="submit" className="submit-button">
          Submit Attendance
        </button>
      </form>
    </div>
  );
};

export default AttendanceForm;