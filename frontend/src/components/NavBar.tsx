import React from "react";
import { Link } from "react-router-dom";
//import { useLocalStorage } from "@uidotdev/usehooks"
const NavBar = () => {
  //const [lightMode, setLightMode] = useLocalStorage("lightmode", true);
  return (
    <nav>
      <div className="navbar-left">
        <img src="/logo.svg" alt="Logo" className="navbar-logo" />
        <Link to="/">
          <h1 className="navbar-title">Slugtistics</h1>
        </Link>
        <Link to="/ge">
          <h3 className="navbar-title">GE Search</h3>
        </Link>
      </div>
      <ul className="navbar-right">
        <li>
          {/*
          <>
            <button onClick={() => { setLightMode(!lightMode) }}>
              {lightMode ? <><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
              </> : <><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
              </>}
            </button>
          </>
          */}
          <Link to="/about"><h3 className="navbar-right">About</h3></Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
