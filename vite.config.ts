import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  const assetVersion = String(Date.now())

  return {
    plugins: [
      react(),
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
