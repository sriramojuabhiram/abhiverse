// ─────────────────────────────────────────────────────────────────────────────
// Astronaut.tsx — TechOrbs component (orbiting tech icons around character)
//
// OLD CHARACTER CODE has been preserved in Astronaut.old.tsx.bak for reference.
// New character implementation lives in Character.tsx
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Sparkles, useTexture } from '@react-three/drei'
import * as THREE from 'three'

type TechItem = {
  icon: string
  tint: string
  radius: number
  speed: number
  offset: number
  height: number
}

const TECH_ITEMS: TechItem[] = [
  { icon: '/tech-icons/react.svg', tint: '#66d8ff', radius: 1.55, speed: 0.24, offset: 0.1, height: 0.3 },
  { icon: '/tech-icons/docker.svg', tint: '#84c4ff', radius: 1.75, speed: 0.18, offset: 0.9, height: 0.82 },
  { icon: '/tech-icons/aws.svg', tint: '#ffc26f', radius: 1.95, speed: 0.14, offset: 1.7, height: 1.12 },
  { icon: '/tech-icons/openai.svg', tint: '#4ade80', radius: 1.85, speed: 0.22, offset: 2.4, height: 0.58 },
  { icon: '/tech-icons/groq.svg', tint: '#b3f7ff', radius: 2.05, speed: 0.12, offset: 3.1, height: 1.35 },
  { icon: '/tech-icons/kubernetes.svg', tint: '#95a3ff', radius: 1.72, speed: 0.2, offset: 3.7, height: 0.2 },
  { icon: '/tech-icons/azure.svg', tint: '#7ab7ff', radius: 1.9, speed: 0.16, offset: 4.3, height: 0.72 },
  { icon: '/tech-icons/redis.svg', tint: '#ff8ea2', radius: 1.65, speed: 0.19, offset: 5.2, height: 1.02 },
]

export function TechOrbs({ center }: { center: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null)
  const { camera } = useThree()
  const iconMaps = useTexture(TECH_ITEMS.map((item) => item.icon))

  useEffect(() => {
    iconMaps.forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = 8
      tex.needsUpdate = true
    })
  }, [iconMaps])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    const cards = groupRef.current.children

    for (let i = 0; i < TECH_ITEMS.length; i++) {
      const cfg = TECH_ITEMS[i]
      const card = cards[i] as THREE.Group
      if (!card) continue

      const a = t * cfg.speed + cfg.offset
      const x = Math.cos(a) * cfg.radius
      const z = Math.sin(a) * cfg.radius * 0.3
      const y = cfg.height + Math.sin(a * 1.8 + i) * 0.12

      card.position.set(x, y, z)
      card.lookAt(camera.position)
    }
  })

  return (
    <group ref={groupRef} position={center}>
      {TECH_ITEMS.map((item, i) => (
        <group key={item.icon}>
          <mesh renderOrder={1}>
            <circleGeometry args={[0.13, 28]} />
            <meshPhysicalMaterial
              color="#0a1222"
              emissive={item.tint}
              emissiveIntensity={0.33}
              roughness={0.14}
              metalness={0.9}
              clearcoat={1}
              clearcoatRoughness={0.06}
              transparent
              opacity={0.88}
              depthWrite={false}
            />
          </mesh>
          <sprite position={[0, 0, 0.018]} scale={[0.13, 0.13, 0.13]} renderOrder={3}>
            <spriteMaterial map={iconMaps[i]} color="#ffffff" transparent depthWrite={false} depthTest={false} />
          </sprite>
          <mesh position={[0, 0, -0.012]} renderOrder={0}>
            <ringGeometry args={[0.145, 0.162, 28]} />
            <meshBasicMaterial color={item.tint} transparent opacity={0.45} depthWrite={false} />
          </mesh>
        </group>
      ))}

      <Sparkles
        count={14}
        scale={[4.8, 2.6, 3.8]}
        size={0.9}
        speed={0.17}
        color="#9fd0ff"
        opacity={0.18}
      />
    </group>
  )
}
