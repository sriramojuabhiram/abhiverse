export interface Message { role: 'user' | 'assistant'; content: string }

const isProduction = import.meta.env.PROD
const CHAT_ENDPOINT = isProduction ? '/api/chat' : 'https://api.groq.com/openai/v1/chat/completions'

export async function* streamResponse(
  messages: Message[],
  systemPrompt: string,
  apiKey: string,
  model: string,
): AsyncGenerator<string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  let body: string

  if (isProduction) {
    // Use serverless proxy — API key stays server-side
    body = JSON.stringify({ messages: messages.slice(-14), systemPrompt, model })
  } else {
    // Local dev — call Groq directly
    headers['Authorization'] = `Bearer ${apiKey}`
    body = JSON.stringify({
      model,
      max_tokens: 380,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-14),
      ],
    })
  }

  const res = await fetch(CHAT_ENDPOINT, { method: 'POST', headers, body })
  if (!res.ok) {
    let reason = ''
    try {
      const errJson = await res.clone().json()
      reason = errJson?.error?.message ?? ''
    } catch { /* ignore */ }

    if (res.status === 429) {
      const isQuota = reason.toLowerCase().includes('quota') || reason.toLowerCase().includes('billing')
      throw new Error(
        isQuota
          ? 'Groq quota exceeded — the API billing limit has been reached. Please try again later or check your Groq account.'
          : 'Too many requests — Groq rate limit hit. Please wait a moment and try again.'
      )
    }
    if (res.status === 401) throw new Error('Invalid API key configuration.')
    throw new Error(`API error ${res.status}${reason ? ': ' + reason : ''}`)
  }
  const reader = res.body!.getReader()
  const dec = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = dec.decode(value, { stream: true })
    for (const line of chunk.split('\n').filter(l => l.startsWith('data: '))) {
      const data = line.slice(6).trim()
      if (data === '[DONE]') return
      try {
        const d = JSON.parse(data)
        const token = d.choices?.[0]?.delta?.content
        if (token) yield token
      } catch { /* skip non-JSON */ }
    }
  }
}
