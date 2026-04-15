import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { SKILLS, type Skill } from '../data/portfolio'

const COLS = 5, ROWS = 3
const CW = 2.0, CH = 1.6
const OX = ((COLS - 1) * CW) / 2
const OY = ((ROWS - 1) * CH) / 2

export function LatticeScene() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.06) * 0.1
    groupRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.04) * 0.03
  })

  return (
    <group ref={groupRef} position={[0, 0.3, 0]}>
      <ambientLight intensity={0.12} />
      <pointLight position={[0, 3, 5]} color="#63b6ff" intensity={0.6} distance={14} decay={1.5} />

      {/* subtle grid plane */}
      <mesh position={[0, 0, -0.4]}>
        <planeGeometry args={[12, 6]} />
        <meshBasicMaterial color="#63b6ff" transparent opacity={0.02} wireframe />
      </mesh>

      {SKILLS.slice(0, COLS * ROWS).map((skill, i) => {
        const x = (i % COLS) * CW - OX
        const y = -(Math.floor(i / COLS) * CH - OY)
        return <Crystal key={skill.id} skill={skill} position={[x, y, 0]} index={i} />
      })}
    </group>
  )
}

function Crystal({ skill, position, index }: {
  skill: Skill; position: [number, number, number]; index: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const col = useMemo(() => new THREE.Color(skill.color), [skill.color])
  const sz = 0.1 + (skill.level / 100) * 0.1

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const wave = clock.elapsedTime * 0.8 - (position[0] + position[1]) * 0.2
    meshRef.current.scale.setScalar(1 + Math.sin(wave) * 0.06)
    meshRef.current.rotation.y = clock.elapsedTime * 0.2 + index * 0.5
  })

  return (
    <group position={position}>
      {/* crystal octahedron */}
      <mesh ref={meshRef}>
        <octahedronGeometry args={[sz, 0]} />
        <meshStandardMaterial
          color={col} emissive={col} emissiveIntensity={0.45}
          roughness={0.15} metalness={0.6} transparent opacity={0.88}
        />
      </mesh>
      {/* orbit ring */}
      <mesh rotation={[Math.PI / 2, 0, index * 0.35]}>
        <torusGeometry args={[sz * 1.7, 0.01, 8, 32]} />
        <meshBasicMaterial color={skill.color} transparent opacity={0.2} />
      </mesh>
      {/* label */}
      <Html position={[0, -sz - 0.22, 0]} center style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{
          fontFamily: "'DM Mono', monospace", fontSize: '13px', fontWeight: 600,
          letterSpacing: '0.05em',
          color: skill.color, whiteSpace: 'nowrap', textAlign: 'center', opacity: 0.9,
        }}>
          {skill.name}<br />
          <span style={{ fontSize: '11px', opacity: 0.6 }}>{skill.level}%</span>
        </div>
      </Html>
    </group>
  )
}
