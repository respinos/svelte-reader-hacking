import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    proxy: {
      '^/cgi/imgsrv/*': {
        target: 'https://babel.hathitrust.org',
        changeOrigin: true
      },
    }
  }
})
