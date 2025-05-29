// This is the page where applicants will sign in during recruitment events
import { useState } from "react";
import axios from "axios"; // Used later to send form data to backend
import "./AttendanceForm.css"; // External stylesheet for layout and styling

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
      eventDate: new Date().toISOString(), // or let user choose date
      recruitmentCycleLabel: "Spring-2025" // eventually make this dynamic
    };

    try {
      const res = await axios.post("http://localhost:3000/api/attendance", payload);
      alert("Attendance recorded successfully!");
      // Optionally reset form
      setFormData({ name: "", pid: "", event: "" });
    } catch (err) {
      console.error(err);
      alert("There was an error submitting the form.");
    }
  };

  // Render form UI
  return (
    <div className="attendance-page">
      <div className="form-container">
        <h2 className="form-title">Recruitment Event Attendance</h2>

        <form onSubmit={handleSubmit} className="attendance-form">
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

          {/* Event Name input */}
          <div className="form-group">
            <label>Event Name:</label>
            <input 
              type="text" 
              name="event" 
              value={formData.event}
              onChange={handleChange}
              required 
            />
          </div>

          {/* Submit button */}
          <button type="submit" className="submit-button">Submit Attendance</button>
        </form>
      </div>
    </div>
  );
};

export default AttendanceForm;
