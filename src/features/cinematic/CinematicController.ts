// CinematicController.ts — Zustand store + R3F hook for cinematic camera flythrough
import { create } from 'zustand'
import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { buildCinematicPath, buildLookAtPath } from './CameraPath'

interface CinematicState {
  active: boolean
  progress: number
  start: () => void
  stop: () => void
  setProgress: (p: number) => void
}

export const useCinematicStore = create<CinematicState>((set) => ({
  active: false,
  progress: 0,
  start: () => set({ active: true, progress: 0 }),
  stop: () => set({ active: false, progress: 0 }),
  setProgress: (p) => set({ progress: p }),
}))

/**
 * Map eased camera progress to the planet section the camera is nearest to.
 * The spline has 6 control points → 5 segments:
 *   0→0.2: space→About, 0.2→0.4: About→Skills, 0.4→0.6: Skills→Experience,
 *   0.6→0.8: Experience→Projects, 0.8→1.0: Projects→About (return)
 * Switch at segment midpoints so the tab updates while the camera is in transit.
 */
function sectionForProgress(eased: number): number {
  if (eased < 0.3) return 0  // About
  if (eased < 0.5) return 1  // Skills
  if (eased < 0.7) return 2  // Experience
  if (eased < 0.9) return 3  // Projects
  return 0                    // Returning to About
}

/**
 * R3F hook that drives the camera along the cinematic spline when active.
 * Drop this into the Scene component. It takes over camera control only while active.
 */
export function useCinematicCamera(
  onComplete: () => void,
  onSectionChange?: (sectionIndex: number) => void,
) {
  const { camera } = useThree()
  const active = useCinematicStore((s) => s.active)
  const setProgress = useCinematicStore((s) => s.setProgress)
  const stop = useCinematicStore((s) => s.stop)

  const pathRef = useRef<THREE.CatmullRomCurve3 | null>(null)
  const lookRef = useRef<THREE.CatmullRomCurve3 | null>(null)
  const progressRef = useRef(0)
  const posVec = useRef(new THREE.Vector3())
  const lookVec = useRef(new THREE.Vector3())
  const lastCineSectionRef = useRef(-1)
  const onSectionChangeRef = useRef(onSectionChange)
  onSectionChangeRef.current = onSectionChange

  // Build paths on first activation
  useEffect(() => {
    if (active && !pathRef.current) {
      pathRef.current = buildCinematicPath()
      lookRef.current = buildLookAtPath()
      lastCineSectionRef.current = -1
    }
  }, [active])

  useFrame((_, delta) => {
    if (!active || !pathRef.current || !lookRef.current) return

    // Advance progress — total duration ~20 seconds
    const speed = 1 / 20 // full path in 20 seconds
    progressRef.current += delta * speed

    if (progressRef.current >= 1) {
      progressRef.current = 1
      stop()
      onComplete()
      return
    }

    // Ease the progress for smoother acceleration/deceleration
    const eased = easeInOutCubic(progressRef.current)

    pathRef.current.getPoint(eased, posVec.current)
    lookRef.current.getPoint(eased, lookVec.current)

    camera.position.copy(posVec.current)
    camera.lookAt(lookVec.current)

    setProgress(progressRef.current)

    // Update section tabs as the camera passes each planet
    const newSection = sectionForProgress(eased)
    if (newSection !== lastCineSectionRef.current) {
      lastCineSectionRef.current = newSection
      onSectionChangeRef.current?.(newSection)
    }
  })

  // Reset on unmount
  useEffect(() => {
    return () => {
      progressRef.current = 0
    }
  }, [])
}

function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2
}
