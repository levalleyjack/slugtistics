import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { StyledExpandIcon } from "../Constants";
import "./NavBar.css";
import { useMediaQuery } from "@mui/material";
const NavBar = () => {
  const isMobile = useMediaQuery("(max-width:768px)");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const location = useLocation();

  const isInDropdownRoute = ["/all", "/ge"].includes(location.pathname);

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
          <NavLink
            to={isInDropdownRoute ? location.pathname : "/all"}
            className={({ isActive }) =>
              `navbar-link ${isInDropdownRoute ? "navbar-link-active" : ""}`
            }
          >
            <h2>
              Class Search
              <StyledExpandIcon 
                expanded={isHovering} 
                sx={{ fontSize: isMobile? "0.8rem" : "1.2rem"}} 
              />
            </h2>
          </NavLink>
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
