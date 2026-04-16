// Character.tsx — astronaut model with zero-gravity float, typing visual FX,
// keystroke flash particles and cursor-follow body rotation.
// The GLB is a fully static mesh (no skeleton/bones), so real finger animation
// is impossible. Instead we sell the "typing" look with:
//   1. Body micro-wobble on a typing cadence
//   2. Bright keystroke flash particles near the keyboard
//   3. A pulsing screen glow light
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'
import type { GLTF } from 'three-stdlib'

type CharacterGLTF = GLTF & {
  scene: THREE.Group
  animations: THREE.AnimationClip[]
}

const CHARACTER_MODEL_URL = '/character/character.glb'

// ─── KeystrokeParticles ───────────────────────────────────────────────────────
// Tiny bright flashes near the keyboard that fire in a random typing rhythm.
const SPARK_COUNT = 18
const SPARK_COLORS = ['#4ade80', '#67e8f9', '#a78bfa', '#fbbf24', '#f472b6', '#ffffff']

function KeystrokeParticles({ keyboardCenter }: { keyboardCenter: [number, number, number] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Per-particle state
  const sparks = useMemo(() => {
    const arr: { phase: number; freq: number; ox: number; oz: number; color: THREE.Color }[] = []
    for (let i = 0; i < SPARK_COUNT; i++) {
      arr.push({
        phase: Math.random() * Math.PI * 2,
        freq: 4 + Math.random() * 10,           // keypress speed variation
        ox: (Math.random() - 0.5) * 0.28,        // spread over keyboard width
        oz: (Math.random() - 0.5) * 0.10,        // slight depth spread
        color: new THREE.Color(SPARK_COLORS[i % SPARK_COLORS.length]),
      })
    }
    return arr
  }, [])

  useEffect(() => {
    if (!meshRef.current) return
    sparks.forEach((s, i) => {
      meshRef.current!.setColorAt(i, s.color)
    })
    meshRef.current.instanceColor!.needsUpdate = true
  }, [sparks])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime

    for (let i = 0; i < SPARK_COUNT; i++) {
      const s = sparks[i]
      // Each spark "fires" when its sin wave crosses a threshold — like a key being pressed
      const wave = Math.sin(t * s.freq + s.phase)
      const active = wave > 0.85           // only visible ~15% of cycle — brief flash
      const brightness = active ? (wave - 0.85) / 0.15 : 0   // 0→1 during flash

      const px = keyboardCenter[0] + s.ox
      const py = keyboardCenter[1] + brightness * 0.04        // tiny upward pop
      const pz = keyboardCenter[2] + s.oz

      const sc = active ? 0.006 + brightness * 0.008 : 0.0001 // shrink to near-zero when off
      dummy.position.set(px, py, pz)
      dummy.scale.setScalar(sc)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, SPARK_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial transparent opacity={0.9} toneMapped={false} />
    </instancedMesh>
  )
}

// ─── Character ────────────────────────────────────────────────────────────────
export function Character({ position }: { position: [number, number, number] }) {
  const floatRef  = useRef<THREE.Group>(null)
  const bodyRef   = useRef<THREE.Group>(null)
  const screenRef = useRef<THREE.PointLight>(null)
  const mixerRef  = useRef<THREE.AnimationMixer | null>(null)
  const smooth    = useRef({ x: 0, y: 0 })

  const gltf  = useGLTF(CHARACTER_MODEL_URL) as CharacterGLTF
  const model = useMemo(() => SkeletonUtils.clone(gltf.scene) as THREE.Group, [gltf.scene])

  const metrics = useMemo(() => {
    const box    = new THREE.Box3().setFromObject(model)
    const size   = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    return { min: box.min, size, center }
  }, [model])

  // Auto-scale to a consistent display height
  const scale = useMemo(() => 2.05 / Math.max(metrics.size.y, 0.001), [metrics.size.y])

  // Keyboard center in model-local space (just in front of the chest/hands area)
  const kbCenter = useMemo<[number, number, number]>(() => [
    metrics.center.x,
    metrics.min.y + metrics.size.y * 0.46,
    metrics.center.z + metrics.size.z * 0.42,
  ], [metrics])

  useEffect(() => {
    model.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
    })

    // Play animation if the GLB ever ships with one (no-op for static meshes)
    const clips = gltf.animations ?? []
    if (clips.length > 0) {
      const mixer = new THREE.AnimationMixer(model)
      mixerRef.current = mixer
      const clip =
        THREE.AnimationClip.findByName(clips, 'Typing') ??
        THREE.AnimationClip.findByName(clips, 'typing') ??
        THREE.AnimationClip.findByName(clips, 'Idle') ??
        clips[0]
      const action = mixer.clipAction(clip)
      action.setLoop(THREE.LoopRepeat, Infinity)
      action.play()
    }

    return () => {
      mixerRef.current?.stopAllAction()
      mixerRef.current?.uncacheRoot(model)
      mixerRef.current = null
    }
  }, [gltf.animations, model])

  const { pointer } = useThree()

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    mixerRef.current?.update(delta)

    // Smooth pointer input
    smooth.current.x += (pointer.x - smooth.current.x) * 0.1
    smooth.current.y += (pointer.y - smooth.current.y) * 0.1

    // Zero-gravity floating — visible bob + slow sway
    if (floatRef.current) {
      floatRef.current.position.y =
        position[1] +
        Math.sin(t * 0.7) * 0.10 +
        Math.sin(t * 1.1) * 0.035

      // Translate body toward mouse direction
      floatRef.current.position.x = position[0] + smooth.current.x * 0.4
      floatRef.current.rotation.z = Math.sin(t * 0.35) * 0.018 - smooth.current.x * 0.06
    }

    // Cursor-follow body rotation + pronounced typing wobble
    if (bodyRef.current) {
      const tgtY =  smooth.current.x * 0.7
      const tgtX = -smooth.current.y * 0.35

      // Multi-frequency typing wobble — simulates irregular keystrokes
      const typeWobble =
        Math.sin(t * 7.5) * 0.018 +
        Math.sin(t * 12.3) * 0.009 +
        Math.sin(t * 17.9) * 0.005

      bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, tgtY, 0.06)
      bodyRef.current.rotation.x = THREE.MathUtils.lerp(
        bodyRef.current.rotation.x,
        tgtX + 0.08 + typeWobble,
        0.05,
      )
      // Slight shoulder sway from left-right hand typing
      bodyRef.current.rotation.z =
        Math.sin(t * 5.8) * 0.008 +
        Math.sin(t * 0.55) * 0.005
    }

    // Screen glow pulsing — subtle keystroke-synced flicker
    if (screenRef.current) {
      screenRef.current.intensity =
        0.9 +
        Math.sin(t * 5.3) * 0.12 +
        Math.sin(t * 11.9) * 0.06 +
        Math.sin(t * 19.7) * 0.03
    }
  })

  return (
    <group ref={floatRef} position={position} scale={scale}>
      <group ref={bodyRef}>
        <primitive object={model} />
        {/* Keystroke flash particles on the keyboard area */}
        <KeystrokeParticles keyboardCenter={kbCenter} />
      </group>

      {/* Screen glow light — at laptop screen level */}
      <pointLight
        ref={screenRef}
        position={[
          metrics.center.x,
          metrics.min.y + metrics.size.y * 0.50,
          metrics.center.z + metrics.size.z * 0.48,
        ]}
        intensity={0.9}
        color="#3a7ee8"
        distance={1.8}
        decay={2}
      />

      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.5}
        scale={20}
        blur={2.5}
        far={15}
        resolution={1024}
        color="#080a12"
      />
    </group>
  )
}

useGLTF.preload(CHARACTER_MODEL_URL)
