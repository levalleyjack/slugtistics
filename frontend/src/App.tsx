import "./App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NavBar from "./components/NavBar";
import HomePage from "./pages/slugtistics/HomePage";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";
import GeSearch from "./pages/class-search/GeSearch";
import { ReactNode } from "react";
import { Chatbot } from "./components/ChatBot";
import MajorSearch from "./pages/major-search/MajorSearch";
import { alpha, createTheme, ThemeProvider } from "@mui/material/styles";
import FeedbackButton from "./components/FeedbackButton";

const queryClient = new QueryClient();
const theme = createTheme({
  components: {
    MuiList: {
      styleOverrides: {
        root: {
          padding: 0,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: "12px 16px",

          display: "flex",
          gap: "10px",
          transition: "background-color 0.2s",
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            color: theme.palette.primary.main,
            "& .MuiSvgIcon-root": {
              color: theme.palette.primary.main,
            },
          },
          "&.Mui-selected": {
            color: theme.palette.text.primary,
            "& .MuiSvgIcon-root": {
              color: theme.palette.primary.main,
            },
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.16),
            },
          },
        }),
      },
    },
  },
});
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
            path="/class"
            element={
              <PageLayout title={"Class Search | Slugtistics"}>
                <GeSearch />
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
      <FeedbackButton />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
