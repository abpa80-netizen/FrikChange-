import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import "./index.css";

// Montage sur le conteneur Recharts de la section Admin
function mountRechartsDashboard() {
  const rechartsContainer = document.getElementById("analytics-recharts-root");
  if (rechartsContainer && !rechartsContainer.hasAttribute("data-react-mounted")) {
    rechartsContainer.setAttribute("data-react-mounted", "true");
    const root = createRoot(rechartsContainer);
    root.render(
      <StrictMode>
        <AnalyticsDashboard />
      </StrictMode>
    );
  }
}

// Essai immédiat ou dès chargement du DOM
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountRechartsDashboard);
} else {
  mountRechartsDashboard();
}

// Support pour appel manuel au cas où la section est affichée ultérieurement
(window as any).mountRechartsDashboard = mountRechartsDashboard;
