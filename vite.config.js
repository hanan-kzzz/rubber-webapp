import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          charts: ['chart.js'],
          sheetjs: ['xlsx']
        }
      }
    }
  }
});
