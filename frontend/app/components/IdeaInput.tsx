"use client";
import { motion } from "framer-motion";

const STAGE_LABELS: Record<string, string> = {
  idle:             "Launch War Room",
  "round1-loading": "Round 1 in session...",
  "round1-done":    "Starting debate...",
  "round2-loading": "Round 2 in session...",
  "round2-done":    "Synthesizing report...",
  synthesizing:     "Synthesizing report...",
  complete:         "Run Another",
};

const STATUS_LABELS: Record<string, string> = {
  "round1-loading": "⚡ Round 1 — All agents analyzing...",
  "round1-done":    "✓ Round 1 complete — starting debate...",
  "round2-loading": "⚡ Round 2 — Agents cross-examining...",
  "round2-done":    "✓ Round 2 complete — synthesizing...",
  synthesizing:     "⚡ Synthesizing full report...",
};

interface IdeaInputProps {
  idea: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  stage: string;
}

export default function IdeaInput({ idea, onChange, onSubmit, disabled, stage }: IdeaInputProps) {
  const isActive = stage !== "idle" && stage !== "complete";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl p-6 mb-10"
    >
      <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
        Your Startup Idea
      </label>
      <textarea
        className="w-full bg-transparent text-white placeholder-gray-600 resize-none h-28 focus:outline-none text-base leading-relaxed"
        placeholder="Describe your startup idea in detail. The more specific you are, the sharper the debate..."
        value={idea}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        maxLength={500}
      />
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600">{idea.length} / 500</span>
          {isActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-500 font-medium">
                {STATUS_LABELS[stage]}
              </span>
            </motion.div>
          )}
        </div>
        <button
          onClick={onSubmit}
          disabled={disabled || !idea.trim()}
          className="px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-200 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed active:scale-95"
        >
          {STAGE_LABELS[stage] ?? "Launch War Room"}
        </button>
      </div>
    </motion.div>
  );
}