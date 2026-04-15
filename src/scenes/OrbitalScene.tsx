import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import { PROJECTS, type Project } from '../data/portfolio'

const ORBITS = [
  { radius: 2.2, speed: 0.32, tilt: 0.1, startAngle: 0 },
  { radius: 3.2, speed: 0.2, tilt: -0.12, startAngle: 2.1 },
  { radius: 1.5, speed: 0.48, tilt: 0.18, startAngle: 4.2 },
]

export function OrbitalScene() {
  const sunRef = useRef<THREE.Mesh>(null)
  const timeRef = useRef(0)

  useFrame((_, delta) => {
    timeRef.current += delta
    if (sunRef.current) sunRef.current.rotation.y += delta * 0.15
  })

  return (
    <group>
      <ambientLight intensity={0.1} />

      {/* Sun core */}
      <SolarCore sunRef={sunRef} />

      {/* Orbit rings */}
      {ORBITS.map((o, i) => (
        <OrbitRing key={i} radius={o.radius} tilt={o.tilt} color={PROJECTS[i]?.color ?? '#c8f542'} />
      ))}

      {/* Planets */}
      {PROJECTS.map((p, i) => (
        <Planet key={p.id} project={p} orbit={ORBITS[i] ?? ORBITS[0]} timeRef={timeRef} />
      ))}

      <StarField count={150} />
    </group>
  )
}

function SolarCore({ sunRef }: { sunRef: React.RefObject<THREE.Mesh | null> }) {
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!glowRef.current) return
    glowRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 1.2) * 0.06)
  })

  return (
    <group>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.55, 28, 28]} />
        <meshBasicMaterial color="#63b6ff" transparent opacity={0.06} />
      </mesh>
      <mesh ref={sunRef}>
        <icosahedronGeometry args={[0.28, 3]} />
        <meshStandardMaterial
          color="#63b6ff" emissive="#63b6ff" emissiveIntensity={0.65}
          roughness={0.1} metalness={0.6} transparent opacity={0.92}
        />
      </mesh>
      <Html position={[0, -0.55, 0]} center style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{
          fontFamily: "'Fraunces', serif", fontSize: '14px', fontWeight: 700,
          color: '#63b6ff', textAlign: 'center', opacity: 0.9,
        }}>Abhiram.S</div>
      </Html>
      <pointLight color="#63b6ff" intensity={1.8} distance={8} decay={1.5} />
    </group>
  )
}

function OrbitRing({ radius, tilt, color }: { radius: number; tilt: number; color: string }) {
  const pts = useMemo<[number, number, number][]>(() => {
    const out: [number, number, number][] = []
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2
      out.push([Math.cos(a) * radius, 0, Math.sin(a) * radius])
    }
    return out
  }, [radius])

  return (
    <group rotation={[tilt, 0, 0]}>
      <Line points={pts} color={color} transparent opacity={0.08} lineWidth={1} />
    </group>
  )
}

function Planet({ project, orbit, timeRef }: {
  project: Project; orbit: (typeof ORBITS)[0]; timeRef: React.RefObject<number>
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const col = useMemo(() => new THREE.Color(project.color), [project.color])
  const r = 0.12 + (project.status === 'live' ? 0.05 : 0)

  useFrame(() => {
    if (!groupRef.current || timeRef.current === null) return
    const t = timeRef.current
    const a = orbit.startAngle + t * orbit.speed
    groupRef.current.position.set(Math.cos(a) * orbit.radius, Math.sin(a * 0.3) * 0.25, Math.sin(a) * orbit.radius)
    if (meshRef.current) meshRef.current.rotation.y = t * 0.6
  })

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[r, 1]} />
        <meshStandardMaterial
          color={col} emissive={col} emissiveIntensity={0.4}
          roughness={0.3} metalness={0.5} transparent opacity={0.88}
        />
      </mesh>
      <Html position={[0, r + 0.22, 0]} center style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{
          fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '13px',
          fontWeight: 600, color: project.color, whiteSpace: 'nowrap', opacity: 0.9,
        }}>{project.name}</div>
        <div style={{
          fontFamily: "'DM Mono', monospace", fontSize: '10px', letterSpacing: '0.08em',
          color: 'rgba(160,175,220,0.5)', textTransform: 'uppercase',
          marginTop: '2px', textAlign: 'center',
        }}>{project.status}</div>
      </Html>
    </group>
  )
}

function StarField({ count }: { count: number }) {
  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 18
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 5
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [count])

  return (
    <points geometry={geo}>
      <pointsMaterial color="#63b6ff" size={0.015} transparent opacity={0.3} sizeAttenuation />
    </points>
  )
}
