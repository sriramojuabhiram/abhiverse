import { useState } from 'react'
import { useAppStore } from '../store/appStore'

const SECTIONS = ['About', 'Experience', 'Projects', 'Skills']

export function Navbar() {
  const { section, setSection, setAIOpen } = useAppStore()
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <nav id="nav-bar" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 30px',
      borderBottom: '1px solid var(--border)',
      background: 'rgba(10,10,18,0.95)',
      backdropFilter: 'blur(12px)',
      position: 'relative', zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '8px',
          background: 'linear-gradient(135deg, var(--accent), var(--purple))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '15px', fontWeight: 800, color: 'var(--bg)',
          fontFamily: "'Fraunces', serif", letterSpacing: '-0.02em',
        }}>AS</div>
        <div style={{
          fontFamily: "'Fraunces', serif",
          fontSize: '24px', fontWeight: 700,
          color: 'var(--text-1)', letterSpacing: '-0.01em',
        }}>
          Abhiram <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>S.</em>
        </div>
      </div>

      {/* Nav pills with hover zoom */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {SECTIONS.map((label, i) => {
          const isActive = section === i
          const isHov = hovered === i
          return (
            <button
              key={label}
              onClick={() => setSection(i)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                padding: '7px 20px', borderRadius: '99px',
                background: isActive ? 'var(--accent)' : isHov ? 'rgba(74,222,128,0.08)' : 'transparent',
                border: 'none',
                fontFamily: "'Cabinet Grotesk', sans-serif",
                fontSize: '16px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--bg)' : isHov ? 'var(--accent)' : 'var(--text-3)',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.22,1,0.36,1)',
                transform: isHov && !isActive ? 'scale(1.1)' : 'scale(1)',
                letterSpacing: '0.01em',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div className="avail-chip">
          <div className="avail-dot" />
          <span className="avail-text">Available now</span>
        </div>
        <button
          onClick={() => setAIOpen(true)}
          style={{
            padding: '9px 20px', borderRadius: '8px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            fontFamily: "'DM Mono', monospace",
            fontSize: '13px', letterSpacing: '0.1em',
            color: 'var(--text-3)', cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'all 0.25s cubic-bezier(0.22,1,0.36,1)',
          }}
          onMouseOver={e => {
            e.currentTarget.style.borderColor = 'rgba(167,139,250,0.4)'
            e.currentTarget.style.color = 'rgba(167,139,250,0.9)'
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.background = 'rgba(167,139,250,0.06)'
          }}
          onMouseOut={e => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--text-3)'
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.background = 'var(--surface)'
          }}
        >
          Ask Abhiram AI
        </button>
      </div>
    </nav>
  )
}
