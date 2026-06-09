import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Gestor de Proyectos',
        short_name: 'Proyectos',
        description: 'Gestor personal de proyectos y tareas',
        lang: 'es',
        display: 'standalone',
        start_url: '/',
        background_color: '#F7F6F2',
        theme_color: '#F7F6F2',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})
