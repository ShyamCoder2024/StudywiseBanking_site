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
    chunkSizeWarningLimit: 500,

    // Manual chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Separate large vendor chunks
          if (id.includes('node_modules')) {
            // Core React
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // Animation library (large)
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            // Icons (can be large)
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            // HTTP client
            if (id.includes('axios')) {
              return 'http-vendor';
            }
            // All other vendors
            return 'vendor';
          }

          // Split admin pages into separate chunk
          if (id.includes('/pages/admin/')) {
            return 'admin-pages';
          }

          // Split student pages
          if (id.includes('/pages/student/')) {
            return 'student-pages';
          }
        },
        // Consistent chunk naming for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },

    // Disable source maps for smaller builds
    sourcemap: false,

    // Optimize CSS code splitting
    cssCodeSplit: true,

    // Target modern browsers for smaller bundle
    target: 'esnext',

    // Enable polyfills only when needed
    modulePreload: {
      polyfill: true
    },

    // Increase asset inlining threshold (for small images/files)
    assetsInlineLimit: 4096,

    // Report compressed sizes
    reportCompressedSize: false
  },

  // Development server optimization
  server: {
    // Enable pre-bundling for faster dev startup
    warmup: {
      clientFiles: [
        './src/main.jsx',
        './src/App.jsx',
        './src/pages/LoginPage.jsx',
        './src/pages/student/StudentDashboard.jsx'
      ]
    }
  },

  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'axios',
      'lucide-react'
    ],
    // Force include these to avoid runtime discovery
    esbuildOptions: {
      target: 'esnext'
    }
  },

  // Better tree shaking
  esbuild: {
    drop: ['console', 'debugger'], // Remove console.log in production
    legalComments: 'none',
    treeShaking: true
  }
})
