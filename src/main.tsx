import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";
import "./styles.css";

async function bootstrap() {
  if (import.meta.env.VITE_ENABLE_MOCKS !== "false") {
    const { worker } = await import("./app/mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass", quiet: true });
  }

  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error("Root element was not found.");

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

void bootstrap().catch((error: unknown) => {
  console.error("Unable to start the marketplace application.", error);
  document.body.textContent = "Não foi possível iniciar a aplicação. Recarregue a página.";
});
