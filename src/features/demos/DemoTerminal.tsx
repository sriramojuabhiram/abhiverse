// DemoTerminal.tsx — Container for interactive AI demo panels
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense } from 'react'

const JobFitAnalyzer = lazy(() => import('./demos/JobFitAnalyzer'))
const ProjectDeepDive = lazy(() => import('./demos/ProjectDeepDive'))
const SkillExplorer = lazy(() => import('./demos/SkillExplorer'))

export interface DemoInfo {
  id: string
  title: string
  icon: string
  description: string
}

export const DEMOS: DemoInfo[] = [
  { id: 'jobfit', title: 'Job Fit Analyzer', icon: '🎯', description: 'Paste a job description — AI analyzes how well Abhiram matches' },
  { id: 'deepdive', title: 'Project Deep Dive', icon: '🏗️', description: 'Pick a project and ask technical architecture questions' },
  { id: 'skills', title: 'Skill Explorer', icon: '🧠', description: 'Browse skills — tap any to hear Abhiram\'s real experience' },
]

interface DemoTerminalProps {
  open: boolean
  onClose: () => void
}

function useIsMobile() {
  const [m, setM] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setM(mq.matches)
    const h = (e: MediaQueryListEvent) => setM(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return m
}

export function DemoTerminal({ open, onClose }: DemoTerminalProps) {
  const [activeDemo, setActiveDemo] = useState<string | null>(null)
  const isMobile = useIsMobile()

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={isMobile ? { opacity: 0, y: '100%' } : { opacity: 0, scale: 0.95, y: 20 }}
          animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1, y: 0 }}
          exit={isMobile ? { opacity: 0, y: '100%' } : { opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 24, stiffness: 240 }}
          style={isMobile ? terminalStyleMobile : terminalStyle}
        >
          {/* Header */}
          <div style={headerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={labIconStyle}>AI</div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 650, color: 'var(--text-1)' }}>AI Demo Lab</div>
                <div style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em' }}>
                  INTERACTIVE DEMOS
                </div>
              </div>
            </div>
            <button onClick={() => { setActiveDemo(null); onClose() }} style={closeBtnStyle}>✕</button>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {!activeDemo ? (
              /* Demo selection grid */
              <div style={gridStyle}>
                {DEMOS.map((demo) => (
                  <button
                    key={demo.id}
                    onClick={() => setActiveDemo(demo.id)}
                    style={demoCardStyle}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(74,222,128,0.4)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(148,163,184,0.2)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{demo.icon}</div>
                    <div style={{ fontSize: '14px', fontWeight: 650, color: 'var(--text-1)', marginBottom: '4px' }}>
                      {demo.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-3)', lineHeight: 1.4 }}>
                      {demo.description}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              /* Active demo view */
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                <button
                  onClick={() => setActiveDemo(null)}
                  style={backBtnStyle}
                >
                  ← All Demos
                </button>
                <Suspense fallback={<div style={{ padding: '20px', color: 'var(--text-3)', fontSize: '13px' }}>Loading demo...</div>}>
                  {activeDemo === 'jobfit' && <JobFitAnalyzer />}
                  {activeDemo === 'deepdive' && <ProjectDeepDive />}
                  {activeDemo === 'skills' && <SkillExplorer />}
                </Suspense>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── Styles ────────────────────────────────────────────────── */
const terminalStyle: React.CSSProperties = {
  position: 'fixed', right: 'clamp(16px, 3vw, 36px)', top: 'clamp(86px, 11vh, 132px)',
  zIndex: 75, width: 'clamp(360px, 38vw, 520px)',
  bottom: 'clamp(20px, 4vh, 40px)',
  borderRadius: '18px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
  background: 'linear-gradient(180deg, rgba(16,18,28,0.97), rgba(10,12,20,0.99))',
  border: '1px solid rgba(148,163,184,0.25)',
  boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(74,222,128,0.06) inset',
  backdropFilter: 'blur(24px)',
  fontFamily: "'Cabinet Grotesk', sans-serif",
}

const headerStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '14px 18px', borderBottom: '1px solid rgba(148,163,184,0.15)',
}

const labIconStyle: React.CSSProperties = {
  width: '28px', height: '28px', borderRadius: '8px',
  background: 'linear-gradient(135deg, #a78bfa, #4ade80)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', fontSize: '9px',
  fontWeight: 700, color: '#0a0c14', fontFamily: "'DM Mono', monospace",
}

const closeBtnStyle: React.CSSProperties = {
  width: '24px', height: '24px', borderRadius: '6px',
  background: 'transparent', border: '1px solid rgba(148,163,184,0.2)',
  color: 'var(--text-3)', cursor: 'pointer', fontSize: '11px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const gridStyle: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
  gap: '12px',
}

const demoCardStyle: React.CSSProperties = {
  padding: '20px 16px', borderRadius: '14px', textAlign: 'center',
  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(148,163,184,0.2)',
  cursor: 'pointer', transition: 'all 0.2s ease',
  fontFamily: "'Cabinet Grotesk', sans-serif",
}

const backBtnStyle: React.CSSProperties = {
  marginBottom: '14px', padding: '6px 14px', borderRadius: '8px',
  background: 'transparent', border: '1px solid rgba(148,163,184,0.2)',
  color: 'var(--text-3)', cursor: 'pointer',
  fontFamily: "'DM Mono', monospace", fontSize: '11px', fontWeight: 600,
}

const terminalStyleMobile: React.CSSProperties = {
  position: 'fixed', inset: 0,
  zIndex: 75, width: '100%', height: '100%',
  borderRadius: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden',
  background: 'linear-gradient(180deg, rgba(16,18,28,0.97), rgba(10,12,20,0.99))',
  border: 'none',
  boxShadow: 'none',
  fontFamily: "'Cabinet Grotesk', sans-serif",
}
