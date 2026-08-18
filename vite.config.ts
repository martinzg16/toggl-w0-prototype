import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base is set for GitHub Pages project sites (/<repo>/).
// Override with BASE_PATH=/ for local or root deploys.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.BASE_PATH ?? '/toggl-w0-prototype/',
})
