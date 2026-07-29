import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Mirrors the /nhost-storage proxy in netlify.toml so storage reads are
    // same-origin in dev and production alike. Keep both in sync.
    proxy: {
      '/nhost-storage': {
        target: 'https://oxsetgbfcrtlfjmvwkmk.storage.ap-south-1.nhost.run',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nhost-storage/, '/v1'),
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
