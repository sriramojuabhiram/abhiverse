// HUD.tsx — Floating heads-up display with feature buttons and status indicators
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCinematicStore } from '../cinematic/CinematicController'
import { useTourStore } from '../aiGuide/TourManager'
import { useGitHubData } from '../github/useGitHubData'
import './HUD.css'

interface HUDProps {
  onOpenGitHub: () => void
  onOpenDemos: () => void
}

export function HUD({ onOpenGitHub, onOpenDemos }: HUDProps) {
  const [expanded, setExpanded] = useState(false)
  const startCinematic = useCinematicStore((s) => s.start)
  const cinematicActive = useCinematicStore((s) => s.active)
  const tourStatus = useTourStore((s) => s.status)
  const startTour = useTourStore((s) => s.startTour)
  const { data: ghData } = useGitHubData()

  // Hide HUD during cinematic
  if (cinematicActive) return null

  return (
    <div className="hud-container">
      {/* Toggle button */}
      <button
        className="hud-toggle"
        onClick={() => setExpanded(!expanded)}
        title="Toggle HUD"
      >
        <span className="hud-toggle__icon">{expanded ? '✕' : '⚡'}</span>
      </button>

      {/* Expanded panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="hud-panel"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          >
            {/* Cinematic button */}
            <button className="hud-btn" onClick={startCinematic}>
              <span className="hud-btn__icon">▶</span>
              <span className="hud-btn__label">Cinematic Intro</span>
            </button>

            {/* Tour button */}
            <button
              className="hud-btn"
              onClick={startTour}
              disabled={tourStatus === 'touring'}
            >
              <span className="hud-btn__icon">🗺</span>
              <span className="hud-btn__label">
                {tourStatus === 'touring' ? 'Tour Active' : 'Guided Tour'}
              </span>
            </button>

            {/* GitHub button */}
            <button className="hud-btn" onClick={onOpenGitHub}>
              <span className="hud-btn__icon">⟐</span>
              <span className="hud-btn__label">GitHub Brain</span>
              {ghData && (
                <span className="hud-btn__badge">{ghData.repos.length}</span>
              )}
            </button>

            {/* Demo Lab button */}
            <button className="hud-btn" onClick={onOpenDemos}>
              <span className="hud-btn__icon">🧪</span>
              <span className="hud-btn__label">AI Demo Lab</span>
            </button>

            {/* Status indicator */}
            <div className="hud-status">
              <div className="hud-status__dot" />
              <span className="hud-status__text">
                {ghData
                  ? `${ghData.repos.length} repos · ${ghData.totalStars} ★`
                  : 'Fetching GitHub...'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
