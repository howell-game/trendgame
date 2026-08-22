import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  base: '/trendgame/',// ✅ VERY IMPORTANT for Render
  server: {
    host: true,
  },
  plugins: [
    vue(),
    vueDevTools(),
    legacy({
      targets: [
        'defaults',
        'Android >= 7',
        'Chrome >= 60'
      ]
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
