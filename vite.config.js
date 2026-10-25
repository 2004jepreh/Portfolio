import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // Nama repo GitHub (huruf kecil, harus persis sama). Situs akan berada di /portfolio/
  base: '/portfolio/',
  plugins: [vue()],
})