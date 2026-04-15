import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { gsap } from 'gsap'
import * as THREE from 'three'
import { useAppStore } from '../store/appStore'

const CAMERAS: { pos: number[]; lookAt: number[]; fov: number }[] = [
  { pos: [0, 0.5, 9],   lookAt: [0, 0, 0], fov: 52 },
  { pos: [3, 0, 7],     lookAt: [0, 0, 0], fov: 48 },
  { pos: [0, 2.5, 8],   lookAt: [0, 0, 0], fov: 55 },
  { pos: [-1, 1, 9],    lookAt: [0, 0, 0], fov: 50 },
]

export function CameraRig() {
  const { camera } = useThree()
  const section  = useAppStore(s => s.section)
  const mouseX   = useAppStore(s => s.mouseX)
  const mouseY   = useAppStore(s => s.mouseY)
  const targetMX = useRef(0.5)
  const targetMY = useRef(0.5)

  useEffect(() => {
    const kf = CAMERAS[section]
    const [px, py, pz] = kf.pos

    gsap.to(camera.position, {
      x: px, y: py, z: pz,
      duration: 1.4,
      ease: 'power3.inOut',
    })
    const pc = camera as THREE.PerspectiveCamera
    gsap.to(pc, {
      fov: kf.fov,
      duration: 1.4,
      ease: 'power3.inOut',
      onUpdate: () => pc.updateProjectionMatrix(),
    })
  }, [section, camera])

  useFrame(() => {
    targetMX.current += (mouseX - targetMX.current) * 0.06
    targetMY.current += (mouseY - targetMY.current) * 0.06

    const offX = (targetMX.current - 0.5) * 1.4
    const offY = (targetMY.current - 0.5) * 0.8

    const kf = CAMERAS[section]
    camera.position.x += (kf.pos[0] + offX - camera.position.x) * 0.04
    camera.position.y += (kf.pos[1] - offY - camera.position.y) * 0.04
    camera.lookAt(kf.lookAt[0], kf.lookAt[1], kf.lookAt[2])
  })

  return null
}
