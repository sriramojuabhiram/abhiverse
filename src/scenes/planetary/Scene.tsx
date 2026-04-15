import { useRef, useCallback, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { Environment } from '@react-three/drei'
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Planet } from './Planet'
import { TechOrbs } from './Astronaut'
import { Character } from './Character'
import { Stars } from './Stars'
import { planets } from './planetData'

interface SceneProps {
  section: number
  setSection: (s: number) => void
}

export function Scene({ section, setSection }: SceneProps) {
  const { camera, gl } = useThree()
  const lookTarget = useRef(new THREE.Vector3())
  const isAnimating = useRef(false)

  /* Camera transition on section change */
  useEffect(() => {
    const p = planets[section]
    if (!p) return
    isAnimating.current = true

    gsap.to({}, {
      duration: 1.4,
      ease: 'power3.inOut',
      onUpdate() {
        const progress = this.progress()
        camera.position.lerpVectors(
          camera.position.clone(),
          new THREE.Vector3(...p.cameraPosition),
          progress * 0.08,
        )
        lookTarget.current.lerp(new THREE.Vector3(...p.cameraLookAt), progress * 0.08)
      },
      onComplete() {
        camera.position.set(...p.cameraPosition)
        lookTarget.current.set(...p.cameraLookAt)
        isAnimating.current = false
      },
    })
  }, [section, camera])

  /* Look at target every frame */
  useFrame(() => {
    camera.lookAt(lookTarget.current)
  })

  /* Scroll navigation */
  const cooldown = useRef(false)
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 30 || cooldown.current || isAnimating.current) return
      cooldown.current = true
      setTimeout(() => (cooldown.current = false), 1400)
      if (e.deltaY > 0 && section < planets.length - 1) setSection(section + 1)
      else if (e.deltaY < 0 && section > 0) setSection(section - 1)
    },
    [section, setSection],
  )

  useEffect(() => {
    const canvas = gl.domElement
    canvas.addEventListener('wheel', handleWheel, { passive: true })
    return () => canvas.removeEventListener('wheel', handleWheel)
  }, [gl, handleWheel])

  /* Keyboard navigation */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (isAnimating.current) return
      if ((e.key === 'ArrowDown' || e.key === 'ArrowRight') && section < planets.length - 1)
        setSection(section + 1)
      else if ((e.key === 'ArrowUp' || e.key === 'ArrowLeft') && section > 0)
        setSection(section - 1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [section, setSection])

  /* Set initial camera position */
  useEffect(() => {
    const p = planets[0]
    if (p) {
      camera.position.set(...p.cameraPosition)
      lookTarget.current.set(...p.cameraLookAt)
    }
  }, [camera])

  return (
    <>
      <Stars />
      <ambientLight intensity={0.08} color="#c4c8f8" />
      <Environment preset="warehouse" environmentIntensity={1.25} />
      <hemisphereLight intensity={0.2} color="#d0d4ff" groundColor="#12141e" />
      <directionalLight
        position={[11, 8, 6]}
        intensity={2.2}
        color="#fff4e8"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-7, 3, -5]} intensity={0.6} color="#818cf8" />
      <pointLight position={[5, 6, -36]} intensity={0.7} color="#fbbf24" distance={22} />
      <pointLight position={[0, 10, -18]} intensity={0.55} color="#a78bfa" distance={60} />
      {planets.map((p) => (
        p.id === 'ai-clone' ? (
          <AstronautHitArea
            key={p.id}
            data={p}
            onSelect={() => setSection(planets.indexOf(p))}
          />
        ) : (
          <PlanetHitArea
            key={p.id}
            data={p}
            onSelect={() => setSection(planets.indexOf(p))}
          />
        )
      ))}
      <EffectComposer multisampling={4}>
        <Bloom
          mipmapBlur
          intensity={0.32}
          luminanceThreshold={0.75}
          luminanceSmoothing={0.18}
        />
        <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.06} />
        <Vignette eskil={false} offset={0.16} darkness={0.55} />
      </EffectComposer>
    </>
  )
}

interface PlanetHitAreaProps {
  data: (typeof planets)[number]
  onSelect: () => void
}

function PlanetHitArea({ data, onSelect }: PlanetHitAreaProps) {
  const hovered = useRef(false)
  const scaleRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!scaleRef.current) return
    const target = hovered.current ? 1.08 : 1
    scaleRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.08)
  })

  return (
    <group ref={scaleRef}>
      <Planet data={data} hovered={hovered} />
      {/* Invisible hit sphere */}
      <mesh
        position={data.position}
        onClick={onSelect}
        onPointerOver={() => {
          hovered.current = true
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          hovered.current = false
          document.body.style.cursor = 'default'
        }}
      >
        <sphereGeometry args={[data.radius * 1.3, 16, 16]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  )
}

function AstronautHitArea({ data, onSelect }: PlanetHitAreaProps) {
  const scaleRef = useRef<THREE.Group>(null)
  const hovered = useRef(false)

  useFrame(() => {
    if (!scaleRef.current) return
    const target = hovered.current ? 1.06 : 1
    scaleRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.06)
  })

  return (
    <group ref={scaleRef}>
      <Character position={data.position} />
      <TechOrbs center={data.position} />
      {/* Cinematic character lighting */}
      <spotLight
        position={[data.position[0] + 2.3, data.position[1] + 2.8, data.position[2] + 3.1]}
        angle={0.42}
        penumbra={0.7}
        intensity={2.8}
        color="#fff3df"
        distance={16}
      />
      {/* Rim light from behind — cinematic edge highlight */}
      <pointLight position={[data.position[0] - 1.2, data.position[1] + 2.2, data.position[2] - 2.5]} intensity={1.1} color="#c8d8ff" distance={7} />
      <pointLight position={[data.position[0] - 1.9, data.position[1] + 0.5, data.position[2] + 1.8]} intensity={0.65} color="#6e9bff" distance={9} />
      <pointLight position={[data.position[0], data.position[1] + 1.9, data.position[2] - 1.7]} intensity={0.52} color="#8d8bff" distance={9} />
      {/* Invisible hit area */}
      <mesh
        position={data.position}
        onClick={onSelect}
        onPointerOver={() => {
          hovered.current = true
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          hovered.current = false
          document.body.style.cursor = 'default'
        }}
      >
        <sphereGeometry args={[2, 16, 16]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  )
}
