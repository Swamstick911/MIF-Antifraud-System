import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const here = (p) => fileURLToPath(new URL(p, import.meta.url))

// Builds the two React surfaces: the toolbar popup and the full dashboard.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    rollupOptions: {
      input: {
        site: here('./index.html'),
        extensionTest: here('./extension-test.html'),
        popup: here('./popup.html'),
        dashboard: here('./dashboard.html'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/shared-[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
})
