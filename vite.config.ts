import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'ota-course-entry',
      configureServer(server) {
        server.middlewares.use((request, _response, next) => {
          if (request.url?.split('?')[0] === '/react-native-ota') {
            request.url = request.url.replace('/react-native-ota', '/react-native-ota/index.html');
          }
          next();
        });
      },
    },
  ],
  server: { host: '0.0.0.0', port: 5173 },
  build: {
    rollupOptions: {
      input: {
        course: 'index.html',
        ota: 'react-native-ota/index.html',
      },
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
