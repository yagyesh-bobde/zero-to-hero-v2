import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: { host: '0.0.0.0', port: 5173 },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor';
          if (id.includes('/src/data/modules/')) return 'curriculum';
          if (id.includes('/src/components/VisualLab')) return 'visual-labs';
        },
      },
    },
  },
});
