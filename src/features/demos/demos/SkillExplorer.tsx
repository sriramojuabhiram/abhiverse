// SkillExplorer.tsx — Interactive skill browser with AI context on each skill
import { useState } from 'react'
import { streamResponse, type Message } from '../../../ai/claudeClient'

interface SkillCategory {
  name: string
  icon: string
  skills: string[]
}

const CATEGORIES: SkillCategory[] = [
  { name: 'AI & Agents', icon: '🧠', skills: ['LangChain', 'LangGraph', 'CrewAI', 'AutoGen', 'RAG', 'OpenAI API', 'Claude API', 'FAISS', 'ChromaDB'] },
  { name: 'ML & MLOps', icon: '📊', skills: ['PyTorch', 'TensorFlow', 'Scikit-learn', 'MLflow', 'Vertex AI', 'Apache Spark'] },
  { name: 'Backend', icon: '⚙️', skills: ['Python', 'FastAPI', 'Django', 'Go', 'Java / Spring Boot', 'Node.js', 'ASP.NET Core', 'GraphQL', 'gRPC'] },
  { name: 'Frontend', icon: '🎨', skills: ['React', 'Next.js', 'Angular', 'Vue.js', 'TypeScript', 'Three.js', 'GSAP'] },
  { name: 'Cloud & DevOps', icon: '☁️', skills: ['AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions'] },
  { name: 'Data', icon: '🗄️', skills: ['PostgreSQL', 'MongoDB', 'DynamoDB', 'Redis', 'Kafka', 'RabbitMQ'] },
]

const SYSTEM = `You are Abhiram S. When asked about a specific technology/skill, explain YOUR hands-on experience with it in 2-3 sentences. Be specific — mention which projects or companies you used it at, what you built, and your proficiency level. Sound natural and confident, not like a resume. If it's a skill you're deeply expert in, show it. If it's one you've used but aren't as deep in, be honest.`

export default function SkillExplorer() {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [explanation, setExplanation] = useState('')
  const [loading, setLoading] = useState(false)

  const explore = async (skill: string) => {
    if (loading) return
    setSelectedSkill(skill)
    setExplanation('')
    setLoading(true)

    const apiKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined
    const model = (import.meta.env.VITE_GROQ_MODEL as string | undefined) ?? 'llama-3.3-70b-versatile'
    const isProduction = import.meta.env.PROD

    if (!isProduction && !apiKey) {
      setExplanation('⚠ API key not configured')
      setLoading(false)
      return
    }

    try {
      const messages: Message[] = [{ role: 'user', content: `Tell me about your experience with ${skill}.` }]
      let full = ''
      for await (const chunk of streamResponse(messages, SYSTEM, apiKey ?? '', model)) {
        full += chunk
        setExplanation(full)
      }
    } catch (err) {
      setExplanation(`Error: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <h3 style={titleStyle}>🧠 Skill Explorer</h3>
      <p style={descStyle}>Tap any skill — AI explains Abhiram's real experience with it.</p>

      <div style={scrollStyle}>
        {CATEGORIES.map((cat) => (
          <div key={cat.name} style={{ marginBottom: '14px' }}>
            <div style={catHeaderStyle}>
              <span>{cat.icon}</span> {cat.name}
            </div>
            <div style={chipGridStyle}>
              {cat.skills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => explore(skill)}
                  style={{
                    ...chipStyle,
                    ...(selectedSkill === skill ? chipActiveStyle : {}),
                  }}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Explanation card */}
        {selectedSkill && (
          <div style={explanationStyle}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', marginBottom: '6px', fontFamily: "'DM Mono', monospace", letterSpacing: '0.04em' }}>
              {selectedSkill.toUpperCase()}
            </div>
            <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-2)' }}>
              {explanation || 'Loading...'}
              {loading && <span style={cursorStyle} />}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const titleStyle: React.CSSProperties = { margin: '0 0 6px', fontSize: '16px', fontWeight: 650, color: 'var(--text-1)' }
const descStyle: React.CSSProperties = { margin: '0 0 12px', fontSize: '12px', color: 'var(--text-3)', lineHeight: 1.4 }
const scrollStyle: React.CSSProperties = { flex: 1, overflowY: 'auto', minHeight: 0 }
const catHeaderStyle: React.CSSProperties = {
  fontSize: '12px', fontWeight: 650, color: 'var(--text-2)', marginBottom: '6px',
  fontFamily: "'DM Mono', monospace", letterSpacing: '0.04em',
}
const chipGridStyle: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '6px' }
const chipStyle: React.CSSProperties = {
  padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(148,163,184,0.2)',
  color: 'var(--text-2)', cursor: 'pointer', fontFamily: "'Cabinet Grotesk', sans-serif",
  transition: 'all 0.2s',
}
const chipActiveStyle: React.CSSProperties = {
  background: 'rgba(74,222,128,0.1)', borderColor: 'rgba(74,222,128,0.4)', color: 'var(--accent)',
}
const explanationStyle: React.CSSProperties = {
  marginTop: '12px', padding: '12px', borderRadius: '10px',
  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(148,163,184,0.12)',
}
const cursorStyle: React.CSSProperties = {
  display: 'inline-block', width: '5px', height: '14px',
  background: 'var(--accent)', marginLeft: '2px', animation: 'pulse-dot 1s infinite',
}
