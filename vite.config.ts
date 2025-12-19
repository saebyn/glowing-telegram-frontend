import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': '/src',
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split vendor libraries into separate chunks for better caching
          if (id.includes('node_modules')) {
            // React and routing
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // Luxon date library
            if (id.includes('luxon')) {
              return 'vendor-luxon';
            }
            // Material UI
            if (id.includes('@mui')) {
              return 'vendor-mui';
            }
            // React Admin
            if (id.includes('react-admin') || id.includes('ra-')) {
              return 'vendor-ra';
            }
            // MSW for mocking
            if (id.includes('msw')) {
              return 'vendor-msw';
            }
            // Other vendor code
            return 'vendor-other';
          }
          
          // Separate widget code for lazy loading
          if (id.includes('/src/widgets/')) {
            return 'widgets';
          }
        },
      },
    },
    // Increase chunk size warning limit since we're optimizing chunks
    chunkSizeWarningLimit: 600,
  },
});
