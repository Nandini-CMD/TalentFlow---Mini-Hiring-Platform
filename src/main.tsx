import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeApp } from "./lib/init";

// Initialize the app with MSW and seed data
initializeApp().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
