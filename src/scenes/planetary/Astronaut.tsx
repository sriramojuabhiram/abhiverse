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
  { icon: '/tech-icons/python.svg',     tint: '#ffd43b', radius: 1.55, speed: 0.22, offset: 0.0,  height: 0.55 },
  { icon: '/tech-icons/langchain.svg',  tint: '#4ade80', radius: 1.80, speed: 0.17, offset: 0.42, height: 1.10 },
  { icon: '/tech-icons/openai.svg',     tint: '#10b981', radius: 1.65, speed: 0.20, offset: 0.84, height: 0.30 },
  { icon: '/tech-icons/pytorch.svg',    tint: '#ee4c2c', radius: 1.92, speed: 0.14, offset: 1.26, height: 0.85 },
  { icon: '/tech-icons/fastapi.svg',    tint: '#009688', radius: 1.72, speed: 0.19, offset: 1.68, height: 1.30 },
  { icon: '/tech-icons/csharp.svg',     tint: '#b38dff', radius: 2.05, speed: 0.15, offset: 2.09, height: 0.42 },
  { icon: '/tech-icons/dotnet.svg',     tint: '#8ea0ff', radius: 1.62, speed: 0.21, offset: 2.51, height: 1.18 },
  { icon: '/tech-icons/angular.svg',    tint: '#ff6a7a', radius: 1.88, speed: 0.16, offset: 2.93, height: 0.62 },
  { icon: '/tech-icons/react.svg',      tint: '#66d8ff', radius: 1.75, speed: 0.18, offset: 3.35, height: 0.95 },
  { icon: '/tech-icons/typescript.svg', tint: '#3178c6', radius: 2.00, speed: 0.13, offset: 3.77, height: 0.35 },
  { icon: '/tech-icons/docker.svg',     tint: '#84c4ff', radius: 1.68, speed: 0.20, offset: 4.19, height: 1.25 },
  { icon: '/tech-icons/aws.svg',        tint: '#ffc26f', radius: 1.95, speed: 0.14, offset: 4.61, height: 0.50 },
  { icon: '/tech-icons/kubernetes.svg', tint: '#95a3ff', radius: 1.78, speed: 0.17, offset: 5.03, height: 1.05 },
  { icon: '/tech-icons/groq.svg',       tint: '#b3f7ff', radius: 2.08, speed: 0.12, offset: 5.45, height: 0.72 },
  { icon: '/tech-icons/azure.svg',      tint: '#7ab7ff', radius: 1.60, speed: 0.23, offset: 5.87, height: 1.38 },
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
