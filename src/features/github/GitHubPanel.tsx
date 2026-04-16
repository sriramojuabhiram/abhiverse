// GitHubPanel.tsx — Live GitHub stats panel overlay
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGitHubData } from './useGitHubData'
import { LANGUAGE_COLORS, type GitHubRepo } from '../../services/githubService'

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

interface GitHubPanelProps {
  open: boolean
  onClose: () => void
}

export function GitHubPanel({ open, onClose }: GitHubPanelProps) {
  const { data, loading } = useGitHubData()
  const isMobile = useIsMobile()

  const topLanguages = data
    ? Object.entries(data.languages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
    : []

  const topRepos = data?.repos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6) ?? []

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={isMobile ? { opacity: 0, y: '100%' } : { opacity: 0, x: 30 }}
          animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }}
          exit={isMobile ? { opacity: 0, y: '100%' } : { opacity: 0, x: 30 }}
          transition={{ type: 'spring', damping: 24, stiffness: 240 }}
          style={isMobile ? panelStyleMobile : panelStyle}
        >
          {/* Header */}
          <div style={headerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={ghIconStyle}>GH</div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 650, color: 'var(--text-1)' }}>GitHub Brain</div>
                <div style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em' }}>
                  LIVE DATA · {data ? `${data.repos.length} REPOS` : 'LOADING'}
                </div>
              </div>
            </div>
            <button onClick={onClose} style={closeBtnStyle}>✕</button>
          </div>

          {loading && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)', fontSize: '13px' }}>
              Fetching GitHub data...
            </div>
          )}

          {data && (
            <div style={{ padding: '16px', overflow: 'auto', flex: 1 }}>
              {/* Stats row */}
              <div style={statsRowStyle}>
                <StatBox label="Repos" value={String(data.repos.length)} />
                <StatBox label="Stars" value={String(data.totalStars)} />
                <StatBox label="Languages" value={String(Object.keys(data.languages).length)} />
              </div>

              {/* Language bars */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={sectionTitleStyle}>Languages</h4>
                {topLanguages.map(([lang, count]) => (
                  <div key={lang} style={langRowStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: LANGUAGE_COLORS[lang] ?? '#888',
                        flexShrink: 0,
                        boxShadow: `0 0 6px ${LANGUAGE_COLORS[lang] ?? '#888'}60`,
                      }} />
                      <span style={{ fontSize: '12px', color: 'var(--text-2)', fontFamily: "'DM Mono', monospace" }}>
                        {lang}
                      </span>
                    </div>
                    <div style={barBgStyle}>
                      <div style={{
                        ...barFillStyle,
                        width: `${(count / topLanguages[0][1]) * 100}%`,
                        background: LANGUAGE_COLORS[lang] ?? '#888',
                      }} />
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: "'DM Mono', monospace", width: '24px', textAlign: 'right' }}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>

              {/* Top repos */}
              <div>
                <h4 style={sectionTitleStyle}>Top Repos</h4>
                {topRepos.map((repo) => (
                  <RepoCard key={repo.name} repo={repo} />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={statBoxStyle}>
      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-1)' }}>{value}</div>
      <div style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  )
}

function RepoCard({ repo }: { repo: GitHubRepo }) {
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      style={repoCardStyle}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'rgba(74,222,128,0.4)'
        e.currentTarget.style.background = 'rgba(74,222,128,0.04)'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'rgba(148,163,184,0.15)'
        e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>{repo.name}</span>
        {repo.stargazers_count > 0 && (
          <span style={{ fontSize: '11px', color: '#fbbf24', fontFamily: "'DM Mono', monospace" }}>
            ★ {repo.stargazers_count}
          </span>
        )}
      </div>
      {repo.description && (
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-3)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {repo.description}
        </p>
      )}
      {repo.language && (
        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: LANGUAGE_COLORS[repo.language] ?? '#888' }} />
          <span style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: "'DM Mono', monospace" }}>{repo.language}</span>
        </div>
      )}
    </a>
  )
}

/* ── Styles ────────────────────────────────────────────────── */
const panelStyle: React.CSSProperties = {
  position: 'fixed', right: 'clamp(16px, 3vw, 36px)', top: 'clamp(86px, 11vh, 132px)',
  zIndex: 75, width: 'clamp(320px, 28vw, 400px)',
  bottom: 'clamp(20px, 4vh, 40px)',
  borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
  background: 'linear-gradient(180deg, rgba(16,18,28,0.97), rgba(10,12,20,0.99))',
  border: '1px solid rgba(148,163,184,0.25)',
  boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(74,222,128,0.06) inset',
  backdropFilter: 'blur(20px)',
  fontFamily: "'Cabinet Grotesk', sans-serif",
}

const panelStyleMobile: React.CSSProperties = {
  position: 'fixed', inset: 0,
  zIndex: 75, width: '100%', height: '100%',
  borderRadius: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden',
  background: 'linear-gradient(180deg, rgba(16,18,28,0.97), rgba(10,12,20,0.99))',
  border: 'none',
  boxShadow: 'none',
  fontFamily: "'Cabinet Grotesk', sans-serif",
}

const headerStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '14px 16px', borderBottom: '1px solid rgba(148,163,184,0.15)',
}

const ghIconStyle: React.CSSProperties = {
  width: '28px', height: '28px', borderRadius: '50%',
  background: 'linear-gradient(135deg, #333, #666)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', fontSize: '9px',
  fontWeight: 700, color: '#fff', fontFamily: "'DM Mono', monospace",
}

const closeBtnStyle: React.CSSProperties = {
  width: '24px', height: '24px', borderRadius: '6px',
  background: 'transparent', border: '1px solid rgba(148,163,184,0.2)',
  color: 'var(--text-3)', cursor: 'pointer', fontSize: '11px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const statsRowStyle: React.CSSProperties = {
  display: 'flex', gap: '8px', marginBottom: '20px',
}

const statBoxStyle: React.CSSProperties = {
  flex: 1, padding: '12px', borderRadius: '10px',
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(148,163,184,0.12)',
  textAlign: 'center',
}

const sectionTitleStyle: React.CSSProperties = {
  margin: '0 0 10px', fontSize: '11px', fontWeight: 700,
  color: 'var(--text-3)', fontFamily: "'DM Mono', monospace",
  letterSpacing: '0.1em', textTransform: 'uppercase',
}

const langRowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '10px',
  marginBottom: '6px',
}

const barBgStyle: React.CSSProperties = {
  flex: 2, height: '4px', borderRadius: '2px',
  background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
}

const barFillStyle: React.CSSProperties = {
  height: '100%', borderRadius: '2px',
  transition: 'width 0.6s ease',
}

const repoCardStyle: React.CSSProperties = {
  display: 'block', padding: '12px', borderRadius: '10px',
  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(148,163,184,0.15)',
  marginBottom: '8px', textDecoration: 'none', cursor: 'pointer',
  transition: 'all 0.2s ease',
}
