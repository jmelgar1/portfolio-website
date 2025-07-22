/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/setupTests.js"],
    globals: true,
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "build",
  },
  assetsInclude: ["**/*.glb"],
});
