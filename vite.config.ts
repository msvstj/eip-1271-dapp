import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NgmiPolyfill } from 'vite-plugin-ngmi-polyfill';
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [NgmiPolyfill(), react()],
  resolve: {
    alias: {
      "@/": path.join(__dirname, "src/"),
    },
  },
});
