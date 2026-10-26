import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'independent-course-entries',
      configureServer(server) {
        server.middlewares.use((request, _response, next) => {
          if (request.url?.split('?')[0] === '/react-native-ota') {
            request.url = request.url.replace('/react-native-ota', '/react-native-ota/index.html');
          }
          if (request.url?.split('?')[0] === '/react-native-networking') {
            request.url = request.url.replace(
              '/react-native-networking',
              '/react-native-networking/index.html',
            );
          }
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((request, _response, next) => {
          for (const course of ['react-native-ota', 'react-native-networking']) {
            if (request.url?.split('?')[0] === `/${course}`) {
              request.url = request.url.replace(`/${course}`, `/${course}/index.html`);
              break;
            }
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
        networking: 'react-native-networking/index.html',
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
