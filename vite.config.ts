import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // مسار المستودع على GitHub Pages (موقع مشروع، وليس موقع مستخدم)
  base: '/alquwayiyah-history/',
  plugins: [react()],
})
