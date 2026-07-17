import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // sockjs-client references Node's `global` object, which doesn't
    // exist in the browser. Vite doesn't polyfill it by default, so we
    // map it to globalThis (the standard cross-environment equivalent).
    global: 'globalThis',
  },
})