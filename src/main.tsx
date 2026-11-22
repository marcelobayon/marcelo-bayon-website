import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/global.css";

// On the resume.* subdomain, land visitors straight on the railway. Done
// before React mounts so there is no flash of the landing page. Deep links
// (e.g. /resume, /resume#resume-text) are left alone.
if (
  window.location.hostname.startsWith("resume.") &&
  window.location.pathname === "/"
) {
  window.history.replaceState(null, "", "/resume" + window.location.hash);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
