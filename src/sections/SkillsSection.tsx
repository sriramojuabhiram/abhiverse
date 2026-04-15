import { motion, AnimatePresence } from 'framer-motion'
import { SKILLS } from '../data/portfolio'

const CATS = ['Backend', 'Frontend', 'Cloud', 'Messaging', 'Database', 'Emerging']

export function SkillsSection({ active }: { active: boolean }) {
  return (
    <div className={`section-view ${active ? 'on' : ''}`}>
      <AnimatePresence>
        {active && (
          <motion.div key="skills"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <div className="sec-tag">Technical stack</div>
            <h2 className="t-h1" style={{ color: 'var(--text-1)', marginBottom: '22px' }}>
              18<em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>+</em><br />
              technologies.
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
              {CATS.map(cat => {
                const catSkills = SKILLS.filter(s => s.category === cat)
                if (catSkills.length === 0) return null
                return (
                  <div key={cat}>
                    <div className="t-label" style={{ color: 'var(--text-3)', marginBottom: '12px', fontSize: '13px' }}>{cat}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {catSkills.map((sk, i) => (
                        <motion.div
                          key={sk.id}
                          initial={{ opacity: 0, scale: 0.88 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.04 }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '9px',
                            padding: '10px 17px', borderRadius: '8px',
                            background: 'var(--surface)', border: '1px solid var(--border)',
                            cursor: 'default', transition: 'border-color 0.2s',
                          }}
                          onMouseOver={e => (e.currentTarget.style.borderColor = `${sk.color}44`)}
                          onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                        >
                          <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: sk.color, flexShrink: 0 }} />
                          <span style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-1)' }}>{sk.name}</span>
                          <span className="t-mono" style={{ color: 'var(--text-4)', fontSize: '13px' }}>{sk.level}%</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
