import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // Enable React support and quick page updates while students edit components.
  plugins: [react()],
  server: {
    // Keep the frontend on the workshop's documented port instead of silently choosing another.
    port: 5173,
    strictPort: true,
    proxy: {
      // Forward browser requests through Vite to the local Python server to avoid cross-origin calls.
      "/api": {
        target: "http://127.0.0.1:8000",
        // Remove /api so the backend receives /predict rather than /api/predict.
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
