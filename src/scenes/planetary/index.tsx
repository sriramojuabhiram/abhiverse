import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Scene } from './Scene'
import { planets } from './planetData'
import { CloneAIPanel } from '../../components/CloneAIPanel'
import { useAppStore } from '../../store/appStore'
import './PlanetaryScene.css'

export function PlanetaryScene() {
  const [section, setSection] = useState(0)
  const setAIOpen = useAppStore((s) => s.setAIOpen)
  const aiOpen = useAppStore((s) => s.aiOpen)
  const triggerGreeting = useAppStore((s) => s.triggerGreeting)

  const current = planets[section]
  const isAIClone = current?.id === 'ai-clone'

  const handleSection = (s: number) => {
    if (s === section) return
    setSection(s)
  }

  return (
    <div className="planetary-root">
      {/* R3F Canvas */}
      <Canvas
        className="planetary-canvas"
        shadows
        camera={{ fov: 50, near: 0.1, far: 200 }}
        dpr={[1, 2]}
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.08,
          antialias: true,
        }}
      >
        <color attach="background" args={['#020208']} />
        <fog attach="fog" args={['#020208', 30, 90]} />
        <Scene section={section} setSection={handleSection} />
      </Canvas>

      {/* Hero header */}
      <header className="planetary-hero">
        <h1>Abhiram.S</h1>
        <p>Senior .NET Full Stack Developer</p>
      </header>

      {/* Top tabs navigation */}
      <nav className="planetary-tabs" aria-label="Section tabs">
        {planets.map((p, i) => (
          <button
            key={p.id}
            className={`planetary-tabs__item${i === section ? ' planetary-tabs__item--active' : ''}`}
            onClick={() => handleSection(i)}
            title={`Go to ${p.name}`}
          >
            {p.name}
          </button>
        ))}
      </nav>

      {/* Info panel (hides on AI Clone section) */}
      {current && !isAIClone && (
        <div
          className={`info-panel info-panel--${current.panelSide}`}
          style={{ opacity: 1 }}
        >
          <span className="info-panel__tag">{current.subtitle}</span>
          <h2 className="info-panel__heading">{current.content.heading}</h2>
          <p className="info-panel__desc">{current.content.description}</p>
          <ul className="info-panel__list">
            {current.content.items.map((item) => (
              <li key={item.label}>
                <strong>{item.label}</strong>
                <span>{item.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI Clone section — open the chat panel */}
      {isAIClone && !aiOpen && (
        <div className="info-panel info-panel--right" style={{ opacity: 1 }}>
          <span className="info-panel__tag">Astronaut</span>
          <h2 className="info-panel__heading">Abhi AI Clone</h2>
          <p className="info-panel__desc">
            Chat with Abhi AI clone — powered by Groq and open-source models, trained on my experience, skills, and career.
          </p>
          <button
            className="ai-clone-open-btn"
            onClick={() => {
              triggerGreeting()
              setAIOpen(true)
            }}
          >
            Start Conversation
          </button>
        </div>
      )}

      {/* Nav dots */}
      <nav className="planetary-nav">
        {planets.map((p, i) => (
          <button
            key={p.id}
            className={`planetary-nav__dot${i === section ? ' planetary-nav__dot--active' : ''}`}
            onClick={() => handleSection(i)}
            title={p.name}
          >
            <span className="planetary-nav__label">{p.name}</span>
          </button>
        ))}
      </nav>

      {/* Scroll hint */}
      {section === 0 && (
        <div className="planetary-scroll-hint">
          <span>Scroll to explore</span>
          <div className="planetary-scroll-hint__arrow" />
        </div>
      )}

      {/* Footer */}
      <footer className="planetary-footer">
        <span>© 2024 Abhiram S.</span>
      </footer>

      {/* AI Chat Panel (overlay) */}
      <CloneAIPanel />
    </div>
  )
}
