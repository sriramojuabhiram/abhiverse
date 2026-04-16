// JobFitAnalyzer.tsx — Paste a job description, AI analyzes fit against Abhiram's profile
import { useState, type FormEvent } from 'react'
import { streamResponse, type Message } from '../../../ai/claudeClient'

const SYSTEM = `You are a recruiting intelligence engine. You know Abhiram S.'s complete profile:

CAREER: 11+ years enterprise software. Anheuser-Busch InBev, St. Louis (Lead Full Stack Developer — .NET / Angular / AI, Jun 2024–now), Tesla Inc., Fremont (Senior Software Development Engineer / AI-ML Engineer, Jan 2023–Jun 2024), McDonald's Corporation, Chicago (Senior .NET Developer — Cloud & Data, Sep 2021–Dec 2022), Corteva Agriscience, Des Moines (Senior .NET Developer — Cloud / Full Stack, Jun 2020–Aug 2021), Centene Corporation, St. Louis (Senior Software Application Engineer, Apr 2018–May 2020), Southwest Airlines, Dallas (Senior .NET Developer — Azure / DevOps, Jan 2017–Mar 2018), Citizens Bank, Providence (Senior .NET Developer, Mar 2016–Dec 2016).
EDUCATION: M.S. IT — Colorado Technical University, Denver, CO, 2017; B.S. CS — KITS India, 2012.
SKILLS: C#, ASP.NET Core, .NET 8+, Entity Framework Core, Angular (2–17), React.js, TypeScript, SQL Server, Oracle Database, Azure SQL, PostgreSQL, MongoDB, Redis, Cosmos DB, DynamoDB, OpenAI GPT-4, Anthropic Claude, LangChain, LangGraph, CrewAI, LlamaIndex, Hugging Face, MLflow, Azure AI/ML, GitHub Copilot, Cursor, Azure (AKS, Functions, DevOps), AWS (EC2, Lambda, ECS/EKS, S3), Docker, Kubernetes, Terraform, Kafka, RabbitMQ, Azure Service Bus.
PROJECTS: AI Career Agent (28 microservices, auto-applies to jobs), Venture Builder (autonomous startup factory), AI Buddy Path (gamified AI learning), Abhiverse (3D portfolio with AI clone).

Given a job description, analyze the fit:
1. Start with a MATCH SCORE (0-100%) — be honest and realistic
2. List 4-6 MATCHED SKILLS with brief proof from his experience
3. List any GAPS (skills in the JD he doesn't have) — be honest
4. Write a 2-sentence VERDICT on overall fit

Format with clear headers. Be concise and honest — don't oversell.`

export default function JobFitAnalyzer() {
  const [jd, setJd] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const analyze = async (e: FormEvent) => {
    e.preventDefault()
    if (!jd.trim() || loading) return

    const apiKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined
    const model = (import.meta.env.VITE_GROQ_MODEL as string | undefined) ?? 'llama-3.3-70b-versatile'

    if (!apiKey) {
      setResult('⚠ API key not configured')
      return
    }

    setLoading(true)
    setResult('')

    try {
      const messages: Message[] = [{ role: 'user', content: jd.trim() }]
      let full = ''
      for await (const chunk of streamResponse(messages, SYSTEM, apiKey, model)) {
        full += chunk
        setResult(full)
      }
    } catch (err) {
      setResult(`Error: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <h3 style={titleStyle}>🎯 Job Fit Analyzer</h3>
      <p style={descStyle}>Paste a job description — AI analyzes how well Abhiram matches.</p>

      {!result && !loading ? (
        <form onSubmit={analyze} style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste job description here..."
            style={textareaStyle}
          />
          <button type="submit" disabled={!jd.trim()} style={btnStyle}>
            Analyze Fit
          </button>
        </form>
      ) : (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={resultStyle}>
            {result.split('\n').map((line, i) => {
              if (/^#{1,3}\s|^MATCH|^MATCHED|^GAPS?|^VERDICT/i.test(line.trim())) {
                return <div key={i} style={headerLineStyle}>{line.replace(/^#+\s*/, '')}</div>
              }
              return <div key={i} style={{ marginBottom: '4px' }}>{line || '\u00A0'}</div>
            })}
            {loading && <span style={cursorStyle} />}
          </div>
          {!loading && (
            <button onClick={() => { setResult(''); setJd('') }} style={{ ...btnStyle, marginTop: '10px', background: 'transparent', border: '1px solid rgba(148,163,184,0.25)', color: 'var(--text-3)' }}>
              Analyze Another
            </button>
          )}
        </div>
      )}
    </div>
  )
}

const titleStyle: React.CSSProperties = { margin: '0 0 6px', fontSize: '16px', fontWeight: 650, color: 'var(--text-1)' }
const descStyle: React.CSSProperties = { margin: '0 0 12px', fontSize: '12px', color: 'var(--text-3)', lineHeight: 1.4 }
const textareaStyle: React.CSSProperties = {
  flex: 1, minHeight: '120px', padding: '10px 12px', borderRadius: '10px', resize: 'none',
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(148,163,184,0.25)',
  fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '13px', color: 'var(--text-1)', outline: 'none', lineHeight: 1.5,
}
const btnStyle: React.CSSProperties = {
  padding: '10px 20px', borderRadius: '10px', border: 'none',
  background: 'var(--accent)', color: 'var(--bg)',
  fontFamily: "'DM Mono', monospace", fontSize: '12px', fontWeight: 700,
  letterSpacing: '0.06em', cursor: 'pointer', textTransform: 'uppercase',
}
const resultStyle: React.CSSProperties = {
  flex: 1, overflowY: 'auto', fontSize: '13px', lineHeight: 1.6, color: 'var(--text-2)',
  padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(148,163,184,0.12)',
}
const headerLineStyle: React.CSSProperties = {
  fontSize: '13px', fontWeight: 700, color: 'var(--accent)',
  marginTop: '10px', marginBottom: '4px', fontFamily: "'DM Mono', monospace",
  letterSpacing: '0.04em',
}
const cursorStyle: React.CSSProperties = {
  display: 'inline-block', width: '5px', height: '14px',
  background: 'var(--accent)', marginLeft: '2px', animation: 'pulse-dot 1s infinite',
}
