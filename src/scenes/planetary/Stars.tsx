import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const STAR_COUNT = 4000

/* Soft radial glow texture generated on the fly */
function createStarTexture(): THREE.Texture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const half = size / 2

  // Outer soft halo
  const outer = ctx.createRadialGradient(half, half, 0, half, half, half)
  outer.addColorStop(0, 'rgba(255,255,255,1)')
  outer.addColorStop(0.15, 'rgba(200,220,255,0.8)')
  outer.addColorStop(0.4, 'rgba(140,170,255,0.15)')
  outer.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = outer
  ctx.fillRect(0, 0, size, size)

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

/* Star color palette — warm white, cool blue-white, subtle gold, pale blue */
const STAR_COLORS = [
  new THREE.Color('#fffaf0'), // warm white
  new THREE.Color('#cad8ff'), // blue-white (class A/B)
  new THREE.Color('#aabfff'), // deeper blue (class B)
  new THREE.Color('#fff4e0'), // pale gold (class G)
  new THREE.Color('#ffecd2'), // soft amber
  new THREE.Color('#e0e8ff'), // cool white
]

export function Stars() {
  const ref = useRef<THREE.Points>(null)

  const { positions, sizes, colors } = useMemo(() => {
    const pos = new Float32Array(STAR_COUNT * 3)
    const sz = new Float32Array(STAR_COUNT)
    const col = new Float32Array(STAR_COUNT * 3)
    const tmpColor = new THREE.Color()

    for (let i = 0; i < STAR_COUNT; i++) {
      // Distribute in a spherical shell
      const r = 35 + Math.random() * 65
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)

      // Varying star sizes — mostly small, a few bright ones
      const rng = Math.random()
      sz[i] = rng < 0.85 ? 0.08 + Math.random() * 0.12
            : rng < 0.97 ? 0.2 + Math.random() * 0.25
            :              0.4 + Math.random() * 0.35

      // Pick a color from the palette with slight randomisation
      tmpColor.copy(STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)])
      col[i * 3] = tmpColor.r
      col[i * 3 + 1] = tmpColor.g
      col[i * 3 + 2] = tmpColor.b
    }
    return { positions: pos, sizes: sz, colors: col }
  }, [])

  const starTexture = useMemo(() => createStarTexture(), [])

  /* Gentle twinkle via per-frame opacity modulation on the shader  */
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: starTexture },
      },
      vertexShader: /* glsl */ `
        attribute float aSize;
        attribute vec3 aColor;
        varying vec3 vColor;
        varying float vBrightness;
        uniform float uTime;

        // Simple hash for per-star twinkle phase
        float hash(float n) { return fract(sin(n) * 43758.5453); }

        void main() {
          vColor = aColor;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);

          // Twinkle: slow sine with per-star offset
          float phase = hash(float(gl_VertexID)) * 6.2831;
          float speed = 0.4 + hash(float(gl_VertexID) + 100.0) * 1.2;
          vBrightness = 0.6 + 0.4 * sin(uTime * speed + phase);

          gl_PointSize = aSize * (280.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uTexture;
        varying vec3 vColor;
        varying float vBrightness;

        void main() {
          vec4 tex = texture2D(uTexture, gl_PointCoord);
          float alpha = tex.a * vBrightness;
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(vColor * vBrightness * 1.2, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  }, [starTexture])

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.002
      material.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <points ref={ref} material={material}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
      </bufferGeometry>
    </points>
  )
}
