import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./NavBar.css";
import { NavLink } from "react-router-dom";

const NavBar = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo-link">
          <img src="/logo.svg" alt="Logo" className="navbar-logo" />
        </Link>
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "navbar-link navbar-link-active" : "navbar-link"
          }
        >
          <h2 style={{ fontWeight: "700" }}>Slugtistics</h2>
        </NavLink>
        <NavLink
          to="/all"
          className={({ isActive }) =>
            isActive ? "navbar-link navbar-link-active" : "navbar-link"
          }
        >
          <h2 style={{ color: "#c9c9ca" }}>All Courses</h2>
        </NavLink>
        <NavLink
          to="/ge"
          className={({ isActive }) =>
            isActive ? "navbar-link navbar-link-active" : "navbar-link"
          }
        >
          <h2 style={{ color: "#c9c9ca" }}>GE Search</h2>
        </NavLink>
      </div>
      <div className="navbar-right">
        <NavLink
          to="/about"
          className={({ isActive }) =>
            isActive ? "navbar-link navbar-link-active" : "navbar-link"
          }
        >
          <h2 style={{ color: "#c9c9ca" }}>About</h2>
        </NavLink>
      </div>
    </nav>
  );
};

export default NavBar;
