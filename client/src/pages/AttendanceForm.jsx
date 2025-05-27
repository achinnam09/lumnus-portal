// This is the page where applicants will sign in during recruitment events
import { useState } from "react";
import axios from "axios"; // Used later to send form data to backend

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
            // Extract specific error message from backend
            const errorMessage = err.response?.data?.error || "There was an error submitting the form.";
            alert(`${errorMessage}`);
        }
    };



    return (
        <div>
          <h2>Recruitment Event Attendance</h2>
    
          <form onSubmit={handleSubmit}>
            <div>
              <label>Name:</label><br />
              <input 
                type="text" 
                name="name" 
                value={formData.name}
                onChange={handleChange}
                required 
              />
            </div>
    
            <div>
              <label>PID:</label><br />
              <input 
                type="text" 
                name="pid" 
                value={formData.pid}
                onChange={handleChange}
                required 
              />
            </div>
    
            <div>
              <label>Event Name:</label><br />
              <input 
                type="text" 
                name="event" 
                value={formData.event}
                onChange={handleChange}
                required 
              />
            </div>
    
            <button type="submit">Submit Attendance</button>
          </form>
        </div>
      );
};

export default AttendanceForm;