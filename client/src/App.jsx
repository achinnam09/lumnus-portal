import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
// Importing our 3 individual page components
import AttendanceForm from "./pages/AttendanceForm";
import ApplicationForm from "./pages/ApplicationForm";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div>
      <h1>Lumnus Recruiting Portal</h1>

      <Navbar />

      {/* All route definitions go inside <Routes> */}
      <Routes>
        {/* When user visits /attendance, show AttendanceForm component */}
        <Route path="/attendance" element={<AttendanceForm />} />

        {/* When user visits /apply, show ApplicationForm component */}
        <Route path="/apply" element={<ApplicationForm />} />

        {/* When user visits /dashboard, show Dashboard component */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default App;
