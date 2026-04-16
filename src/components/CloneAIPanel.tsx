import { useState, useRef, useEffect, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import { useAIStream } from '../ai/useAIStream'

const SUGGESTIONS = [
  'What makes you different from other .NET devs?',
  'Walk me through your microservices architecture.',
  'Tell me about your work at Tesla.',
  'Can I get your resume?',
]

/* Renders message content, replacing [RESUME_DOWNLOAD] with a styled download button */
function MessageContent({ text }: { text: string }) {
  const MARKER = '[RESUME_DOWNLOAD]'
  if (!text.includes(MARKER)) return <>{text}</>

  const parts = text.split(MARKER)
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <a
              href="/resume.pdf"
              download="Abhiram_S_Resume.pdf"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                margin: '8px 0',
                padding: '10px 18px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(34,197,94,0.35), rgba(74,222,128,0.2))',
                border: '1px solid rgba(74,222,128,0.5)',
                color: '#4ade80',
                fontFamily: "'DM Mono', monospace",
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34,197,94,0.55), rgba(74,222,128,0.4))'
                e.currentTarget.style.color = '#eeffee'
                e.currentTarget.style.boxShadow = '0 0 16px rgba(74,222,128,0.3)'
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34,197,94,0.35), rgba(74,222,128,0.2))'
                e.currentTarget.style.color = '#4ade80'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              📄 Download Resume (PDF)
            </a>
          )}
        </span>
      ))}
    </>
  )
}

export function CloneAIPanel() {
  const { aiOpen, setAIOpen } = useAppStore()
  const { messages, partial, loading, send, reset } = useAIStream()
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const hasKey = !!import.meta.env.VITE_GROQ_API_KEY

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, partial])

  /* expose for AboutSection "Chat with my clone" button */
  useEffect(() => {
    const w = window as unknown as Record<string, unknown>
    w.__aiClone = () => setAIOpen(true)
    // Backward compatibility for any old callers
    w.__openAI = () => setAIOpen(true)
  }, [setAIOpen])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const q = input.trim()
    if (!q || loading) return
    send(q)
    setInput('')
  }

  return (
    <AnimatePresence>
      {aiOpen && (
        <motion.div
          initial={{ opacity: 0, x: 24, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.98 }}
          transition={{ type: 'spring', damping: 24, stiffness: 220 }}
          style={{
            position: 'fixed',
            right: 'clamp(16px, 3vw, 36px)',
            top: 'clamp(86px, 11vh, 132px)',
            width: 'min(760px, 92vw)',
            height: 'min(62vh, 620px)',
            maxHeight: 'calc(100vh - 120px)',
            zIndex: 70,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: 'linear-gradient(180deg, rgba(16,18,28,0.96), rgba(10,12,20,0.98))',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            borderRadius: '20px',
            boxShadow: '0 20px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(99,182,255,0.08) inset',
          }}
        >
            {/* Header */}
            <div style={{
              padding: '16px 22px', display: 'flex', alignItems: 'center', gap: '12px',
              borderBottom: '1px solid rgba(148,163,184,0.2)',
            }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--purple), var(--accent))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700, color: 'var(--bg)',
                fontFamily: "'DM Mono', monospace",
              }}>AS</div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 650, fontFamily: "'Cabinet Grotesk', sans-serif", color: 'var(--text-1)' }}>
                  Ask Abhiram
                </div>
                <div style={{ fontSize: '10px', fontFamily: "'DM Mono', monospace", color: 'var(--text-3)', letterSpacing: '0.1em' }}>
                  GROQ CLONE · LIVE STREAM
                </div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                <button onClick={reset} title="Clear" style={iconBtnStyle}>↺</button>
                <button onClick={() => setAIOpen(false)} title="Close" style={iconBtnStyle}>✕</button>
              </div>
            </div>

            {!hasKey && (
              <div style={{
                padding: '11px 22px', background: 'rgba(245,158,11,0.08)',
                borderBottom: '1px solid rgba(245,158,11,0.15)',
                fontSize: '12px', color: '#f59e0b', fontFamily: "'DM Mono', monospace",
              }}>
                ⚠ VITE_GROQ_API_KEY not configured
              </div>
            )}

            {/* Messages */}
            <div ref={scrollRef} style={{
              flex: 1, overflowY: 'auto', padding: '18px 22px',
              display: 'flex', flexDirection: 'column', gap: '12px',
            }}>
              {messages.length === 0 && !partial && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => send(s)} style={{
                      textAlign: 'left', padding: '12px 14px', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(148,163,184,0.22)',
                      fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '14px',
                      color: 'var(--text-2)', cursor: 'pointer',
                      transition: 'border-color 0.15s',
                    }}
                    onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(99,182,255,0.5)'}
                    onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(148,163,184,0.22)'}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '78%', padding: '11px 14px', borderRadius: '12px',
                  background: m.role === 'user' ? 'rgba(168,85,247,0.16)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${m.role === 'user' ? 'rgba(168,85,247,0.3)' : 'rgba(148,163,184,0.22)'}`,
                  fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '14px',
                  lineHeight: 1.6, color: 'var(--text-2)',
                }}>
                  <MessageContent text={m.content} />
                </div>
              ))}
              {partial && (
                <div style={{
                  maxWidth: '78%', padding: '11px 14px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(148,163,184,0.22)',
                  fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '14px',
                  lineHeight: 1.6, color: 'var(--text-2)',
                }}>
                  <MessageContent text={partial} /><span style={{
                    display: 'inline-block', width: '6px', height: '14px',
                    background: 'var(--accent)', marginLeft: '2px',
                    animation: 'pulse-dot 1s infinite',
                  }} />
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={submit} style={{
              padding: '14px 22px', borderTop: '1px solid rgba(148,163,184,0.2)',
              display: 'flex', gap: '10px',
            }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask anything about Abhiram..."
                style={{
                  flex: 1, padding: '12px 14px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(148,163,184,0.25)',
                  fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '14px',
                  color: 'var(--text-1)', outline: 'none',
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(99,182,255,0.6)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(148,163,184,0.25)'}
              />
              <button type="submit" disabled={loading || !input.trim()} style={{
                padding: '12px 20px', borderRadius: '10px',
                background: loading ? 'rgba(255,255,255,0.06)' : 'var(--accent)',
                border: 'none', fontFamily: "'DM Mono', monospace",
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
                color: loading ? 'var(--text-3)' : 'var(--bg)',
                cursor: loading ? 'default' : 'pointer',
                textTransform: 'uppercase',
              }}>
                {loading ? '...' : 'Send'}
              </button>
            </form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const iconBtnStyle: React.CSSProperties = {
  width: '26px', height: '26px', borderRadius: '6px',
  background: 'var(--surface)', border: '1px solid var(--border)',
  color: 'var(--text-3)', cursor: 'pointer', fontSize: '12px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
