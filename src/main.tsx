import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { loadContent } from "./lib/content";
import "./styles.css";

/*
 * O content.json diz qual imagem ou vídeo entra em cada área de mockup.
 * Ele é lido antes do primeiro render para a apresentação já nascer certa.
 */
loadContent().finally(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
