import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    headers: {
      // Required for Google OAuth popups to work:
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups", // Allows postMessage
      "Cross-Origin-Embedder-Policy": "unsafe-none", // Disables strict isolation (for OAuth)
    },
  },
  base: '', // No trailing slash
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
    },
  },
});