import { defineConfig } from 'vite';

export default defineConfig({
  // index.html'in bulunduğu dizin
  root: './',

  server: {
    port: 3000,
    open: true,
    // HMR issues often occur with large inline scripts. 
    // Moving logic to separate files is the best fix.
    hmr: true,
    // Backend API proxy
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('content-length', proxyReq.getHeader('content-length') || '');
          });
        }
      }
    }
  },

  build: {
    outDir: 'dist',
    minify: 'oxc',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  },

  css: {
    devSourcemap: true,
  },
});
