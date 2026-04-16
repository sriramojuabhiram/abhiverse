import { useState, useCallback, useRef } from 'react'
import { streamResponse, type Message } from './claudeClient'
import { buildSystemPrompt } from './systemPrompt'
import { useAppStore } from '../store/appStore'

export function useAIStream() {
  const [messages, setMessages] = useState<Message[]>([])
  const [partial, setPartial] = useState('')
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const send = useCallback(async (text: string) => {
    const section = useAppStore.getState().section
    const isProduction = import.meta.env.PROD
    const apiKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined
    const model = (import.meta.env.VITE_GROQ_MODEL as string | undefined) ?? 'llama-3.3-70b-versatile'
    // In production, the edge proxy handles the API key; in dev, we need it locally
    if (!isProduction && !apiKey) { setPartial('⚠ VITE_GROQ_API_KEY not set in .env.local'); return }

    const userMsg: Message = { role: 'user', content: text }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setPartial('')
    setLoading(true)

    const tryStream = async (retryDelay?: number) => {
      if (retryDelay) {
        setPartial('Rate limited — retrying in a moment…')
        await new Promise(r => setTimeout(r, retryDelay))
      }
      let full = ''
      for await (const chunk of streamResponse(updated, buildSystemPrompt(section), apiKey ?? '', model)) {
        full += chunk
        setPartial(full)
      }
      setMessages(prev => [...prev, { role: 'assistant', content: full }])
      setPartial('')
    }

    try {
      await tryStream()
    } catch (e) {
      const msg = (e as Error).message
      // Retry once after 3 s for transient rate limits (not quota errors)
      if (msg.includes('rate limit') && !msg.includes('quota')) {
        try {
          await tryStream(3000)
          return
        } catch (e2) {
          setPartial(`Error: ${(e2 as Error).message}`)
          return
        }
      }
      setPartial(`Error: ${msg}`)
    } finally {
      setLoading(false)
    }
  }, [messages])

  const reset = useCallback(() => {
    setMessages([])
    setPartial('')
    abortRef.current?.abort()
  }, [])

  return { messages, partial, loading, send, reset }
}
