import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        customElement: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': '{}',
    'global': 'globalThis',
  },
  build: {
    lib: {
      entry: 'components/svelte/Chat.svelte',
      name: 'SvelteChat',
      fileName: 'svelte-chat',
      formats: ['es'],
    },
    outDir: 'components/svelte/dist',
    emptyOutDir: true,
    rollupOptions: {
      external: ['svelte', 'svelte/internal'],
    },
  },
})
