import { useRef, useMemo, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const STAR_COUNT = 10000
const SHOOTING_STAR_COUNT = 6

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
  const { pointer } = useThree()
  const smoothMouse = useRef({ x: 0, y: 0 })

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
      sz[i] = rng < 0.70 ? 0.20 + Math.random() * 0.30
            : rng < 0.90 ? 0.50 + Math.random() * 0.50
            :              0.90 + Math.random() * 0.70

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
        uMouse: { value: new THREE.Vector2(0, 0) },
      },
      vertexShader: /* glsl */ `
        attribute float aSize;
        attribute vec3 aColor;
        varying vec3 vColor;
        varying float vBrightness;
        uniform float uTime;
        uniform vec2 uMouse;

        // Simple hash for per-star twinkle phase
        float hash(float n) { return fract(sin(n) * 43758.5453); }

        void main() {
          vColor = aColor;

          // Mouse parallax — bigger stars shift more (depth illusion)
          float parallaxStrength = aSize * 1.8;
          vec3 displaced = position + vec3(
            uMouse.x * parallaxStrength,
            uMouse.y * parallaxStrength,
            0.0
          );

          vec4 mv = modelViewMatrix * vec4(displaced, 1.0);

          // Twinkle: slow sine with per-star offset
          float phase = hash(float(gl_VertexID)) * 6.2831;
          float speed = 0.4 + hash(float(gl_VertexID) + 100.0) * 1.2;
          vBrightness = 0.6 + 0.4 * sin(uTime * speed + phase);

          gl_PointSize = aSize * (400.0 / -mv.z);
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
          gl_FragColor = vec4(vColor * vBrightness * 1.5, alpha);
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

      // Smooth mouse follow
      smoothMouse.current.x += (pointer.x - smoothMouse.current.x) * 0.05
      smoothMouse.current.y += (pointer.y - smoothMouse.current.y) * 0.05
      material.uniforms.uMouse.value.set(smoothMouse.current.x, smoothMouse.current.y)
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

/* ─── Shooting Stars ─────────────────────────────────────────────────────────
   Each shooting star is a thin stretched mesh that streaks across the sky,
   fades in/out, and respawns at a random position after a random cooldown.
   ──────────────────────────────────────────────────────────────────────────── */

const TRAIL_COLORS = ['#4ade80', '#67e8f9', '#a78bfa', '#ffffff', '#fbbf24', '#f472b6']

interface ShootingStar {
  position: THREE.Vector3
  direction: THREE.Vector3
  speed: number
  life: number      // 0→1 progress
  delay: number     // seconds to wait before starting
  waiting: number   // current wait counter
  length: number
  color: THREE.Color
}

function ShootingStars() {
  const groupRef = useRef<THREE.Group>(null)

  const initStar = useCallback((): ShootingStar => {
    // Random point on a sphere shell
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const r = 40 + Math.random() * 40
    const pos = new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
    )

    // Direction: roughly tangent to the sphere, biased downward for natural look
    const dir = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      -0.3 - Math.random() * 0.7,
      (Math.random() - 0.5) * 2,
    ).normalize()

    return {
      position: pos,
      direction: dir,
      speed: 12 + Math.random() * 18,
      life: 0,
      delay: 2 + Math.random() * 8,        // 2–10s between spawns
      waiting: Math.random() * 10,           // stagger initial appearance
      length: 1.2 + Math.random() * 2.5,
      color: new THREE.Color(TRAIL_COLORS[Math.floor(Math.random() * TRAIL_COLORS.length)]),
    }
  }, [])

  const stars = useMemo(
    () => Array.from({ length: SHOOTING_STAR_COUNT }, () => initStar()),
    [initStar],
  )

  // One shared geometry, individual mesh refs
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])

  useFrame((_, delta) => {
    stars.forEach((s, i) => {
      const mesh = meshRefs.current[i]
      if (!mesh) return

      // Waiting phase — invisible
      if (s.waiting > 0) {
        s.waiting -= delta
        mesh.visible = false
        return
      }

      mesh.visible = true
      s.life += delta * (s.speed / (s.length * 8))

      if (s.life >= 1) {
        // Respawn
        const fresh = initStar()
        Object.assign(s, fresh)
        mesh.visible = false
        return
      }

      // Move along direction
      s.position.addScaledVector(s.direction, s.speed * delta)

      // Fade curve: quick fade-in, long visible, quick fade-out
      const fade = s.life < 0.1 ? s.life / 0.1
                 : s.life > 0.7 ? (1 - s.life) / 0.3
                 : 1

      mesh.position.copy(s.position)

      // Align mesh with direction
      const target = s.position.clone().add(s.direction)
      mesh.lookAt(target)

      // Scale: stretch along Z (forward), thin X/Y
      mesh.scale.set(0.015, 0.015, s.length)

      // Update material opacity
      const mat = mesh.material as THREE.MeshBasicMaterial
      mat.opacity = fade * 0.85
      mat.color.copy(s.color)
    })
  })

  return (
    <group ref={groupRef}>
      {stars.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el }}
          visible={false}
        >
          <cylinderGeometry args={[0, 1, 1, 4, 1]} />
          <meshBasicMaterial
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

/* ─── Cinematic Galaxy ────────────────────────────────────────────────────────
   Vibrant spiral galaxy matching Hubble deep-field imagery: bright golden core,
   interleaved blue/orange/pink/purple arms, dense star clusters, dust lanes,
   wispy outer tendrils, HII emission regions, and cinematic color grading.
   ──────────────────────────────────────────────────────────────────────────── */

function Galaxy({ position = [3, 2.5, -62] as [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        uniform float uTime;
        varying vec2 vUv;

        // ─── Noise ───────────────────────────────────────────────
        vec3 mod289(vec3 x){ return x-floor(x*(1./289.))*289.; }
        vec2 mod289(vec2 x){ return x-floor(x*(1./289.))*289.; }
        vec3 permute(vec3 x){ return mod289(((x*34.)+1.)*x); }
        float snoise(vec2 v){
          const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);
          vec2 i=floor(v+dot(v,C.yy)),x0=v-i+dot(i,C.xx);
          vec2 i1=(x0.x>x0.y)?vec2(1,0):vec2(0,1);
          vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1; i=mod289(i);
          vec3 p=permute(permute(i.y+vec3(0,i1.y,1))+i.x+vec3(0,i1.x,1));
          vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
          m=m*m; m=m*m;
          vec3 x2=2.*fract(p*C.www)-1., h=abs(x2)-.5, ox=floor(x2+.5), a0=x2-ox;
          m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
          vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;
          return 130.*dot(m,g);
        }
        float hash21(vec2 p){ p=fract(p*vec2(234.34,435.345)); p+=dot(p,p+34.23); return fract(p.x*p.y); }
        float hash11(float p){ return fract(sin(p*127.1)*43758.5453); }

        // FBM with octave rotation
        float fbm(vec2 p, int oct){
          float f=0., a=.5;
          mat2 rot=mat2(.8,-.6,.6,.8);
          for(int i=0;i<8;i++){ if(i>=oct)break; f+=a*snoise(p); p=rot*p*2.1; a*=.48; }
          return f;
        }

        // Domain-warped FBM for gas filaments
        float wfbm(vec2 p, float t){
          vec2 q=vec2(fbm(p,5),fbm(p+vec2(5.2,1.3),5));
          vec2 r=vec2(fbm(p+4.*q+vec2(1.7,9.2)+.12*t,5),fbm(p+4.*q+vec2(8.3,2.8)+.1*t,5));
          return fbm(p+3.5*r,6);
        }

        // Logarithmic spiral arm
        float spiralArm(float a, float r, float twist, float off, float w){
          float s=log(max(r,.001))/twist - a + off;
          s=mod(s+3.14159,6.28318)-3.14159;
          return exp(-s*s/(w*w));
        }

        // Multi-layer star field
        float stars(vec2 uv, float density){
          float s=0.;
          for(float i=1.;i<=4.;i+=1.){
            vec2 g=uv*density*i, id=floor(g), gv=fract(g)-.5;
            vec2 off=vec2(hash21(id),hash21(id+64.))-.5;
            float d=length(gv-off*.7);
            float b=hash21(id+128.); b=pow(b,4.5);
            float sz=.02/i;
            s+=smoothstep(sz,sz*.08,d)*b;
          }
          return s;
        }

        // Bright star sparkle with diffraction cross
        float brightStar(vec2 uv, vec2 pos, float brightness){
          vec2 d=uv-pos;
          float r=length(d);
          float glow=brightness*0.008/(r*r+0.0003);
          // Cross spikes
          float spike=brightness*0.002/(abs(d.x)*8.+abs(d.y)*8.+0.01);
          return glow+spike*0.3;
        }

        void main(){
          vec2 uv=vUv-.5;
          // Elliptical tilt — galaxy viewed at ~30° angle
          uv.y*=1.25;
          uv=mat2(.98,-.17,.17,.98)*uv; // slight rotation

          float dist=length(uv);
          float angle=atan(uv.y,uv.x);
          float t=uTime*.015;

          // ── Disc profile ──
          float disc=exp(-dist*4.2)+.18*exp(-dist*1.6);
          float edge=1.-smoothstep(.32,.5,dist);
          // Wispy outer tendrils beyond the main disc
          float tendrils=max(0.,fbm(vec2(angle*2.,dist*8.)+t,5))*.15*exp(-dist*2.5);
          disc=disc*edge+tendrils;
          if(disc<.001) discard;

          // ── Spiral arms: 2 major + 2 minor + filamentary sub-arms ──
          float tw=.26, w=.36;
          float arm=0.;
          arm+=spiralArm(angle,dist,tw, 0.  , w);
          arm+=spiralArm(angle,dist,tw, 3.14, w);
          arm+=.5*spiralArm(angle,dist,tw*.88, 1.57, w*1.2);
          arm+=.5*spiralArm(angle,dist,tw*.88, 4.71, w*1.2);
          // Fine filamentary sub-arms
          arm+=.25*spiralArm(angle,dist,tw*1.1, .8, w*.7);
          arm+=.25*spiralArm(angle,dist,tw*1.1, 3.94, w*.7);
          arm=clamp(arm,0.,1.);

          // Ragged arm edges via noise
          float an=fbm(vec2(angle*4.,dist*14.)+t*.6,6)*.45;
          arm=clamp(arm+an*arm,0.,1.);

          // ── Gas layers ──
          vec2 pol=vec2(angle/6.283,dist*3.);
          float gas1=wfbm(pol*2.5,t);
          float gas2=fbm(pol*5.+3.7,5);
          float gas3=fbm(vec2(angle*6.,dist*22.),6);

          // Dust lanes — dark filaments
          float dustRaw=fbm(vec2(angle*5.+t*.08,dist*20.),7);
          float dust=smoothstep(.0,.45,dustRaw)*.55;
          // Extra dust in inner region
          dust+=smoothstep(-.1,.3,gas2)*.2*exp(-dist*5.);

          // ── COLOR PALETTE (matching reference) ────────────────
          vec3 coreGold   = vec3(1., .92, .55);      // bright golden-yellow center
          vec3 coreWhite  = vec3(1., .97, .92);      // hot white inner core
          vec3 amber      = vec3(1., .68, .22);      // orange spiral lanes
          vec3 armBlue    = vec3(.22, .48, 1.);      // vivid blue arms
          vec3 armCyan    = vec3(.15, .82, .95);     // electric cyan
          vec3 armPurple  = vec3(.65, .18, .92);     // vibrant purple
          vec3 lavender   = vec3(.72, .55, .95);     // soft lavender
          vec3 hotPink    = vec3(1., .2, .55);       // H-alpha hot pink
          vec3 rose       = vec3(.95, .4, .65);      // softer rose
          vec3 peach      = vec3(1., .75, .5);       // warm peach in arms
          vec3 gold       = vec3(1., .85, .2);       // golden nebula patches
          vec3 outerViolet= vec3(.35, .12, .55);     // deep outer halo

          // ── Color composition ─────────────────────────────────
          // Core: white → golden yellow
          vec3 col=mix(coreWhite, coreGold, smoothstep(0.,.06,dist));
          // Inner: golden → amber
          col=mix(col, amber, smoothstep(.03,.12,dist)*.7);

          // Arms: interleave blue and orange along the spiral angle
          float colorWave=sin(angle*2.+dist*15.)*.5+.5;
          vec3 armColor=mix(armBlue, amber, colorWave);
          // Add purple in between
          float purpleWave=sin(angle*3.-dist*10.+2.)*.5+.5;
          armColor=mix(armColor, armPurple, purpleWave*.4);
          // Cyan highlights
          float cyanWave=sin(angle*4.+dist*18.+4.)*.5+.5;
          armColor=mix(armColor, armCyan, cyanWave*.25);

          col=mix(col, armColor, smoothstep(.06,.22,dist)*arm*.85);

          // Lavender diffuse glow between arms
          col=mix(col, lavender, smoothstep(.08,.28,dist)*(1.-arm)*.2);

          // Pink/rose HII emission nebulae scattered in arms
          float pinkRegion=smoothstep(.15,.6,gas1)*arm;
          float pinkPatch=smoothstep(.1,.5,gas2)*arm;
          col=mix(col, hotPink, pinkRegion*.4);
          col=mix(col, rose, pinkPatch*.3);

          // Golden nebula patches (like in the reference inner arms)
          float goldRegion=smoothstep(-.05,.4,fbm(pol*3.5+9.,4))*arm*smoothstep(.25,.08,dist);
          col=mix(col, gold, goldRegion*.35);

          // Peach warm tones in mid-arms
          float peachRegion=smoothstep(.0,.5,gas3)*arm*smoothstep(.1,.2,dist);
          col=mix(col, peach, peachRegion*.2);

          // Outer halo: deep violet/purple
          col=mix(col, outerViolet, smoothstep(.22,.45,dist)*.5);
          // Wispy purple outer gas
          col=mix(col, lavender, tendrils*2.5);

          // ── BRIGHTNESS ────────────────────────────────────────
          // Core bulge — controlled, not blown out
          float cBulge=exp(-dist*16.)*.55;
          // Warm glow extending from core
          float cGlow=exp(-dist*6.)*.15;
          // Arm brightness — this is the main visible structure
          float aBright=arm*(.5+.4*smoothstep(.3,-.1,gas1));
          // Diffuse inter-arm
          float diff=.06*exp(-dist*3.);
          float bright=cBulge+cGlow+aBright+diff;

          // Dust lane darkening
          bright*=(1.-dust*arm);
          col*=bright*disc;

          // ── DENSE STAR FIELD ──────────────────────────────────
          // Arm stars (bright blue-white in arms)
          float armS=stars(vUv, 150.)*(0.25+arm*.75);
          // Core star concentration
          float coreS=stars(vUv+7.77, 100.)*exp(-dist*5.)*.6;
          // Scattered field stars
          float scatS=stars(vUv+3.33, 60.)*.1;
          // Very fine micro-stars
          float microS=stars(vUv+11.11, 250.)*.08;

          // Star color varies: core=warm, arms=blue-white, scattered=mixed
          vec3 sCol=mix(vec3(1.,.9,.7), vec3(.72,.82,1.), smoothstep(.04,.2,dist));
          // Some stars pick up arm colors
          vec3 tintedStarCol=mix(sCol, armColor*.5+.5, arm*.3);
          col+=tintedStarCol*(armS+coreS+scatS+microS)*disc*.8;

          // ── BRIGHT INDIVIDUAL STARS (like in reference) ───────
          float bStars=0.;
          for(float i=0.;i<12.;i++){
            float h1=hash11(i*13.7), h2=hash11(i*29.3+5.), h3=hash11(i*47.1+10.);
            vec2 sPos=vec2(h1-.5,h2-.5)*.7;
            float sBright=h3*.6+.2;
            // Only show stars where there's arm density
            float sArm=spiralArm(atan(sPos.y,sPos.x),length(sPos),tw,0.,w*.8)+
                        spiralArm(atan(sPos.y,sPos.x),length(sPos),tw,3.14,w*.8);
            bStars+=brightStar(uv,sPos,sBright*clamp(sArm+.2,0.,1.));
          }
          col+=vec3(.85,.9,1.)*bStars*disc*.2;

          // ── Core bloom ────────────────────────────────────────
          float bloom=exp(-dist*8.)*.22;
          col+=coreGold*bloom;

          // ── HII region bright knots ───────────────────────────
          float k1=pow(max(snoise(vec2(angle*8.,dist*28.)+t*.3),0.),3.5);
          float k2=pow(max(snoise(vec2(angle*12.,dist*35.)+t*.2+5.),0.),4.);
          col+=hotPink*k1*arm*.22*disc;
          col+=vec3(.4,.55,1.)*k2*arm*.15*disc;

          // ── Cinematic color grading ───────────────────────────
          // Preserve color saturation: tonemap luminance only, keep chrominance
          float lumPre=dot(col,vec3(.299,.587,.114));
          float lumTM=lumPre/(lumPre+.5); // softer tonemap curve
          col*=(lumPre>0.001) ? lumTM/lumPre : 1.;
          col=pow(col,vec3(.9));
          // Strong saturation boost
          float luma2=dot(col,vec3(.299,.587,.114));
          col=mix(vec3(luma2),col,1.6);
          // Clamp to prevent negative from saturation boost
          col=max(col,0.);
          // Teal shadow / warm highlight split tone
          col.r+=.008;
          col.b+=.02*(1.-luma2);

          float alpha=clamp(disc*(bright+.1),0.,1.);
          if(alpha<.002) discard;
          gl_FragColor=vec4(col,alpha*.9);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    })
  }, [])

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.00012
    }
  })

  return (
    <mesh ref={meshRef} position={position} rotation={[0.3, 0, 0.35]} material={material}>
      <planeGeometry args={[28, 28, 1, 1]} />
    </mesh>
  )
}

export function StarsWithShootingStars() {
  return (
    <>
      <Stars />
      <ShootingStars />
      <Galaxy />
    </>
  )
}

