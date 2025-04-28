import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    headers: {
      // Critical for Google OAuth popups to work:
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Cross-Origin-Embedder-Policy": "unsafe-none", // Disable COEP for OAuth compatibility
      "Access-Control-Allow-Origin": "http://localhost:5173" // Explicit CORS for dev
    },
    proxy: {
      // Proxy API requests to avoid CORS during development
      '/api': {
        target: 'https://client-checkin-app-service.vercel.app',
        changeOrigin: true,
        secure: false
      }
    }
  },
  base: '',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`
      }
    }
  },
  define: {
    // Ensure consistent base URL in the app
    'import.meta.env.BASE_URL': JSON.stringify('/')
  }
});