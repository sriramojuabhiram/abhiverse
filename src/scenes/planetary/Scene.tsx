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
import { StarsWithShootingStars } from './Stars'
import { planets } from './planetData'
import { useCinematicCamera, useCinematicStore } from '../../features/cinematic/CinematicController'

interface SceneProps {
  section: number
  setSection: (s: number) => void
}

export function Scene({ section, setSection }: SceneProps) {
  const { camera, gl } = useThree()
  const lookTarget = useRef(new THREE.Vector3())
  const isAnimating = useRef(false)
  const cinematicActive = useCinematicStore((s) => s.active)

  // Cinematic camera flythrough — takes over camera when active
  useCinematicCamera(() => {
    // On cinematic complete, snap camera back to current section
    const p = planets[section]
    if (p) {
      camera.position.set(...p.cameraPosition)
      lookTarget.current.set(...p.cameraLookAt)
    }
  }, setSection)

  /* Camera transition on section change */
  useEffect(() => {
    if (cinematicActive) return // Don't interfere with cinematic
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
  }, [section, camera, cinematicActive])

  /* Look at target every frame (skip during cinematic — it controls camera directly) */
  useFrame(() => {
    if (cinematicActive) return
    camera.lookAt(lookTarget.current)
  })

  /* Scroll navigation */
  const cooldown = useRef(false)
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (cinematicActive || Math.abs(e.deltaY) < 30 || cooldown.current || isAnimating.current) return
      cooldown.current = true
      setTimeout(() => (cooldown.current = false), 1400)
      if (e.deltaY > 0 && section < planets.length - 1) setSection(section + 1)
      else if (e.deltaY < 0 && section > 0) setSection(section - 1)
    },
    [section, setSection, cinematicActive],
  )

  useEffect(() => {
    const canvas = gl.domElement
    canvas.addEventListener('wheel', handleWheel, { passive: true })
    return () => canvas.removeEventListener('wheel', handleWheel)
  }, [gl, handleWheel])

  /* Touch swipe navigation */
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const canvas = gl.domElement
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      }
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current || isAnimating.current || cooldown.current) return
      const touch = e.changedTouches[0]
      const dx = touch.clientX - touchStart.current.x
      const dy = touch.clientY - touchStart.current.y
      touchStart.current = null
      // Only trigger on vertical swipes with enough distance
      if (Math.abs(dy) < 40 || Math.abs(dx) > Math.abs(dy)) return
      cooldown.current = true
      setTimeout(() => (cooldown.current = false), 1400)
      if (dy < 0 && section < planets.length - 1) setSection(section + 1)
      else if (dy > 0 && section > 0) setSection(section - 1)
    }
    canvas.addEventListener('touchstart', onTouchStart, { passive: true })
    canvas.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchend', onTouchEnd)
    }
  }, [gl, section, setSection])

  /* Keyboard navigation */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (isAnimating.current || cinematicActive) return
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
      <StarsWithShootingStars />
      <ambientLight intensity={0.04} color="#c4c8f8" />
      <Environment preset="warehouse" environmentIntensity={0.35} />
      <hemisphereLight intensity={0.12} color="#d0d4ff" groundColor="#12141e" />
      <directionalLight
        position={[11, 8, 6]}
        intensity={1.1}
        color="#fff4e8"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-7, 3, -5]} intensity={0.35} color="#818cf8" />
      <pointLight position={[5, 6, -36]} intensity={0.5} color="#fbbf24" distance={22} />
      <pointLight position={[0, 10, -18]} intensity={0.35} color="#a78bfa" distance={60} />
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
          intensity={0.4}
          luminanceThreshold={0.55}
          luminanceSmoothing={0.25}
        />
        <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.08} />
        <Vignette eskil={false} offset={0.12} darkness={0.7} />
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
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!scaleRef.current) return
    const target = hovered.current ? 1.15 : 1
    scaleRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.06)
    // Animate glow ring opacity
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      const targetOpacity = hovered.current ? 0.35 : 0
      mat.opacity += (targetOpacity - mat.opacity) * 0.08
    }
  })

  return (
    <group ref={scaleRef}>
      <Planet data={data} hovered={hovered} />
      {/* Hover glow ring */}
      <mesh
        ref={glowRef}
        position={data.position}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[data.radius * 1.15, data.radius * 1.35, 64]} />
        <meshBasicMaterial
          color={data.colors.atmosphere}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Hover point light */}
      {hovered.current && (
        <pointLight
          position={data.position}
          color={data.colors.atmosphere}
          intensity={2}
          distance={6}
        />
      )}
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
        <sphereGeometry args={[data.radius * 1.5, 16, 16]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  )
}

function AstronautHitArea({ data, onSelect }: PlanetHitAreaProps) {
  return (
    <group>
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
      {/* Click-only hit area — no hover reaction */}
      <mesh
        position={data.position}
        onClick={onSelect}
      >
        <sphereGeometry args={[2, 16, 16]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  )
}
