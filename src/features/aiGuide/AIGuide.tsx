// AIGuide.tsx — Autonomous AI guide overlay with speech bubble and tour controls
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTourStore } from './TourManager'
import { generateNarration } from './GuideController'
import { TOUR_STEPS } from './Waypoints'
import { planets } from '../../scenes/planetary/planetData'

interface AIGuideProps {
  onNavigate: (sectionIndex: number) => void
}

export function AIGuide({ onNavigate }: AIGuideProps) {
  const {
    status, currentStep, narration, narrationLoading,
    offerTour, startTour, nextStep, prevStep, skipTour,
    setNarration, setNarrationLoading,
  } = useTourStore()

  const hasOffered = useRef(false)

  // Offer tour on first visit
  useEffect(() => {
    if (!hasOffered.current) {
      hasOffered.current = true
      const timer = setTimeout(() => offerTour(), 2500)
      return () => clearTimeout(timer)
    }
  }, [offerTour])

  // Navigate to current tour step's section
  useEffect(() => {
    if (status === 'touring') {
      const step = TOUR_STEPS[currentStep]
      if (step) onNavigate(step.sectionIndex)
    }
  }, [status, currentStep, onNavigate])

  // Generate narration for current step
  useEffect(() => {
    if (status !== 'touring') return
    const step = TOUR_STEPS[currentStep]
    if (!step) return

    let cancelled = false
    setNarrationLoading(true)
    setNarration('')

    generateNarration(step.narrationPrompt).then((text) => {
      if (!cancelled) {
        setNarration(text)
        setNarrationLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [status, currentStep, setNarration, setNarrationLoading])

  return (
    <AnimatePresence>
      {/* Tour offer dialog */}
      {status === 'offered' && (
        <TourOffer
          onAccept={() => startTour()}
          onDecline={() => skipTour()}
        />
      )}

      {/* Active tour speech bubble */}
      {status === 'touring' && (
        <SpeechBubble
          stepIndex={currentStep}
          totalSteps={TOUR_STEPS.length}
          sectionName={TOUR_STEPS[currentStep]?.sectionName ?? ''}
          narration={narration}
          loading={narrationLoading}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={skipTour}
          bubbleSide={planets[TOUR_STEPS[currentStep]?.sectionIndex ?? 0]?.panelSide === 'left' ? 'right' : 'left'}
        />
      )}

      {/* Tour finished message */}
      {status === 'finished' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={finishedStyle}
        >
          <span style={{ fontSize: '18px' }}>✨</span>
          <span>Tour complete! Explore freely or chat with my AI clone.</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── Tour Offer Dialog ─────────────────────────────────────── */
function TourOffer({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: 'spring', damping: 22, stiffness: 260 }}
      style={offerStyle}
    >
      <div style={{ fontSize: '22px', marginBottom: '4px' }}>👋</div>
      <p style={{ margin: '0 0 14px', fontSize: '15px', color: 'var(--text-1)', fontWeight: 600 }}>
        Want a quick tour of my universe?
      </p>
      <p style={{ margin: '0 0 18px', fontSize: '13px', color: 'var(--text-3)' }}>
        I'll guide you through my skills, experience, and projects.
      </p>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={onAccept} style={acceptBtnStyle}>
          Yes, show me around
        </button>
        <button onClick={onDecline} style={declineBtnStyle}>
          I'll explore alone
        </button>
      </div>
    </motion.div>
  )
}

/* ── Speech Bubble ─────────────────────────────────────────── */
function SpeechBubble({
  stepIndex, totalSteps, sectionName, narration, loading, onNext, onPrev, onSkip, bubbleSide,
}: {
  stepIndex: number
  totalSteps: number
  sectionName: string
  narration: string
  loading: boolean
  onNext: () => void
  onPrev: () => void
  onSkip: () => void
  bubbleSide: 'left' | 'right'
}) {
  const [displayed, setDisplayed] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Typewriter effect
  useEffect(() => {
    setDisplayed('')
    if (!narration) return
    let i = 0
    intervalRef.current = setInterval(() => {
      i++
      setDisplayed(narration.slice(0, i))
      if (i >= narration.length && intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }, 22)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [narration])

  const isLast = stepIndex === totalSteps - 1

  return (
    <motion.div
      key={stepIndex}
      initial={{ opacity: 0, x: bubbleSide === 'left' ? -30 : 30, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: bubbleSide === 'left' ? -30 : 30, y: 10 }}
      transition={{ type: 'spring', damping: 22, stiffness: 240 }}
      style={{
        ...bubbleStyle,
        left: bubbleSide === 'left' ? 'clamp(16px, 3vw, 36px)' : 'auto',
        right: bubbleSide === 'right' ? 'clamp(16px, 3vw, 36px)' : 'auto',
      }}
    >
      {/* Header */}
      <div style={bubbleHeaderStyle}>
        <div style={avatarStyle}>AS</div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 650, color: 'var(--text-1)' }}>
            Abhiram — {sectionName}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em' }}>
            STEP {stepIndex + 1} OF {totalSteps}
          </div>
        </div>
        <button onClick={onSkip} style={skipBtnStyle} title="Skip tour">✕</button>
      </div>

      {/* Narration text */}
      <div style={narrationStyle}>
        {loading ? (
          <span style={{ color: 'var(--text-3)' }}>Thinking...</span>
        ) : (
          <>
            {displayed}
            {displayed.length < narration.length && (
              <span style={{ display: 'inline-block', width: '5px', height: '14px', background: 'var(--accent)', marginLeft: '2px', animation: 'pulse-dot 1s infinite' }} />
            )}
          </>
        )}
      </div>

      {/* Progress bar */}
      <div style={progressBarBgStyle}>
        <div style={{ ...progressBarFillStyle, width: `${((stepIndex + 1) / totalSteps) * 100}%` }} />
      </div>

      {/* Controls */}
      <div style={controlsStyle}>
        <button
          onClick={onPrev}
          disabled={stepIndex === 0}
          style={{ ...navBtnStyle, opacity: stepIndex === 0 ? 0.3 : 1 }}
        >
          ← Back
        </button>
        <button onClick={onNext} style={nextBtnStyle}>
          {isLast ? 'Finish Tour' : 'Next →'}
        </button>
      </div>
    </motion.div>
  )
}

/* ── Styles ────────────────────────────────────────────────── */
const offerStyle: React.CSSProperties = {
  position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)',
  zIndex: 80, padding: '24px 28px', borderRadius: '18px',
  background: 'linear-gradient(180deg, rgba(16,18,28,0.96), rgba(10,12,20,0.98))',
  border: '1px solid rgba(148,163,184,0.25)',
  boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(74,222,128,0.08) inset',
  backdropFilter: 'blur(20px)', textAlign: 'center', maxWidth: '360px',
  fontFamily: "'Cabinet Grotesk', sans-serif",
}

const acceptBtnStyle: React.CSSProperties = {
  padding: '10px 20px', borderRadius: '10px', border: 'none',
  background: 'var(--accent)', color: 'var(--bg)',
  fontFamily: "'DM Mono', monospace", fontSize: '12px', fontWeight: 700,
  letterSpacing: '0.06em', cursor: 'pointer', textTransform: 'uppercase',
}

const declineBtnStyle: React.CSSProperties = {
  padding: '10px 20px', borderRadius: '10px',
  background: 'transparent', border: '1px solid rgba(148,163,184,0.25)',
  color: 'var(--text-3)', fontFamily: "'DM Mono', monospace",
  fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em',
  cursor: 'pointer', textTransform: 'uppercase',
}

const bubbleStyle: React.CSSProperties = {
  position: 'fixed', bottom: '90px',
  zIndex: 80, width: 'clamp(300px, 35vw, 420px)', borderRadius: '16px',
  background: 'linear-gradient(180deg, rgba(16,18,28,0.96), rgba(10,12,20,0.98))',
  border: '1px solid rgba(148,163,184,0.25)',
  boxShadow: '0 16px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(74,222,128,0.06) inset',
  backdropFilter: 'blur(20px)', overflow: 'hidden',
  fontFamily: "'Cabinet Grotesk', sans-serif",
}

const bubbleHeaderStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '10px',
  padding: '14px 18px', borderBottom: '1px solid rgba(148,163,184,0.15)',
}

const avatarStyle: React.CSSProperties = {
  width: '30px', height: '30px', borderRadius: '50%',
  background: 'linear-gradient(135deg, #a78bfa, #4ade80)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', fontSize: '10px',
  fontWeight: 700, color: '#0a0c14', fontFamily: "'DM Mono', monospace",
}

const skipBtnStyle: React.CSSProperties = {
  marginLeft: 'auto', width: '24px', height: '24px', borderRadius: '6px',
  background: 'transparent', border: '1px solid rgba(148,163,184,0.2)',
  color: 'var(--text-3)', cursor: 'pointer', fontSize: '11px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const narrationStyle: React.CSSProperties = {
  padding: '16px 18px', fontSize: '14px', lineHeight: 1.7,
  color: 'var(--text-2)', minHeight: '60px',
}

const progressBarBgStyle: React.CSSProperties = {
  height: '2px', background: 'rgba(148,163,184,0.1)', margin: '0 18px',
}

const progressBarFillStyle: React.CSSProperties = {
  height: '100%', background: 'var(--accent)', borderRadius: '1px',
  transition: 'width 0.5s ease',
}

const controlsStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', padding: '14px 18px',
}

const navBtnStyle: React.CSSProperties = {
  padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.2)',
  background: 'transparent', color: 'var(--text-3)', cursor: 'pointer',
  fontFamily: "'DM Mono', monospace", fontSize: '11px', fontWeight: 600,
}

const nextBtnStyle: React.CSSProperties = {
  padding: '8px 20px', borderRadius: '8px', border: 'none',
  background: 'var(--accent)', color: 'var(--bg)', cursor: 'pointer',
  fontFamily: "'DM Mono', monospace", fontSize: '11px', fontWeight: 700,
  letterSpacing: '0.04em',
}

const finishedStyle: React.CSSProperties = {
  position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)',
  zIndex: 80, padding: '16px 24px', borderRadius: '14px',
  background: 'linear-gradient(180deg, rgba(16,18,28,0.96), rgba(10,12,20,0.98))',
  border: '1px solid rgba(74,222,128,0.3)',
  boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', gap: '10px',
  fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '14px', color: 'var(--text-2)',
  backdropFilter: 'blur(16px)',
}
