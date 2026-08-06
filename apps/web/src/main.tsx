import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initTelegramApp } from "./telegram";
import { LanguageProvider } from "./i18n/LanguageContext";
import App from "./App";
import "leaflet/dist/leaflet.css";
import "./index.css";

initTelegramApp();

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </LanguageProvider>
  </React.StrictMode>,
);
