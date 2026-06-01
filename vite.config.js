import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/products': {
        target: 'https://ethara-ai-backend-av8s.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/customers': {
        target: 'https://ethara-ai-backend-av8s.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/orders': {
        target: 'https://ethara-ai-backend-av8s.onrender.com',
        changeOrigin: true,
        secure: true,
      }
    }
  },
});
