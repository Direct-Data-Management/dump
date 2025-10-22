import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { federation } from '@module-federation/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'dump',
      remotes: {
        // Remote modules will be dynamically loaded based on JWT permissions
        // Example: 'remoteApp': 'http://localhost:5174/assets/remoteEntry.js'
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^19.0.0',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^19.0.0',
        },
        'react-router-dom': {
          singleton: true,
        },
      },
    }),
  ],
  server: {
    port: 5173,
  },
  preview: {
    port: 5173,
  },
})
