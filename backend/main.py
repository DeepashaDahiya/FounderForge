from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import os
import asyncio
from dotenv import load_dotenv
from agents import AGENTS
from pdf_generator import generate_pdf
from fastapi.responses import Response as FastAPIResponse
import uuid

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI()

import os

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        os.getenv("FRONTEND_URL", ""),
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

class IdeaRequest(BaseModel):
    idea: str

def call_agent(agent_key: str, idea: str) -> dict:
    agent = AGENTS[agent_key]
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=600,
        messages=[
            {
                "role": "system",
                "content": agent["system"]
            },
            {
                "role": "user",
                "content": f"Startup idea: {idea}"
            }
        ]
    )
    return {
        "agent": agent_key,
        "name": agent["name"],
        "color": agent["color"],
        "response": response.choices[0].message.content
    }

@app.get("/")
def root():
    return {"message": "FounderForge backend is alive"}

@app.post("/warroom/round1")
async def round1(request: IdeaRequest):
    loop = asyncio.get_event_loop()
    tasks = [
        loop.run_in_executor(None, call_agent, key, request.idea)
        for key in AGENTS.keys()
    ]
    results = await asyncio.gather(*tasks)
    return {"agents": list(results)}

class Round2Request(BaseModel):
    idea: str
    round1_results: list

def call_agent_round2(agent_key: str, idea: str, round1_results: list) -> dict:
    agent = AGENTS[agent_key]

    others_analysis = ""
    for result in round1_results:
        if result["agent"] != agent_key:
            others_analysis += f"\n\n{result['name']} said:\n{result['response']}"

    system_with_conflict = agent["system"] + f"""

CRITICAL INSTRUCTION FOR THIS ROUND:
You have now read what the other advisors said. You MUST:
1. Pick the ONE claim from another advisor that you most disagree with
2. Directly challenge it by name (e.g. "The Growth Hacker claims X — this is wrong because...")
3. Then add one NEW insight the others missed entirely

Stay in character. Be direct. This is a debate, not a consensus meeting."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=600,
        messages=[
            {
                "role": "system",
                "content": system_with_conflict
            },
            {
                "role": "user",
                "content": f"""Startup idea: {idea}

Here is what the other advisors said in Round 1:
{others_analysis}

Now respond: challenge one of them directly and add one new insight."""
            }
        ]
    )

    return {
        "agent": agent_key,
        "name": agent["name"],
        "color": agent["color"],
        "response": response.choices[0].message.content
    }

@app.post("/warroom/round2")
async def round2(request: Round2Request):
    loop = asyncio.get_event_loop()
    tasks = [
        loop.run_in_executor(None, call_agent_round2, key, request.idea, request.round1_results)
        for key in AGENTS.keys()
    ]
    results = await asyncio.gather(*tasks)
    return {"agents": list(results)}

import json

class SynthesisRequest(BaseModel):
    idea: str
    round1_results: list
    round2_results: list

def call_synthesis(idea: str, round1_results: list, round2_results: list) -> dict:

    transcript = f"STARTUP IDEA: {idea}\n\n"
    transcript += "=== ROUND 1 — INDEPENDENT ANALYSIS ===\n"
    for r in round1_results:
        transcript += f"\n{r['name']}:\n{r['response']}\n"

    transcript += "\n=== ROUND 2 — CROSS EXAMINATION ===\n"
    for r in round2_results:
        transcript += f"\n{r['name']}:\n{r['response']}\n"

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=2000,
        messages=[
            {
                "role": "system",
                "content": """You are the Chief Synthesis Officer of a startup war room. You have just observed a full debate between four expert advisors. Your job is to synthesize everything into a structured, honest, actionable report.

You must respond ONLY with a valid JSON object. No preamble, no explanation, no markdown code fences. Just raw JSON.

The JSON must follow this exact structure:
{
  "verdict": "proceed" or "pivot" or "kill",
  "confidence": <integer 0-100>,
  "executive_summary": "<3 sentences max>",
  "consensus": ["<point 1>", "<point 2>", "<point 3>"],
  "key_disagreements": ["<disagreement 1>", "<disagreement 2>"],
  "swot": {
    "strengths": ["<s1>", "<s2>", "<s3>"],
    "weaknesses": ["<w1>", "<w2>", "<w3>"],
    "opportunities": ["<o1>", "<o2>", "<o3>"],
    "threats": ["<t1>", "<t2>", "<t3>"]
  },
  "gtm": {
    "primary_channel": "<channel>",
    "ninety_day_plan": ["<step 1>", "<step 2>", "<step 3>", "<step 4>"]
  },
  "financials": {
    "year1_revenue": <integer>,
    "year2_revenue": <integer>,
    "year3_revenue": <integer>,
    "break_even_month": <integer>
  },
  "risks": [
    { "risk": "<description>", "severity": "high" or "medium" or "low", "mitigation": "<mitigation>" },
    { "risk": "<description>", "severity": "high" or "medium" or "low", "mitigation": "<mitigation>" },
    { "risk": "<description>", "severity": "high" or "medium" or "low", "mitigation": "<mitigation>" }
  ],
  "final_recommendation": "<2-3 sentences of direct actionable advice>"
}"""
            },
            {
                "role": "user",
                "content": f"Here is the full war room transcript:\n\n{transcript}\n\nGenerate the synthesis report as JSON only."
            }
        ]
    )

    raw = response.choices[0].message.content.strip()

    # Strip markdown fences if model adds them anyway
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]

    report = json.loads(raw.strip())
    return report

@app.post("/warroom/synthesis")
async def synthesis(request: SynthesisRequest):
    loop = asyncio.get_event_loop()
    report = await loop.run_in_executor(
        None, call_synthesis, request.idea, request.round1_results, request.round2_results
    )
    return report

class PDFRequest(BaseModel):
    idea: str
    report: dict

@app.post("/warroom/export-pdf")
async def export_pdf(request: PDFRequest):
    loop = asyncio.get_event_loop()
    pdf_bytes = await loop.run_in_executor(
        None, generate_pdf, request.report, request.idea
    )
    return FastAPIResponse(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=founderforge-report.pdf"}
    )

# In-memory session store
sessions_store: dict = {}

class SaveSessionRequest(BaseModel):
    idea: str
    round1_results: list
    round2_results: list
    report: dict

@app.post("/warroom/save")
async def save_session(request: SaveSessionRequest):
    session_id = str(uuid.uuid4())[:8]
    sessions_store[session_id] = {
        "idea": request.idea,
        "round1_results": request.round1_results,
        "round2_results": request.round2_results,
        "report": request.report
    }
    return {"session_id": session_id}

@app.get("/warroom/session/{session_id}")
async def get_session(session_id: str):
    session = sessions_store.get(session_id)
    if not session:
        return FastAPIResponse(status_code=404, content="Session not found")
    return session