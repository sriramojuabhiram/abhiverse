const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Whitelist of allowed models to prevent abuse
const ALLOWED_MODELS = new Set([
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
  'gemma2-9b-it',
]);

// Max system prompt length to prevent prompt stuffing
const MAX_SYSTEM_PROMPT_LENGTH = 8000;
const MAX_MESSAGE_LENGTH = 2000;

export const config = { runtime: 'edge' };

export default async function handler(req) {
  // CORS: only allow requests from our own domain
  const origin = req.headers.get('origin') || '';
  const allowedOrigins = [
    'https://abhiverse-theta.vercel.app',
    'https://abhiverse.vercel.app',
  ];
  // Also allow Vercel preview deployments
  const isAllowed = allowedOrigins.includes(origin) ||
    origin.endsWith('.vercel.app') ||
    origin.startsWith('http://localhost');

  const corsHeaders = {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GROQ_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    const body = await req.json();

    // Validate and sanitize input
    const { messages, model, systemPrompt } = body;
    if (!Array.isArray(messages) || typeof systemPrompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Enforce model whitelist
    const allowedModel = ALLOWED_MODELS.has(model) ? model : 'llama-3.3-70b-versatile';

    // Truncate system prompt to prevent abuse
    const safeSystemPrompt = systemPrompt.slice(0, MAX_SYSTEM_PROMPT_LENGTH);

    // Limit message history and individual message length
    const trimmedMessages = messages.slice(-14).map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: typeof m.content === 'string' ? m.content.slice(0, MAX_MESSAGE_LENGTH) : '',
    }));

    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: allowedModel,
        max_tokens: 380,
        stream: true,
        messages: [
          { role: 'system', content: safeSystemPrompt },
          ...trimmedMessages,
        ],
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return new Response(errText, {
        status: groqRes.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Stream the response back
    return new Response(groqRes.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        ...corsHeaders,
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
