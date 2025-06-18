import fs from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import legacy from '@vitejs/plugin-legacy'
import VitePluginBrowserSync from 'vite-plugin-browser-sync'
import dotenv from 'dotenv'

// Load environment variables
if (fs.existsSync('./../.env')) {
  dotenv.config({ path: './../.env' })
}

if (fs.existsSync('./../.env.local')) {
  dotenv.config({ path: './../.env.local', override: true })
}
const serverPort = process.env.PORT || 3000

// https://vite.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      tsconfigPaths({
        root: '../',
        projects: ['tsconfig.app.json'],
      }),
      legacy({
        // targets: ['defaults', 'not IE 11'], // its in browserlist option in packgae.json
      }),
      VitePluginBrowserSync({
        dev: {
          bs: {
            port: Number(serverPort) + 1,
          },
        },
      }),
    ],
    build: {
      outDir: '../dist/frontend',
    },
    server: {
      ...(mode === 'development' && {
        proxy: {
          // Proxy API requests to the Express server during development
          '/api': {
            target: `http://localhost:${serverPort.toString()}`,
            changeOrigin: true,
            secure: false,
          },
        },
      }),
    },
  }
})
