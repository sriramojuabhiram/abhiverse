import { motion, AnimatePresence } from 'framer-motion'
import { PROJECTS } from '../data/portfolio'

export function ProjectsSection({ active }: { active: boolean }) {
  return (
    <div className={`section-view ${active ? 'on' : ''}`}>
      <AnimatePresence>
        {active && (
          <motion.div key="proj"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <div className="sec-tag">Selected work</div>
            <h2 className="t-h1" style={{ color: 'var(--text-1)', marginBottom: '22px' }}>
              Live<br />
              <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>projects.</em>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              {PROJECTS.map((p, i) => (
                <motion.div key={p.id} className="card"
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  style={{ padding: '16px 18px' }}
                >
                  <div style={{ width: '40px', height: '2.5px', background: p.color, borderRadius: '2px', marginBottom: '14px' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />
                    <span className="t-label" style={{ color: p.color, fontSize: '13px' }}>{p.status}</span>
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '8px' }}>{p.name}</div>
                  <p className="t-body" style={{ marginBottom: '14px', fontSize: '16px' }}>{p.description}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                    {p.stack.map(tech => (
                      <span key={tech} className="t-label" style={{
                        padding: '5px 12px', borderRadius: '5px', fontSize: '12px',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        color: 'var(--text-3)',
                      }}>{tech}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
