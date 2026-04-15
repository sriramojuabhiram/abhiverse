import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '../store/appStore'

const BG_COLORS = [
  new THREE.Color('#060810'),   // cool void (about)
  new THREE.Color('#0a0618'),   // violet-tinted deep (skills)
  new THREE.Color('#060a16'),   // navy deep (experience)
  new THREE.Color('#0e0610'),   // warm plum deep (projects)
  new THREE.Color('#0a0808'),   // warm dark (contact)
  new THREE.Color('#08061a'),   // indigo deep (ai clone)
]

export function SceneBackground() {
  const meshRef = useRef<THREE.Mesh>(null)
  const section = useAppStore(s => s.section)
  const targetColor = useRef(BG_COLORS[0].clone())

  useFrame(() => {
    if (!meshRef.current) return
    const mat = meshRef.current.material as THREE.MeshBasicMaterial
    const idx = Math.min(section, BG_COLORS.length - 1)
    targetColor.current.lerp(BG_COLORS[idx], 0.03)
    mat.color.copy(targetColor.current)
  })

  return (
    <mesh ref={meshRef} renderOrder={-1}>
      <sphereGeometry args={[50, 8, 8]} />
      <meshBasicMaterial color={BG_COLORS[0]} side={THREE.BackSide} />
    </mesh>
  )
}
