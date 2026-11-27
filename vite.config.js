
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  base: '/',

  plugins: [
    vue(),

    legacy({
      targets: [
        'Android >= 5',
        'Chrome >= 60',
        'Safari >= 10',
        'Firefox >= 60'
      ],
      renderLegacyChunks: true,
      modernPolyfills: true
    })
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  build: {
    target: 'es2015',
    cssTarget: 'chrome60'
  }
})
