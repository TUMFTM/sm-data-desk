import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: ['datsimiaa.ftm.ed.tum.de']
  }
})
