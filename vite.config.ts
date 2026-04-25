import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

// Routes that the React app calls but are actually served by beads-server.js
// (running separately on :3000). The proxy keeps API keys server-side.
const BEADS_SERVER = process.env.BEADS_SERVER_URL || 'http://localhost:3000';

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/proxy': { target: BEADS_SERVER, changeOrigin: true },
      '/ping':  { target: BEADS_SERVER, changeOrigin: true },
    },
  },
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
