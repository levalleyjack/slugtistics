import React from "react";
import { Link } from "react-router-dom";
//e
const NavBar = () => {
  return (
    <nav>
      <div className="navbar-left">
        <img src="/logo.svg" alt="Logo" className="navbar-logo" />
        <Link to="/">
          <h1 className="navbar-title">Slugtistics</h1>
        </Link>
      </div>
      <ul className="navbar-right">
        <li>
          <Link to="/about"><h3 className="navbar-right">About</h3></Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
