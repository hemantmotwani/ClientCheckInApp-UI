import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer() // Helps analyze bundle issues
  ],
  base: './', // Critical for Vercel routing
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true // Enable for debugging
  }
})
