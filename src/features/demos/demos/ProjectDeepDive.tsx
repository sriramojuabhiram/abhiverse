// ProjectDeepDive.tsx — Select a project, ask technical deep-dive questions
import { useState, useRef, useEffect, type FormEvent } from 'react'
import { streamResponse, type Message } from '../../../ai/claudeClient'

const PROJECTS = [
  {
    id: 'career-agent',
    name: 'AI Career Agent',
    stack: 'FastAPI · Next.js · React Native · PostgreSQL · Qdrant · RabbitMQ · Docker · GPT-4o',
    context: `AI Career Agent: Autonomous 28-microservice career automation platform.
Architecture: Event-driven microservices with RabbitMQ, FastAPI backends, Next.js dashboard, React Native mobile app.
Features: Crawls 5 job boards (LinkedIn, Indeed, Glassdoor, ZipRecruiter, Dice), AI-analyzes listings with GPT-4o, generates tailored resumes per job, auto-applies. Uses Qdrant for semantic skill matching, PostgreSQL for state, Redis for caching.
Key challenges: Rate limiting across job boards, resume tailoring at scale, distributed job queue reliability.
Engineering: Docker-compose orchestration, 28 containers, health checks, circuit breakers, retry with exponential backoff.`,
  },
  {
    id: 'venture-builder',
    name: 'Venture Builder',
    stack: 'FastAPI · LM Studio · Qdrant · Python · Docker',
    context: `Venture Builder (AI Startup Factory): Fully autonomous 19-step pipeline that builds startups from scratch.
Steps: Market research → opportunity discovery → idea validation → competitive analysis → MVP architecture → code generation → brand design → pitch deck → landing page → deployment → growth hacking → portfolio management.
Architecture: Sequential agent pipeline, each step is an autonomous LangChain agent. Uses LM Studio for local LLM inference (no API costs). Qdrant stores market research embeddings for RAG.
Key decisions: Local LLM (LM Studio) to avoid API costs at scale, modular agent design so each step can be independently improved.
Output: Complete startup package — working MVP, brand assets, pitch deck, deployed landing page, growth strategy.`,
  },
  {
    id: 'ai-buddy',
    name: 'AI Buddy Path',
    stack: 'React · TypeScript · Supabase · Gemini · Groq',
    context: `AI Buddy Path: Gamified 30-day AI mastery platform.
Features: Structured learning roadmap, AI coach (Gemini-powered), prompt engineering factory, career hub, mock interview simulator, app builder, certification tracking, community leaderboard.
Architecture: React SPA with Supabase (auth + Postgres + real-time), Gemini API for coaching, Groq for fast inference in mock interviews.
Gamification: XP system, daily streaks, badges, leaderboard ranking. Each completed lesson/challenge earns XP.
Key challenges: Balancing AI response latency with gamification feel, structuring 30 days of progressively harder content, making mock interviews feel realistic.`,
  },
  {
    id: 'abhiverse',
    name: 'Abhiverse (This Portfolio)',
    stack: 'React Three Fiber · Groq · GSAP · TypeScript · GLSL',
    context: `Abhiverse: 3D planetary portfolio with AI clone.
Architecture: React Three Fiber for 3D scene, 6 procedural planets (each a section), GSAP camera transitions, custom GLSL shaders for planet surfaces and galaxy background.
Features: AI clone chatbot (Groq streaming), cinematic flythrough intro, AI-guided tour, GitHub Brain (live API), interactive skill orbs, glassmorphism UI.
3D tech: Custom planet shader with fractal noise, atmosphere glow, ring systems. CatmullRomCurve3 camera paths. Bloom + vignette post-processing.
Key challenges: Performance on mobile (LOD, reduced particles, lower DPR), streaming AI responses in overlay panels, camera transition smoothness.`,
  },
]

function buildSystemPrompt(projectId: string): string {
  const project = PROJECTS.find((p) => p.id === projectId)
  if (!project) return ''
  return `You are Abhiram S., answering technical deep-dive questions about your project "${project.name}".
Here is the project context:
${project.context}

Rules:
- Answer as Abhiram in first person
- Be technically precise — mention specific technologies, patterns, and trade-offs
- Keep answers concise (3-5 sentences) unless the question demands more detail
- If asked about something not in the context, say you'd be happy to discuss it in a call
- Show engineering depth — mention architecture decisions, challenges, and why you chose specific tools`
}

export default function ProjectDeepDive() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [partial, setPartial] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, partial])

  const selectProject = (id: string) => {
    setSelectedProject(id)
    setMessages([])
    setPartial('')
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading || !selectedProject) return

    const apiKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined
    const model = (import.meta.env.VITE_GROQ_MODEL as string | undefined) ?? 'llama-3.3-70b-versatile'
    if (!apiKey) { setPartial('⚠ API key not configured'); return }

    const userMsg: Message = { role: 'user', content: text }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setPartial('')
    setLoading(true)

    try {
      let full = ''
      for await (const chunk of streamResponse(updated, buildSystemPrompt(selectedProject), apiKey, model)) {
        full += chunk
        setPartial(full)
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: full }])
      setPartial('')
    } catch (err) {
      setPartial(`Error: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!selectedProject) {
    return (
      <div>
        <h3 style={titleStyle}>🏗️ Project Deep Dive</h3>
        <p style={descStyle}>Pick a project and ask technical questions — architecture, challenges, decisions.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {PROJECTS.map((p) => (
            <button key={p.id} onClick={() => selectProject(p.id)} style={projectBtnStyle}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(74,222,128,0.4)' }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(148,163,184,0.2)' }}
            >
              <div style={{ fontSize: '14px', fontWeight: 650, color: 'var(--text-1)', marginBottom: '2px' }}>{p.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: "'DM Mono', monospace" }}>{p.stack}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const project = PROJECTS.find((p) => p.id === selectedProject)!

  const SUGGESTIONS = [
    'What was the hardest engineering challenge?',
    'Why did you choose this tech stack?',
    'How does the architecture scale?',
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <button onClick={() => setSelectedProject(null)} style={backStyle}>←</button>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 650, color: 'var(--text-1)' }}>{project.name}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: "'DM Mono', monospace" }}>{project.stack}</div>
        </div>
      </div>

      {/* Chat messages */}
      <div ref={scrollRef} style={chatStyle}>
        {messages.length === 0 && !partial && (
          <div style={{ padding: '8px 0' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '10px' }}>Try asking:</div>
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => { setInput(s) }} style={suggestionStyle}>{s}</button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={msgStyle(m.role === 'user')}>{m.content}</div>
        ))}
        {partial && (
          <div style={msgStyle(false)}>
            {partial}
            {loading && <span style={cursorStyle} />}
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={submit} style={formStyle}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about architecture, trade-offs, challenges..." style={inputStyle} />
        <button type="submit" disabled={loading || !input.trim()} style={sendBtnStyle}>{loading ? '...' : '→'}</button>
      </form>
    </div>
  )
}

const titleStyle: React.CSSProperties = { margin: '0 0 6px', fontSize: '16px', fontWeight: 650, color: 'var(--text-1)' }
const descStyle: React.CSSProperties = { margin: '0 0 14px', fontSize: '12px', color: 'var(--text-3)', lineHeight: 1.4 }
const projectBtnStyle: React.CSSProperties = {
  padding: '12px 14px', borderRadius: '10px', textAlign: 'left', cursor: 'pointer',
  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(148,163,184,0.2)',
  transition: 'border-color 0.2s',
}
const backStyle: React.CSSProperties = {
  width: '28px', height: '28px', borderRadius: '6px', border: '1px solid rgba(148,163,184,0.2)',
  background: 'transparent', color: 'var(--text-3)', cursor: 'pointer', fontSize: '13px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
const chatStyle: React.CSSProperties = {
  flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: 0,
}
const suggestionStyle: React.CSSProperties = {
  display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', marginBottom: '6px',
  borderRadius: '8px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.15)',
  color: 'var(--accent)', fontSize: '12px', cursor: 'pointer', fontFamily: "'Cabinet Grotesk', sans-serif",
}
function msgStyle(isUser: boolean): React.CSSProperties {
  return {
    alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '88%', padding: '8px 12px', borderRadius: '10px',
    background: isUser ? 'rgba(168,85,247,0.16)' : 'rgba(255,255,255,0.03)',
    border: `1px solid ${isUser ? 'rgba(168,85,247,0.3)' : 'rgba(148,163,184,0.15)'}`,
    fontSize: '13px', lineHeight: 1.5, color: 'var(--text-2)',
  }
}
const formStyle: React.CSSProperties = { display: 'flex', gap: '8px', marginTop: '8px' }
const inputStyle: React.CSSProperties = {
  flex: 1, padding: '8px 12px', borderRadius: '8px',
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(148,163,184,0.25)',
  fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '13px', color: 'var(--text-1)', outline: 'none',
}
const sendBtnStyle: React.CSSProperties = {
  padding: '8px 14px', borderRadius: '8px', border: 'none',
  background: 'var(--accent)', color: 'var(--bg)', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
}
const cursorStyle: React.CSSProperties = {
  display: 'inline-block', width: '5px', height: '14px',
  background: 'var(--accent)', marginLeft: '2px', animation: 'pulse-dot 1s infinite',
}
