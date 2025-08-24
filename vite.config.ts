import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'https://portfolio-api-dev.onrender.com',
        changeOrigin: true,
        secure: true,
      }
    }
  },
  build: {
    outDir: "build",
  },
  assetsInclude: ["**/*.glb"],
  worker: {
    format: 'es'
  }
});
