import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; 
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";
import GeSearch from "./pages/GeSearch.tsx";

const queryClient = new QueryClient(); 

function App() {
  return (
    <QueryClientProvider client={queryClient}> 
      <BrowserRouter>
        <div className="App">
          <NavBar />
          <div id="page-body">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/ge" element={<GeSearch />} />
              {/*
              <Route path="*" element={<NotFoundPage />} />
              */}
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
