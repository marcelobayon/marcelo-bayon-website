/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2020",
    sourcemap: false,
    rollupOptions: {
      output: {
        // Keep the heavy 3D libraries in their own chunk so the main site
        // (and the /resume HTML shell) stays small and loads fast. The 3D
        // scene itself is lazy-loaded, so this chunk is only fetched on demand.
        manualChunks: {
          three: ["three"],
          r3f: ["@react-three/fiber", "@react-three/drei"],
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
