import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import pages from '@hono/vite-cloudflare-pages';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    pages()
  ],
  build: {
    outDir: 'dist'
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@components': path.resolve(__dirname, 'components'),
      '@services': path.resolve(__dirname, 'services'),
      '@hooks': path.resolve(__dirname, 'hooks'),
    }
  }
});
