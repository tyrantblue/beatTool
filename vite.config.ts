import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'

import { cloudflare } from "@cloudflare/vite-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'))

export default defineConfig({
  plugins: [vue(), tailwindcss(), cloudflare()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
})