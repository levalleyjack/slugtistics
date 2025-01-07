import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { StyledExpandIcon } from "../Constants";
import "./NavBar.css";
const NavBar = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const location = useLocation();

  const isInDropdownRoute = ["/all", "/ge"].includes(location.pathname);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseEnter = () => {
    setIsHovering(true);
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setIsDropdownOpen(false);
  };

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
          <h2>Slugtistics</h2>
        </NavLink>
        <div
          className="dropdown-wrapper"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            className={`navbar-link ${
              isInDropdownRoute ? "navbar-link-active" : ""
            }`}
            aria-expanded={isDropdownOpen}
          >
            <h2 style={{ color: isInDropdownRoute ? "#ffc107" : "#c9c9ca" }}>
              Class Search
              <StyledExpandIcon expanded={isHovering} />
            </h2>
          </button>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <NavLink
                to="/all"
                className={({ isActive }) =>
                  `dropdown-item ${isActive ? "dropdown-item-active" : ""}`
                }
              >
                <h2>All Courses</h2>
              </NavLink>
              <NavLink
                to="/ge"
                className={({ isActive }) =>
                  `dropdown-item ${isActive ? "dropdown-item-active" : ""}`
                }
              >
                <h2>GE Search</h2>
              </NavLink>
            </div>
          )}
        </div>
      </div>
      <div className="navbar-right">
        <NavLink
          to="/about"
          className={({ isActive }) =>
            isActive ? "navbar-link navbar-link-active" : "navbar-link"
          }
        >
          <h2>About</h2>
        </NavLink>
      </div>
    </nav>
  );
};

export default NavBar;
