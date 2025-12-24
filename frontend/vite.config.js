import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Optimized build configuration for production
  build: {
    // Enable minification with esbuild (faster than terser)
    minify: 'esbuild',

    // Optimize chunk size
    chunkSizeWarningLimit: 1000,

    // Manual chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'animation-vendor': ['framer-motion'],
          'utils': ['axios']
        }
      }
    },

    // Enable source maps for production debugging (can disable if not needed)
    sourcemap: false,

    // Optimize CSS code splitting
    cssCodeSplit: true,

    // Target modern browsers for smaller bundle
    target: 'esnext',

    // Enable polyfills only when needed
    modulePreload: {
      polyfill: true
    }
  },

  // Development server optimization
  server: {
    // Enable pre-bundling for faster dev startup
    warmup: {
      clientFiles: ['./src/main.jsx', './src/App.jsx']
    }
  },

  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'axios'],
    // Force include these to avoid runtime discovery
    esbuildOptions: {
      target: 'esnext'
    }
  }
})
