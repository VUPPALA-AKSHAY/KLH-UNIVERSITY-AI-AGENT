# KLH University AI Agent

An AI-powered assistant for KL University that answers student questions by scraping the official KLH website and synthesizing responses. Supports text chat, web-search mode, and voice calls with ElevenLabs TTS.

## Features

- RAG-style chat grounded on KLH website content (B.Tech, placements, fees, programs, etc.)
- Fast mode (scrapes KLH pages) and Thinking mode (web search via Tavily)
- Voice call with Riya — browser Speech-to-Text + ElevenLabs TTS
- Conversation memory per session (last 20 messages)
- Cloudflare Workers AI as the primary answer model, with configurable fallback

## Tech Stack

- Backend: Node.js, Express
- Frontend: Vanilla JS, HTML, CSS (public folder)
- AI: Cloudflare Workers AI (`@cf/mistralai/mistral-small-3.1-24b-instruct`) as primary; iFlow/DeepSeek as fallback
- Voice: ElevenLabs TTS + Web Speech API
- Search: Tavily
- Hosting: Vercel (Express wrapped in a serverless function)

## Project Structure

```
api/index.js        Vercel serverless entry (exports express app)
public/             Frontend (index.html, styles, scripts, assets)
src/ai/gemini.js    AI model config + Cloudflare primary
src/routes/chat.js  Text chat endpoints
src/routes/voice.js Voice endpoints
src/scraper/        KLH site scraper utilities
server.js           Express app bootstrap
```

## Setup

```bash
cd C:\Users\Akshay\Desktop\C DRIVE ODSKTP\CHATKLUNI
npm install
cp .env.example .env   # fill in your keys
node server.js         # runs at http://localhost:3000 (or PORT from .env)
```

## Environment Variables

```
PORT=3000
PRIMARY_API_KEY=<cloudflare token>
PRIMARY_BASE_URL=https://api.cloudflare.com/client/v4/accounts/<account_id>/ai/v1
TAVILY_API_KEY=<tavily key>
ELEVENLABS_API_KEY=<elevenlabs key>
ELEVENLABS_VOICE_ID=<voice id>
# optional fallbacks
GEMINI_API_KEY=
IFLOW_API_KEY=
GROQ_API_KEY=
FRENIX_API_KEY=
```

## Deploy to Vercel

```bash
vercel --prod
```

The Express app is exported as a serverless function via `api/index.js`, and all routes rewrite to it (`vercel.json`).

## Endpoints

- `POST /api/chat` — text chat
- `GET  /api/models` — available models
- `POST /api/voice/quick-chat` — fast voice answer
- `POST /api/voice/speak` — ElevenLabs TTS
