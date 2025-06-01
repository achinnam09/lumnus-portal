import React, { useState } from 'react';
import "./Dashboard.css";

const initialApplicants = [
  {
    name: "Alex Chen",
    track: "Strategy",
    year: "2nd",
    major: "Economics",
    minor: "Data Science",
    pitch: "8/10",
    logic: "7/10",
    creativity: "9/10",
    estimation: "6/10",
    interview: "8.5/10",
    attendance: ["IN", "CSN", "SN"],
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    status: "none"
  },
  {
    name: "Sasha Kim",
    track: "Data Analytics",
    year: "3rd",
    major: "Cognitive Science",
    minor: "Computer Science",
    pitch: "7/10",
    logic: "9/10",
    creativity: "6/10",
    estimation: "8/10",
    interview: "9/10",
    attendance: ["IN", "AC"],
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    status: "none"
  },
  {
    name: "Priya Sharma",
    track: "Strategy",
    year: "1st",
    major: "Political Science",
    minor: "Business",
    pitch: "9/10",
    logic: "6/10",
    creativity: "7/10",
    estimation: "7.5/10",
    interview: "8/10",
    attendance: ["IN", "SN"],
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
    status: "none"
  },
  {
    name: "Marcus Li",
    track: "Data Analytics",
    year: "4th",
    major: "Data Science",
    minor: "Math",
    pitch: "6.5/10",
    logic: "8.5/10",
    creativity: "6/10",
    estimation: "9/10",
    interview: "7.5/10",
    attendance: ["IN", "CSN", "AC"],
    photo: "https://randomuser.me/api/portraits/men/75.jpg",
    status: "none"
  },
  {
    name: "Emily Nguyen",
    track: "Strategy",
    year: "3rd",
    major: "Psychology",
    minor: "Marketing",
    pitch: "9/10",
    logic: "7.5/10",
    creativity: "9.5/10",
    estimation: "6/10",
    interview: "8.8/10",
    attendance: ["CSN"],
    photo: "https://randomuser.me/api/portraits/women/65.jpg",
    status: "none"
  },
  {
    name: "Daniel Orozco",
    track: "Data Analytics",
    year: "2nd",
    major: "Computer Science",
    minor: "Statistics",
    pitch: "7.5/10",
    logic: "9/10",
    creativity: "7/10",
    estimation: "8/10",
    interview: "8.2/10",
    attendance: ["IN", "AC"],
    photo: "https://randomuser.me/api/portraits/men/81.jpg",
    status: "none"
  }
];

const Dashboard = () => {
  const [search, setSearch] = useState("");
  const [applicants, setApplicants] = useState(initialApplicants);

  const handleStatusChange = (index, newStatus) => {
    const updated = [...applicants];
    updated[index].status = updated[index].status === newStatus ? "none" : newStatus;
    setApplicants(updated);
  };

  const sortPriority = { blue: 0, green: 1, red: 2, none: 3 };
  const filteredApplicants = applicants
    .filter(applicant => applicant.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortPriority[a.status] - sortPriority[b.status]);

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Applicant Dashboard</h1>
        <input
          type="text"
          placeholder="Search by name..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <hr className="dashboard-divider" />
      </div>

      <div className="applicant-scroll-container">
        {filteredApplicants.map((applicant, index) => (
          <div key={index} className="applicant-card">
            <div className="applicant-photo-container">
              <img src={applicant.photo} alt={`${applicant.name}`} className="applicant-photo" />
              <div className="flag-buttons right-aligned">
                <button
                  onClick={() => handleStatusChange(index, 'red')}
                  className={`status-btn ${applicant.status === 'red' ? 'red' : ''}`}
                >R</button>
                <button
                  onClick={() => handleStatusChange(index, 'green')}
                  className={`status-btn ${applicant.status === 'green' ? 'green' : ''}`}
                >F</button>
                <button
                  onClick={() => handleStatusChange(index, 'blue')}
                  className={`status-btn ${applicant.status === 'blue' ? 'blue' : ''}`}
                >A</button>
              </div>
            </div>
            <div className="applicant-info">
              <h3 className="applicant-name">{applicant.name}</h3>
              <ul>
                <li><strong>Track:</strong> {applicant.track}</li>
                <li><strong>Year:</strong> {applicant.year}</li>
                <li><strong>Major:</strong> {applicant.major}</li>
                <li><strong>Minor:</strong> {applicant.minor}</li>
                <li><strong>Pitch:</strong> {applicant.pitch}</li>
                <li><strong>Logic:</strong> {applicant.logic}</li>
                <li><strong>Creativity:</strong> {applicant.creativity}</li>
                <li><strong>Estimation:</strong> {applicant.estimation}</li>
                <li><strong>Interview:</strong> {applicant.interview}</li>
                <li><strong>Attendance:</strong> {applicant.attendance.join(', ')}</li>
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;