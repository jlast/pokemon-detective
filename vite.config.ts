import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export default defineConfig(({ command, mode }) => {
  const assetVersion = String(Date.now())

  return {
    plugins: [
      react(),
      mode === 'codex-preview' ? {
        name: 'codex-preview-cases',
        transformIndexHtml(html) {
          return html.replace('<title>PokéMystery</title>', '<title>PokéMystery · Codex Preview</title>')
            .replace('<link rel="canonical" href="https://pokemysterygame.com/" />', '<meta name="robots" content="noindex, nofollow" />')
        },
        configureServer(server) {
          server.middlewares.use('/preview-cases.json', (_req, res) => {
            res.setHeader('Content-Type', 'application/json')
            res.end(readFileSync(resolve('node_modules/.cache/preview-cases.json')))
          })
        },
        generateBundle() {
          this.emitFile({ type: 'asset', fileName: 'preview-cases.json',
            source: readFileSync(resolve('node_modules/.cache/preview-cases.json')) })
        },
      } : null,
      command === 'build'
        ? {
            name: 'javascript-cache-buster',
            transformIndexHtml: {
              order: 'post' as const,
              handler: (html: string) => html.replace(
                /(<script\b[^>]*\bsrc=")([^"]+\.js)(")/g,
                `$1$2?v=${assetVersion}$3`,
              ),
            },
          }
        : null,
    ],
    server: {
      strictPort: true,
      proxy: {
        '/api': {
          target: process.env.VITE_API_TARGET || 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
  }
})
