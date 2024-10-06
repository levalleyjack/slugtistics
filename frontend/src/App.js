import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";
import ReactGA from 'react-ga4';

ReactGA.initialize('G-ZHMQHZTF71');

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <NavBar />
        <div id="page-body">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            {/*
            <Route path="*" element={<NotFoundPage />} />
  */}
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
