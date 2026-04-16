# Abhiverse — Vercel Deployment Guide

## Prerequisites
- GitHub repo: `sriramojuabhiram/abhiverse`
- Vercel account linked to your GitHub

## Step 1: Import Project on Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Select **Import Git Repository** → pick `sriramojuabhiram/abhiverse`
3. Vercel auto-detects Vite — confirm these settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

## Step 2: Environment Variables
Add these in Vercel → Project Settings → Environment Variables:

| Name | Value | Note |
|------|-------|------|
| `GROQ_API_KEY` | `gsk_...` (your Groq key) | **Server-side only** — used by `/api/chat` edge function |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Optional, defaults to this |

> **Security**: The API key is **NOT** exposed to the browser. The client calls `/api/chat` which proxies to Groq server-side.

## Step 3: Deploy
Click **Deploy**. Vercel will:
1. Install dependencies
2. Run `tsc -b && vite build`
3. Output `dist/` as static files
4. Mount `api/chat.js` as an Edge Function

## Architecture
```
Browser  →  /api/chat (Edge Function)  →  Groq API
              ↑ GROQ_API_KEY (server env)
```

- In **production**: client calls `/api/chat`, key stays server-side
- In **local dev**: client calls Groq directly using `VITE_GROQ_API_KEY` from `.env.local`

## Custom Domain (Optional)
1. Vercel → Project Settings → Domains
2. Add your domain (e.g., `abhiverse.dev`)
3. Update DNS: CNAME to `cname.vercel-dns.com`

## Vercel Config
[`vercel.json`](vercel.json) handles:
- SPA fallback routing (all non-asset paths → `index.html`)
- Cache headers for static assets (1 year for fingerprinted, 1 week for models)
- API route rewriting

## Troubleshooting
- **AI chat not working**: Check `GROQ_API_KEY` is set in Vercel env vars (not `VITE_GROQ_API_KEY`)
- **404 on refresh**: The SPA rewrite in `vercel.json` handles this
- **Large chunks warning**: Expected for Three.js — chunks are already code-split via `manualChunks`
