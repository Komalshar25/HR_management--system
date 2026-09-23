import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages serves the site from /<repo-name>/, so the workflow sets VITE_BASE
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: {
    proxy: {
      // All API requests starting with /api will be proxied to backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});