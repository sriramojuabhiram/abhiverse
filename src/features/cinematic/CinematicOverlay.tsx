// CinematicOverlay.tsx — Full-screen overlay during cinematic flythrough
import { AnimatePresence, motion } from 'framer-motion'
import { useCinematicStore } from './CinematicController'

const CAPTIONS = [
  { at: 0.0, text: 'Welcome to the Abhiverse' },
  { at: 0.18, text: 'Where AI meets engineering' },
  { at: 0.38, text: 'A decade of enterprise experience' },
  { at: 0.58, text: 'Building the future with autonomous agents' },
  { at: 0.82, text: '' },
]

export function CinematicOverlay() {
  const active = useCinematicStore((s) => s.active)
  const progress = useCinematicStore((s) => s.progress)
  const stop = useCinematicStore((s) => s.stop)

  // Find current caption
  let caption = ''
  for (let i = CAPTIONS.length - 1; i >= 0; i--) {
    if (progress >= CAPTIONS[i].at) {
      caption = CAPTIONS[i].text
      break
    }
  }

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={overlayStyle}
        >
          {/* Top cinematic bars */}
          <div style={topBarStyle} />
          <div style={bottomBarStyle} />

          {/* Caption */}
          <AnimatePresence mode="wait">
            {caption && (
              <motion.div
                key={caption}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.6 }}
                style={captionStyle}
              >
                {caption}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress bar */}
          <div style={progressBgStyle}>
            <div style={{ ...progressFillStyle, width: `${progress * 100}%` }} />
          </div>

          {/* Skip button */}
          <button onClick={stop} style={skipStyle}>
            SKIP ▸
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 90,
  pointerEvents: 'none',
}

const topBarStyle: React.CSSProperties = {
  position: 'absolute', top: 0, left: 0, right: 0, height: '60px',
  background: 'linear-gradient(180deg, rgba(2,2,8,0.9), transparent)',
}

const bottomBarStyle: React.CSSProperties = {
  position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px',
  background: 'linear-gradient(0deg, rgba(2,2,8,0.9), transparent)',
}

const captionStyle: React.CSSProperties = {
  position: 'absolute', bottom: '100px', left: '50%', transform: 'translateX(-50%)',
  fontSize: 'clamp(18px, 3vw, 28px)', fontWeight: 600, color: 'rgba(255,255,255,0.9)',
  fontFamily: "'Cabinet Grotesk', sans-serif", textAlign: 'center',
  textShadow: '0 2px 20px rgba(0,0,0,0.6)', letterSpacing: '0.02em',
  whiteSpace: 'nowrap',
}

const progressBgStyle: React.CSSProperties = {
  position: 'absolute', bottom: '40px', left: '20%', right: '20%',
  height: '2px', background: 'rgba(255,255,255,0.15)', borderRadius: '1px',
}

const progressFillStyle: React.CSSProperties = {
  height: '100%', background: '#4ade80', borderRadius: '1px',
  transition: 'width 0.1s linear',
}

const skipStyle: React.CSSProperties = {
  position: 'absolute', bottom: '55px', right: '20%',
  pointerEvents: 'auto', padding: '6px 16px', borderRadius: '6px',
  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
  color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
  fontFamily: "'DM Mono', monospace", fontSize: '11px', fontWeight: 600,
  letterSpacing: '0.1em',
}
