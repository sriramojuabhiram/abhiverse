import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
  plugins: [react(), glsl()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/three/')) return 'three-core'
          if (id.includes('@react-three/fiber') || id.includes('@react-three/drei')) return 'three-fiber'
          if (id.includes('@react-three/postprocessing') || id.includes('postprocessing')) return 'three-fx'
          if (id.includes('framer-motion') || id.includes('gsap')) return 'animation'
          if (id.includes('zustand')) return 'state'
        },
      },
    },
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei'],
  },
})

