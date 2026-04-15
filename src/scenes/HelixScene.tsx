import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import { EXPERIENCES, type Experience } from '../data/portfolio'

const HELIX_LEN = 6
const HELIX_R = 0.9
const TURNS = 3

function helixPts(offset: number) {
  const pts: [number, number, number][] = []
  for (let i = 0; i <= 120; i++) {
    const t = i / 120
    const y = t * HELIX_LEN - HELIX_LEN / 2
    const a = t * Math.PI * 2 * TURNS + offset
    pts.push([Math.cos(a) * HELIX_R, y, Math.sin(a) * HELIX_R])
  }
  return pts
}

export function HelixScene() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = clock.elapsedTime * 0.1
  })

  const strand1 = useMemo(() => helixPts(0), [])
  const strand2 = useMemo(() => helixPts(Math.PI), [])

  const links = useMemo(() => {
    const out: { a: [number, number, number]; b: [number, number, number] }[] = []
    for (let i = 6; i < 120; i += 10) out.push({ a: strand1[i], b: strand2[i] })
    return out
  }, [strand1, strand2])

  const nodes = useMemo(() => {
    const startY = 2013, endY = 2025
    return EXPERIENCES.map(exp => {
      const t = Math.min(0.95, Math.max(0.05, (exp.start - startY) / (endY - startY)))
      const y = t * HELIX_LEN - HELIX_LEN / 2
      const a = t * Math.PI * 2 * TURNS
      return { ...exp, pos: [Math.cos(a) * (HELIX_R + 0.5), y, Math.sin(a) * (HELIX_R + 0.5)] as [number, number, number] }
    })
  }, [])

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.12} />
      <pointLight position={[0, 3, 4]} color="#63b6ff" intensity={0.6} distance={12} decay={1.5} />

      <Line points={strand1} color="#63b6ff" transparent opacity={0.3} lineWidth={1.5} />
      <Line points={strand2} color="#4a6a9a" transparent opacity={0.18} lineWidth={1} />
      {links.map((lk, i) => (
        <Line key={i} points={[lk.a, lk.b]} color="#63b6ff" transparent opacity={0.05} lineWidth={1} />
      ))}
      {nodes.map(n => <ExpNode key={n.id} exp={n} />)}
    </group>
  )
}

function ExpNode({ exp }: { exp: Experience & { pos: [number, number, number] } }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const col = useMemo(() => new THREE.Color(exp.color), [exp.color])
  const isNow = exp.end === null

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    meshRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 1.2) * 0.08)
  })

  return (
    <group position={exp.pos}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.18, 0.012, 8, 32]} />
        <meshBasicMaterial color={exp.color} transparent opacity={isNow ? 0.5 : 0.22} />
      </mesh>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.1, 18, 18]} />
        <meshStandardMaterial
          color={col} emissive={col} emissiveIntensity={isNow ? 0.7 : 0.35}
          roughness={0.2} metalness={0.5} transparent opacity={0.92}
        />
      </mesh>
      <Html position={[0.32, 0, 0]} style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{
          fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '14px',
          fontWeight: 600, color: exp.color, opacity: 0.9, whiteSpace: 'nowrap',
        }}>{exp.company}</div>
        <div style={{
          fontFamily: "'DM Mono', monospace", fontSize: '11px',
          letterSpacing: '0.06em', color: 'rgba(160,175,220,0.5)', marginTop: '2px',
        }}>
          {exp.start}{exp.end ? ` — ${exp.end}` : ' — Present'}
        </div>
      </Html>
    </group>
  )
}
