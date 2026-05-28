# FounderForge — AI War Room for Startups

> Four AI advisors. One brutal debate. A complete investor report in minutes.

🔗 **Live Demo:** https://founder-forge-two.vercel.app/

---

## What It Does

You enter a startup idea. Four specialized AI agents — a CFO, Growth Hacker,
Skeptical Investor, and Legal Advisor — independently analyze it, then debate
each other in real time. A Synthesis agent reads the full transcript and
generates a structured war room report including SWOT analysis, financial
projections, go-to-market strategy, and risk register. Downloadable as PDF.

---

## Architecture

- **Multi-agent orchestration** — five Groq-powered agents with conflicting
  objectives, managed by a FastAPI debate engine
- **Parallel execution** — Round 1 fires all four agents simultaneously using
  Python asyncio, cutting response time by 75%
- **Framer Motion UI** — animated agent cards, staggered entrances, live
  typing indicators and pulsing avatars
- **Structured generative output** — Synthesis agent prompted to return
  parseable JSON, fed into a fully rendered report component
- **PDF export** — ReportLab generates a downloadable professional report

---

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Frontend     | Next.js 14, TypeScript, Tailwind    |
| Animations   | Framer Motion                       |
| Backend      | FastAPI, Python 3.11, asyncio       |
| AI           | Groq API — Llama 3.3 70B            |
| PDF          | ReportLab                           |
| Deployment   | Vercel (frontend), Railway (backend)|

---

## Local Setup

**Backend**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
# Add GROQ_API_KEY to .env
uvicorn main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
# Add NEXT_PUBLIC_API_URL=http://localhost:8000 to .env.local
npm run dev
```

---

Built by Deepasha — BTECH CSE-AI
