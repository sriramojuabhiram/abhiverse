import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import { SKILLS, SKILL_CONNECTIONS, type Skill } from '../data/portfolio'

/* Spread nodes wider so they don't cluster */
const NODE_POS: Record<string, [number, number, number]> = {
  csharp:    [-0.8,  2.0,  0.3],
  dotnet:    [ 0.6,  2.4, -0.2],
  aspnet:    [ 2.0,  1.6,  0.1],
  angular:   [-2.6,  0.6,  0.4],
  ts:        [-3.2, -0.5,  0.0],
  react:     [-3.6, -1.8, -0.3],
  azure:     [ 2.8,  0.4, -0.4],
  aws:       [ 3.4,  1.4,  0.3],
  gcp:       [ 4.0,  0.0, -0.1],
  docker:    [ 3.6, -0.6,  0.2],
  k8s:       [ 3.8, -1.8, -0.2],
  kafka:     [ 1.8, -2.2,  0.5],
  rabbitmq:  [ 0.2, -2.8, -0.4],
  sqlserver: [-1.0, -2.2,  0.3],
  golang:    [-2.2, -3.0, -0.3],
  fastapi:   [-3.4, -2.8,  0.0],
  ai:        [ 0.6, -3.6, -0.5],
}

export function NetworkScene() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.05) * 0.08
  })

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 2, 4]} color="#63b6ff" intensity={1.2} distance={16} decay={1.2} />
      <pointLight position={[-3, -2, 3]} color="#a78bfa" intensity={0.5} distance={12} decay={1.5} />

      {SKILL_CONNECTIONS.map(([aId, bId], i) => (
        <EdgeLine
          key={`${aId}-${bId}`}
          start={NODE_POS[aId] ?? [0, 0, 0]}
          end={NODE_POS[bId] ?? [0, 0, 0]}
          idx={i}
        />
      ))}
      {SKILLS.map(skill => (
        <Node key={skill.id} skill={skill} position={NODE_POS[skill.id] ?? [0, 0, 0]} />
      ))}
    </group>
  )
}

function Node({ skill, position }: { skill: Skill; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const r = 0.08 + (skill.level / 100) * 0.09
  const col = useMemo(() => new THREE.Color(skill.color), [skill.color])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime
    meshRef.current.scale.setScalar(1 + Math.sin(t * 1.1 + position[0] * 2) * 0.06)
  })

  return (
    <group position={position}>
      {/* glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[r * 1.7, 0.015, 8, 40]} />
        <meshBasicMaterial color={skill.color} transparent opacity={0.25} />
      </mesh>
      {/* outer glow sphere */}
      <mesh>
        <sphereGeometry args={[r * 1.3, 16, 16]} />
        <meshBasicMaterial color={skill.color} transparent opacity={0.05} />
      </mesh>
      {/* core sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[r, 24, 24]} />
        <meshStandardMaterial
          color={col} emissive={col} emissiveIntensity={0.6}
          roughness={0.2} metalness={0.4} transparent opacity={0.92}
        />
      </mesh>
      {/* label */}
      <Html position={[0, -r - 0.24, 0]} center style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{
          fontFamily: "'DM Mono', monospace", fontSize: '13px', fontWeight: 600,
          letterSpacing: '0.05em',
          color: skill.color, opacity: 0.9, whiteSpace: 'nowrap', textAlign: 'center',
        }}>
          {skill.name}<br />
          <span style={{ fontSize: '11px', opacity: 0.6 }}>{skill.level}%</span>
        </div>
      </Html>
    </group>
  )
}

function EdgeLine({ start, end, idx }: {
  start: [number, number, number]; end: [number, number, number]; idx: number
}) {
  const elRef = useRef<THREE.Mesh>(null)
  const p0 = useMemo(() => new THREE.Vector3(...start), [start])
  const p1 = useMemo(() => new THREE.Vector3(...end), [end])

  useFrame(({ clock }) => {
    if (!elRef.current) return
    const phase = ((clock.elapsedTime * 0.4 + idx * 0.31) % 1)
    elRef.current.position.lerpVectors(p0, p1, phase)
  })

  return (
    <group>
      <Line points={[start, end]} color="#63b6ff" transparent opacity={0.12} lineWidth={1.5} />
      <mesh ref={elRef}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color="#63b6ff" transparent opacity={0.7} />
      </mesh>
    </group>
  )
}
