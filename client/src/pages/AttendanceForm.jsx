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

        try {
            // TODO: replace with actual backend endpoint
            const res = await axios.post("http://localhost:3000/api/attendance", formData);
            alert("Attendance recorded successfully!");
            // Optionally reset form
            setFormData({ name: "", pid: "", event: "" });
        } catch (err) {
            console.error(err);
            alert("There was an error submitting the form.");
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