import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

const here = (p) => fileURLToPath(new URL(p, import.meta.url))

// Builds one extension script per invocation, selected by MIF_ENTRY.
const ENTRIES = {
  background: 'src/background/service-worker.js',
  content: 'src/content/content-script.js',
  messaging: 'src/content/messaging.js',
}

const name = process.env.MIF_ENTRY
if (!ENTRIES[name]) {
  throw new Error(`Set MIF_ENTRY to one of: ${Object.keys(ENTRIES).join(', ')}`)
}

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false, // the UI pass owns dist; these passes only add to it
    target: 'es2022',
    minify: false, // readable bundles are worth more than bytes during a build weekend
    lib: {
      entry: here(`./${ENTRIES[name]}`),
      formats: ['iife'],
      name: `MIFShield_${name}`,
      fileName: () => `${name}.js`,
    },
  },
})
