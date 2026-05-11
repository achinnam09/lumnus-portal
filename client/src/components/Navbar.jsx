import { NavLink } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar" aria-label="Main">
      <ul>
        <li>
          <NavLink
            to="/attendance"
            className={({ isActive }) => (isActive ? "navbar__link--active" : undefined)}
          >
            Attendance
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/apply"
            className={({ isActive }) => (isActive ? "navbar__link--active" : undefined)}
          >
            Application
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? "navbar__link--active" : undefined)}
          >
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/scoring"
            className={({ isActive }) => (isActive ? "navbar__link--active" : undefined)}
          >
            Scoring
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
