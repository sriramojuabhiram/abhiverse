import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { SceneManager } from '../scenes/SceneManager'
import { CameraRig } from './CameraRig'
import { SceneBackground } from './SceneBackground'
import { PostProcessing } from './PostProcessing'
import { useAppStore } from '../store/appStore'

export function World() {
  const setMouse = useAppStore(s => s.setMouse)

  return (
    <div
      style={{ position: 'absolute', inset: 0 }}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect()
        setMouse(
          (e.clientX - r.left) / r.width,
          (e.clientY - r.top) / r.height
        )
      }}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 8], fov: 50, near: 0.1, far: 100 }}
        gl={{ powerPreference: 'high-performance', antialias: true, alpha: false }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Suspense fallback={null}>
          <CameraRig />
          <SceneBackground />
          <SceneManager />
          <PostProcessing />
        </Suspense>
      </Canvas>
    </div>
  )
}
