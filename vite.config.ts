import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages serves under /<repo>/. In dev we use root.
  base: command === 'build' ? '/re-marshall-remix/' : '/',
}))
