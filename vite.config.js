import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact(), tailwindcss()],
  define: {
    "process.env": {},
  },
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
