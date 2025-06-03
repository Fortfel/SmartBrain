import fs from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import legacy from '@vitejs/plugin-legacy'
import VitePluginBrowserSync from 'vite-plugin-browser-sync'

// Load environment variables
if (fs.existsSync('.env.local')) {
  process.loadEnvFile('.env.local')
}
if (fs.existsSync('.env')) {
  process.loadEnvFile('.env')
}

const serverPort = process.env.PORT || 3000

// https://vite.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
    legacy({
      // targets: ['defaults', 'not IE 11'], // its in browserlist option in packgae.json
    }),
    VitePluginBrowserSync(),
  ],
  server: {
    proxy: {
      // Proxy API requests to the Express server during development
      '/api': {
        target: `http://localhost:${serverPort}`,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
