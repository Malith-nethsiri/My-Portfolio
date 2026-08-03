import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      filename: 'bundle-analysis.html',
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // React and React DOM (already split)
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }

            // Prosemirror ecosystem (largest chunk)
            if (id.includes('prosemirror')) {
              return 'vendor-prosemirror';
            }

            // Tiptap core and its extensions
            if (id.includes('@tiptap')) {
              return 'vendor-tiptap';
            }

            // Redux / Redux Toolkit / Immer / Reselect
            if (
              id.includes('@reduxjs') ||
              id.includes('redux') ||
              id.includes('immer') ||
              id.includes('reselect')
            ) {
              return 'vendor-redux';
            }

            // Recharts (used only on MoneyPage – consider lazy‑loading that page too)
            if (id.includes('recharts')) {
              return 'vendor-recharts';
            }

            // All other node_modules
            return 'vendor';
          }
        },
      },
    },
  },
});
