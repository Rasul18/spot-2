import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  server: {
    allowedHosts: [
      'rasulhub.fun', // Добавляем твой домен сюда
      'all'           // Либо можно написать 'all', чтобы разрешить любые хосты (для разработки)
    ]
  }
})
