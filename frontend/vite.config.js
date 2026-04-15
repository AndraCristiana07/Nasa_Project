import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(),react()],
  test: {
    environment: 'jsdom',
    // testing-library/jest-dom matchers
    setupFiles: './tests/setup.js',
    globals: true,
  },
})

