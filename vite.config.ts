
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    // Strip the auto-generated modulepreload hint for markdown-vendor.
    // The chunk is kept separate so react-markdown/remark-gfm have their own
    // cache hash (Article.tsx changes don't invalidate them), but we don't want
    // to preload 45KB of markdown libs on every page — only article views need them.
    {
      name: 'no-markdown-preload',
      transformIndexHtml(html: string) {
        return html.replace(/\s*<link rel="modulepreload"[^>]*markdown-vendor[^>]*>/g, '');
      },
    },
    // Gzip compression for all assets
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // Only compress files larger than 10kb
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Brotli compression (better than gzip)
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    // Enable minification and optimization
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
      },
      mangle: {
        safari10: true,
      },
    },
    // CSS optimization
    cssMinify: 'lightningcss',
    // Code splitting configuration
    rollupOptions: {
      output: {
        // Manual chunks for libs that always ship. The math/syntax-highlighter
        // deps are intentionally omitted so Vite splits them per dynamic import
        // — articles without math/code never pay for them.
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'markdown-vendor': ['react-markdown', 'remark-gfm'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
  },
  // Absolute base required for clean URLs (history routing) — when a user
  // is at /article/foo, relative asset paths would resolve into the article
  // path. With base '/' all assets and figures load from the domain root.
  base: '/',
  server: {
    port: 3000,
    open: true,
  },
});
