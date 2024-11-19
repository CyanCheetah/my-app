// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default {
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['react-router-dom'],
    },
  },
};

