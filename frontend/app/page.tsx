"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Hero from "./components/Hero";
import IdeaInput from "./components/IdeaInput";
import RoundSection from "./components/RoundSection";
import Report from "./components/Report";

interface AgentResult {
  agent: string;
  name: string;
  response: string;
}

type Stage = "idle" | "round1-loading" | "round1-done" | "round2-loading" | "round2-done" | "synthesizing" | "complete";

export default function Home() {
  const [idea, setIdea]     = useState("");
  const [round1, setRound1] = useState<AgentResult[]>([]);
  const [round2, setRound2] = useState<AgentResult[]>([]);
  const [report, setReport] = useState<any>(null);
  const [stage, setStage]   = useState<Stage>("idle");

  async function handleExportPDF() {
    const res = await fetch("/api/warroom/export-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea, report }),
    });
    const arrayBuffer = await res.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "founderforge-report.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleShare() {
    const res = await fetch("/api/warroom/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea, round1_results: round1, round2_results: round2, report }),
    });
    const data = await res.json();
    const shareUrl = `${window.location.origin}/session/${data.session_id}`;
    await navigator.clipboard.writeText(shareUrl);
    alert("Shareable link copied to clipboard!");
  }

  async function handleLaunch() {
    if (!idea.trim()) return;
    setRound1([]);
    setRound2([]);
    setReport(null);
    setStage("round1-loading");

    const r1 = await fetch("/api/warroom/round1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea }),
    });
    const d1 = await r1.json();
    setRound1(d1.agents);
    setStage("round1-done");

    await new Promise((res) => setTimeout(res, 1500));
    setStage("round2-loading");

    const r2 = await fetch("/api/warroom/round2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea, round1_results: d1.agents }),
    });
    const d2 = await r2.json();
    setRound2(d2.agents);
    setStage("round2-done");

    await new Promise((res) => setTimeout(res, 1000));
    setStage("synthesizing");

    const r3 = await fetch("/api/warroom/synthesis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea, round1_results: d1.agents, round2_results: d2.agents }),
    });
    const d3 = await r3.json();
    setReport(d3);
    setStage("complete");
  }

  const isActive = stage !== "idle" && stage !== "complete";

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6 py-12">
        <Hero />

        <IdeaInput
          idea={idea}
          onChange={setIdea}
          onSubmit={handleLaunch}
          disabled={isActive}
          stage={stage}
        />

        <AnimatePresence>
          {(stage === "round1-loading" || round1.length > 0) && (
            <RoundSection
              label="Round 1"
              subtitle="Independent Analysis — agents assess the idea solo"
              results={round1}
              loading={stage === "round1-loading"}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(stage === "round2-loading" || round2.length > 0) && (
            <RoundSection
              label="Round 2"
              subtitle="Cross Examination — agents challenge each other"
              results={round2}
              loading={stage === "round2-loading"}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {stage === "synthesizing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-3 py-12"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-blue-500"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
              <span className="text-gray-500 text-sm ml-2">
                Synthesizing war room report...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {report && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex gap-3 justify-end mb-4">
                <button
                  onClick={handleShare}
                  className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm font-semibold transition-all active:scale-95"
                >
                  Copy Share Link
                </button>
                <button
                  onClick={handleExportPDF}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold transition-all active:scale-95"
                >
                  Download PDF Report
                </button>
              </div>
              <Report data={report} />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}