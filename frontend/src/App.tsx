import "./App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";
import GeSearch from "./pages/GeSearch";
import AllCourses from "./pages/AllCourses";
import { ReactNode } from "react";
import { Chatbot } from "./components/ChatBot";
import MajorSearch from "./major/MajorSearch";

const queryClient = new QueryClient();

const PageLayout = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  document.title = title;
  return <div className="page-container">{children}</div>;
};

const AppContent = () => {
  const location = useLocation();
  //const showChatbot = location.pathname === '/ge' || location.pathname === '/all';

  return (
    <div className="App">
      <NavBar />
      {/*showChatbot && <Chatbot />*/}
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
          <Route
            path="/major"
            element={
              <PageLayout title={"Major Search | Slugtistics"}>
                <MajorSearch />
              </PageLayout>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;