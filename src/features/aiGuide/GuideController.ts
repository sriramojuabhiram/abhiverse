// GuideController.ts — Generates narration for tour steps using existing LLM
import { streamResponse, type Message } from '../../ai/claudeClient'

const GUIDE_SYSTEM_PROMPT = `You are the AI digital clone of Abhiram.S, giving a guided tour of your 3D portfolio universe.
Speak in first person as Abhiram. Be warm, confident, and concise.
Keep responses to exactly 2 short sentences. Sound like a friendly tour guide.
Never say "as an AI" or mention being a language model.`

export async function generateNarration(sectionPrompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined
  const model = (import.meta.env.VITE_GROQ_MODEL as string | undefined) ?? 'llama-3.3-70b-versatile'

  if (!apiKey) {
    return getFallbackNarration(sectionPrompt)
  }

  try {
    const messages: Message[] = [{ role: 'user', content: sectionPrompt }]
    let full = ''
    for await (const chunk of streamResponse(messages, GUIDE_SYSTEM_PROMPT, apiKey, model)) {
      full += chunk
    }
    return full || getFallbackNarration(sectionPrompt)
  } catch {
    return getFallbackNarration(sectionPrompt)
  }
}

/** Fallback narrations when LLM is unavailable */
function getFallbackNarration(prompt: string): string {
  if (prompt.includes('Introduce')) {
    return "Hey! I'm Abhiram — an AI Software Engineer who builds autonomous agentic systems. Welcome to my universe!"
  }
  if (prompt.includes('strengths')) {
    return "My core strengths are agentic AI workflows with LangChain, full-stack engineering across Python and TypeScript, and cloud-native deployments at scale."
  }
  if (prompt.includes('career')) {
    return "I've engineered enterprise systems at Tesla, Anheuser-Busch, McDonald's, Corteva Agriscience, and Southwest Airlines. Seven companies across Fortune 500 — each role sharpened my expertise in distributed systems and AI."
  }
  if (prompt.includes('projects')) {
    return "My AI Career Agent autonomously crawls job boards and auto-applies, while Venture Builder runs a full 19-step startup pipeline with AI. These are real production systems."
  }
  if (prompt.includes('Wrap up')) {
    return "Thanks for exploring my universe! Feel free to reach out — I'm always open to exciting opportunities and collaborations."
  }
  return "Welcome to this zone! Take a look around."
}
