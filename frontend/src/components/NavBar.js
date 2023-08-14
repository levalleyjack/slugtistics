import React from "react";
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <nav>
      <div className="navbar-left">
        <img src="/mylogo.svg" alt="Logo" className="navbar-logo" />
        <Link to="/">
          <h1 className="navbar-title">Slugtistics</h1>
        </Link>
      </div>
      <ul className="navbar-right">
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/contact">Contact Us</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
