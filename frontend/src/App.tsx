import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";
import GeSearch from "./pages/GeSearch";
import AllCourses from "./pages/AllCourses";

const queryClient = new QueryClient();
const PageLayout = ({ title, children }) => {
  document.title = title;
  return <div className="page-container">{children}</div>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="App">
          <NavBar />
          <div id="page-body">
            <Routes>
              <Route
                path="/"
                element={
                  <PageLayout title={"Slugtistics"}>
                    <HomePage />
                  </PageLayout>
                }
              />
              <Route
                path="/about"
                element={
                  <PageLayout title={"About | Slugtistics"}>
                    <AboutPage />
                  </PageLayout>
                }
              />
              <Route
                path="/ge"
                element={
                  <PageLayout title={"GE Search | Slugtistics"}>
                    <GeSearch />
                  </PageLayout>
                }
              />
              <Route
                path="/all"
                element={
                  <PageLayout title={"All Courses | Slugtistics"}>
                    <AllCourses />
                  </PageLayout>
                }
              />

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
