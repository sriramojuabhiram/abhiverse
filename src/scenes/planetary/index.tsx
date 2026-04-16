import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Scene } from './Scene'
import { planets } from './planetData'
import { CloneAIPanel } from '../../components/CloneAIPanel'
import { useAppStore } from '../../store/appStore'
import { useZoneTracker } from '../../hooks/useZoneTracker'
import { AIGuide } from '../../features/aiGuide/AIGuide'
import { CinematicOverlay } from '../../features/cinematic/CinematicOverlay'
import { HUD } from '../../features/ui/HUD'
import './PlanetaryScene.css'

// Lazy-loaded feature panels for performance
const GitHubPanel = lazy(() => import('../../features/github/GitHubPanel').then(m => ({ default: m.GitHubPanel })))
const DemoTerminal = lazy(() => import('../../features/demos/DemoTerminal').then(m => ({ default: m.DemoTerminal })))

function useIsMobile() {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return mobile
}

export function PlanetaryScene() {
  const [section, setSection] = useState(0)
  const setAIOpen = useAppStore((s) => s.setAIOpen)
  const aiOpen = useAppStore((s) => s.aiOpen)
  const triggerGreeting = useAppStore((s) => s.triggerGreeting)
  const isMobile = useIsMobile()

  const { enter } = useZoneTracker()
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  const [ghPanelOpen, setGhPanelOpen] = useState(false)
  const [demoPanelOpen, setDemoPanelOpen] = useState(false)

  const current = planets[section]
  const isAIClone = current?.id === 'ai-clone'

  // Close all feature panels
  const closeAllPanels = useCallback(() => {
    setAIOpen(false)
    setGhPanelOpen(false)
    setDemoPanelOpen(false)
  }, [setAIOpen])

  const openGitHub = useCallback(() => {
    closeAllPanels()
    setGhPanelOpen(true)
  }, [closeAllPanels])

  const openDemos = useCallback(() => {
    closeAllPanels()
    setDemoPanelOpen(true)
  }, [closeAllPanels])

  // Track zone visits
  useEffect(() => {
    if (current) enter(current.id)
  }, [section])

  const handleSection = (s: number) => {
    if (s === section) return
    setAIOpen(false)
    setExpandedCard(null)
    setSection(s)
  }

  const handleGuideNavigate = useCallback((s: number) => {
    handleSection(s)
  }, [section])

  return (
    <div className="planetary-root">
      {/* R3F Canvas */}
      <Canvas
        className="planetary-canvas"
        shadows={!isMobile}
        camera={{ fov: isMobile ? 60 : 50, near: 0.1, far: 200 }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.08,
          antialias: !isMobile,
          powerPreference: isMobile ? 'low-power' : 'high-performance',
        }}
      >
        <color attach="background" args={['#020208']} />
        <fog attach="fog" args={['#020208', 60, 180]} />
        <Scene section={section} setSection={handleSection} />
      </Canvas>

      {/* Hero header */}
      <header className="planetary-hero">
        <h1>Abhiram.S</h1>
        <p>Senior Full Stack .NET Developer | Angular & React | AI-First Engineering | Azure / AWS</p>
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
          key={current.id}
          className={`info-panel info-panel--${current.panelSide}`}
        >
          <div className="info-panel__inner">
            <div className="info-panel__badge">{String(section + 1).padStart(2, '0')}</div>
            <span className="info-panel__tag">{current.subtitle}</span>
            <h2 className="info-panel__heading">{current.content.heading}</h2>
            <p className="info-panel__desc">{current.content.description}</p>
            <ul className="info-panel__list">
              {current.content.items.map((item, idx) => (
                <li
                  key={item.label}
                  className={expandedCard === idx ? 'expanded' : ''}
                  onClick={() => setExpandedCard(expandedCard === idx ? null : idx)}
                >
                  <strong>{item.label}</strong>
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="info-panel__link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span>{item.value}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* AI Clone section — open the chat panel */}
      {isAIClone && !aiOpen && (
        <div className="info-panel info-panel--right">
          <div className="info-panel__inner">
            <span className="info-panel__tag">Astronaut</span>
            <h2 className="info-panel__heading">Abhi AI Clone</h2>
            <p className="info-panel__desc">
              Chat with Abhi AI clone — powered by Groq and open-source models, trained on my experience, skills, and career.
            </p>
            <button
              className="ai-clone-open-btn"
              onClick={() => {
                closeAllPanels()
                triggerGreeting()
                setAIOpen(true)
              }}
            >
              Start Conversation
            </button>
          </div>
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
          <span>{isMobile ? 'Swipe to explore' : 'Scroll to explore'}</span>
          <div className="planetary-scroll-hint__arrow" />
        </div>
      )}

      {/* Footer */}
      <footer className="planetary-footer">
        <span>© 2024 Abhiram S.</span>
      </footer>

      {/* AI Chat Panel (overlay) */}
      <CloneAIPanel />

      {/* AI Guide Agent — tour system */}
      <AIGuide onNavigate={handleGuideNavigate} />

      {/* Cinematic flythrough overlay */}
      <CinematicOverlay />

      {/* HUD — control panel */}
      <HUD
        onOpenGitHub={() => { if (ghPanelOpen) { setGhPanelOpen(false) } else { openGitHub() } }}
        onOpenDemos={() => { if (demoPanelOpen) { setDemoPanelOpen(false) } else { openDemos() } }}
      />

      {/* Lazy-loaded feature panels */}
      <Suspense fallback={null}>
        <GitHubPanel open={ghPanelOpen} onClose={() => setGhPanelOpen(false)} />
      </Suspense>
      <Suspense fallback={null}>
        <DemoTerminal open={demoPanelOpen} onClose={() => setDemoPanelOpen(false)} />
      </Suspense>
    </div>
  )
}
