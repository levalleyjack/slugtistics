import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, createTheme } from "@material-ui/core/styles"; // Import ThemeProvider and createTheme
import "./index.css";
import App from "./App";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
    success: { main: "#4caf50" },
  },
  typography: {
    fontFamily: "Roboto, Arial",
  },
});
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
