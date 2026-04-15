import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { PlanetSection } from './planetData'
import {
  planetVertex,
  planetFragment,
  atmosphereVertex,
  atmosphereFragment,
  cloudVertex,
  cloudFragment,
  ringVertex,
  ringFragment,
} from './shaders'

const typeIndex: Record<string, number> = {
  earth: 0, gas: 1, ice: 2, rocky: 3, star: 4, nebula: 5,
}

interface PlanetProps {
  data: PlanetSection
  hovered: React.RefObject<boolean | null>
}

export function Planet({ data, hovered }: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null)
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const cloudRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uColor1: { value: new THREE.Color(data.colors.primary) },
      uColor2: { value: new THREE.Color(data.colors.secondary) },
      uColor3: { value: new THREE.Color(data.colors.accent) },
      uAtmosphereColor: { value: new THREE.Color(data.colors.atmosphere) },
      uNoiseScale: { value: data.noiseScale },
      uTime: { value: 0 },
      uType: { value: typeIndex[data.type] ?? 0 },
    }),
    [data],
  )

  const cloudUniforms = useMemo(() => ({ uTime: { value: 0 } }), [])

  const ringUniforms = useMemo(
    () => ({
      uRingColor: { value: new THREE.Color(data.ringColor ?? '#ffffff') },
      uTime: { value: 0 },
    }),
    [data],
  )

  useFrame((_state, delta) => {
    if (!groupRef.current) return
    const speed = data.rotationSpeed * (hovered.current ? 0.3 : 1)
    groupRef.current.rotation.y += speed * delta * 60
    if (matRef.current) matRef.current.uniforms.uTime.value += delta
    if (cloudRef.current) cloudRef.current.uniforms.uTime.value += delta
  })

  const r = data.radius

  return (
    <group ref={groupRef} position={data.position} rotation={[data.tilt, 0, 0]}>
      {/* Surface */}
      <mesh>
        <sphereGeometry args={[r, 128, 128]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={planetVertex}
          fragmentShader={planetFragment}
          uniforms={uniforms}
        />
      </mesh>

      {/* Atmosphere — thin shell */}
      {data.hasAtmosphere && (
        <mesh>
          <sphereGeometry args={[r * 1.04, 64, 64]} />
          <shaderMaterial
            vertexShader={atmosphereVertex}
            fragmentShader={atmosphereFragment}
            uniforms={uniforms}
            transparent
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Clouds */}
      {data.hasClouds && (
        <mesh>
          <sphereGeometry args={[r * 1.02, 96, 96]} />
          <shaderMaterial
            ref={cloudRef}
            vertexShader={cloudVertex}
            fragmentShader={cloudFragment}
            uniforms={cloudUniforms}
            transparent
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Rings */}
      {data.hasRings && (
        <mesh rotation={[-Math.PI / 2.2, 0, 0]}>
          <ringGeometry args={[r * 1.4, r * 2.2, 64]} />
          <shaderMaterial
            vertexShader={ringVertex}
            fragmentShader={ringFragment}
            uniforms={ringUniforms}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Star glow */}
      {data.type === 'star' && <pointLight color={data.colors.primary} intensity={5} distance={15} />}
    </group>
  )
}
