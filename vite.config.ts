import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/haifu-client/' : '/',
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
}))
