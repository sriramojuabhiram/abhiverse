import { useAppStore } from '../store/appStore'

const SECTIONS = ['About', 'Experience', 'Projects', 'Skills']

export function SectionDots() {
  const { section, setSection } = useAppStore()

  return (
    <div style={{
      position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
      display: 'flex', flexDirection: 'column', gap: '14px', zIndex: 10,
    }}>
      {SECTIONS.map((label, i) => (
        <button
          key={label}
          onClick={() => setSection(i)}
          title={label}
          style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: section === i ? 'var(--accent)' : 'rgba(255,255,255,0.15)',
            border: 'none', cursor: 'pointer', padding: 0,
            transition: 'background 0.3s, transform 0.3s',
            transform: section === i ? 'scale(1.3)' : 'scale(1)',
            boxShadow: section === i ? '0 0 8px rgba(99,182,255,0.4)' : 'none',
          }}
        />
      ))}
    </div>
  )
}
