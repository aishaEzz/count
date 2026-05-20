import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/count/' : '/',
  server: {
    proxy: {
      '/api': 'http://localhost:4000'
    }
  }
})
