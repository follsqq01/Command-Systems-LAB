import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Forum } from "./Forum";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Forum />
  </StrictMode>,
);
