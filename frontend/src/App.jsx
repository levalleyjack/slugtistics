import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";
import { useLocalStorage } from "@uidotdev/usehooks"


function App() {
  const [lightMode, _setLightMode] = useLocalStorage("lightmode", true);
  return (
    <BrowserRouter>
      <div className={"App" + (lightMode ? '' : ' darkmode')}>
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
