import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@kerak/shared": resolve(__dirname, "../../packages/shared/src/index.ts"),
    },
  },
  server: {
    host: true,
    port: 5173,
    // Dev'da cloudflared/ngrok kabi tunnel orqali kirish uchun (tasodifiy subdomain nomi bilan)
    allowedHosts: true,
  },
});
