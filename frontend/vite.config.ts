import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      // Node.js Express backend (auth, complaints, pollution) – port 5000
      '/api/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/api/complaints': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/api/pollution': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      // Python ML model gateway (forecast, cities, health, generate-report) – port 8000
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
