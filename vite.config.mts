import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'


// https://vitejs.dev/config/

export default defineConfig(async ({ command, mode }) => {

  return (
    {
      plugins: [
        react(),
        svgr(),
      ],
      build: {
        outDir: 'dist/build'
      },
      /*resolve: {
        alias: {
          "readable-stream": "vite-compatible-readable-stream"
        }
      },*/
      server: {
        //open: "http://localhost:1349/development/",
        //host: 'localhost',
        port: 3001,
      },
      optimizeDeps: {
        esbuildOptions: {
          // Node.js global to browser globalThis
          define: {
            global: 'globalThis',
          },
        },
      },
    }
  )
})
