import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";

// Importing our 3 individual page components
import AttendanceForm from "./pages/AttendanceForm";
import ApplicationForm from "./pages/ApplicationForm";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function App() {
  return (
    <div className="app-wrapper">
      {/* Page title + top navigation */}
      <header>
        <h1 className="main-title">Lumnus Recruiting Portal</h1>
        <Navbar />
      </header>

      <main className="page-content">
        {/* All route definitions go inside <Routes> */}
        <Routes>
          {/* When user visits /attendance, show AttendanceForm component */}
          <Route path="/attendance" element={<AttendanceForm />} />

          {/* When user visits /apply, show ApplicationForm component */}
          <Route path="/apply" element={<ApplicationForm />} />

          {/* When user visits /dashboard, show Dashboard component */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
