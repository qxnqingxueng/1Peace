import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, globalThis.process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      'process.env': JSON.stringify(env),
    },
  }
})
