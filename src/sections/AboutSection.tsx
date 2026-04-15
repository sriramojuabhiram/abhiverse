import { motion, AnimatePresence } from 'framer-motion'

export function AboutSection({ active }: { active: boolean }) {
  return (
    <div className={`section-view ${active ? 'on' : ''}`}>
      <AnimatePresence>
        {active && (
          <motion.div
            key="about"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0 }}
          >
            <div className="sec-tag">Senior .NET Full-Stack Developer</div>

            <h1 className="t-hero" style={{ color: 'var(--text-1)', marginBottom: '14px' }}>
              Abhiram<br />
              <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>S.</em>
            </h1>

            <p className="t-body" style={{ marginBottom: '24px', maxWidth: '340px' }}>
              11+ years architecting scalable enterprise systems at{' '}
              <strong style={{ color: 'var(--text-1)', fontWeight: 500 }}>
                Tesla, Anheuser-Busch, McDonald's
              </strong>{' '}
              and Southwest Airlines. Specializing in .NET microservices, cloud-native
              architectures on Azure, GCP & AWS, and event-driven systems with Kafka & RabbitMQ.
            </p>

            <div className="stats-row" style={{ marginBottom: '28px' }}>
              {[
                { n: '11', em: '+', l: 'Years' },
                { n: '6', em: '', l: 'Companies' },
                { n: '15', em: '+', l: 'Technologies' },
              ].map(s => (
                <div key={s.l} className="stat-cell">
                  <div className="stat-num">{s.n}<em>{s.em}</em></div>
                  <div className="stat-lbl">{s.l}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              <button className="btn-primary"
                onClick={() => window.open('mailto:abhiramram0808@gmail.com')}>
                Hire me
              </button>
              <button className="btn-secondary"
                onClick={() => {
                  const w = window as unknown as Record<string, (() => void) | undefined>
                  w.__aiClone?.()
                  w.__openAI?.()
                }}>
                Chat with my clone
              </button>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
              <div className="avail-chip" style={{ marginBottom: '14px' }}>
                <div className="avail-dot" />
                <span className="avail-text">Available · Remote C2C</span>
              </div>
              <p className="t-label" style={{ color: 'var(--text-3)', marginTop: '8px', fontSize: '13px' }}>
                abhiramram0808@gmail.com · linkedin.com/in/abhiram-s-21346b1b5 · St. Louis, MO
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
