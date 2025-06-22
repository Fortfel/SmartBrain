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
export default defineConfig(({ mode }) => {
  // Base path for GitHub Pages deployment
  // Use root path for development and repository name for production
  const base = mode === 'production' ? '/SmartBrain/' : '/'

  return {
    base,
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
      emptyOutDir: true,
    },
    server: {
      ...(mode === 'development' && {
        proxy: {
          // Proxy API requests to the Express server during development
          '/smartbrain-api': {
            target: `http://localhost:${serverPort.toString()}`,
            changeOrigin: true,
            secure: false,
            ws: true,
            configure: (proxy, _options): void => {
              proxy.on('error', (err, _req, _res) => {
                console.log('proxy error', err)
              })
              proxy.on('proxyReq', (_proxyReq, req, _res) => {
                console.log('Sending Request to the Target:', req.method, req.url)
              })
              proxy.on('proxyRes', (proxyRes, req, _res) => {
                console.log('Received Response from the Target:', proxyRes.statusCode, req.url)
              })
            },
          },
        },
      }),
    },
  }
})
