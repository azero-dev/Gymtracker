import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:4666",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
