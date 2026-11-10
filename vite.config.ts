import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const courses = ['react-native-ota', 'react-native-networking', 'react-native-reels', 'shorts', 'engineering', 'dsa', 'dsa/reels'];

/** Serves `/<course>` from `/<course>/index.html` (vercel.json does the same in production). */
function rewriteCourseEntry(request: { url?: string }, _response: unknown, next: () => void) {
  const pathname = request.url?.split('?')[0] ?? '';
  if (courses.includes(pathname.slice(1))) request.url = request.url?.replace(pathname, `${pathname}/index.html`);
  next();
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'independent-course-entries',
      configureServer(server) {
        server.middlewares.use(rewriteCourseEntry);
      },
      configurePreviewServer(server) {
        server.middlewares.use(rewriteCourseEntry);
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
        reels: 'react-native-reels/index.html',
        shorts: 'shorts/index.html',
        engineering: 'engineering/index.html',
        dsa: 'dsa/index.html',
        dsaReels: 'dsa/reels/index.html',
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
