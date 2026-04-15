import { motion, AnimatePresence } from 'framer-motion'
import { EXPERIENCES } from '../data/portfolio'

export function ExperienceSection({ active }: { active: boolean }) {
  return (
    <div className={`section-view ${active ? 'on' : ''}`}>
      <AnimatePresence>
        {active && (
          <motion.div key="exp"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <div className="sec-tag">Career history</div>
            <h2 className="t-h1" style={{ color: 'var(--text-1)', marginBottom: '22px' }}>
              11 years.<br />
              <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>6 companies.</em>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              {EXPERIENCES.map((exp, i) => (
                <motion.div
                  key={exp.id}
                  className="card"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '15px 18px' }}
                >
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: exp.color, flexShrink: 0,
                    boxShadow: `0 0 10px ${exp.color}55`,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-1)' }}>{exp.company}</div>
                    <div className="t-label" style={{ color: 'var(--text-3)', marginTop: '4px', fontSize: '13px' }}>{exp.role}</div>
                  </div>
                  <div className="t-mono" style={{ color: 'var(--text-4)', flexShrink: 0, fontSize: '14px' }}>
                    {exp.start}{exp.end ? `–${exp.end}` : '–Now'}
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
