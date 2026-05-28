"use client";
import { motion } from "framer-motion";
import AgentCard from "./AgentCard";

interface AgentResult {
  agent: string;
  name: string;
  response: string;
}

interface RoundSectionProps {
  label: string;
  subtitle: string;
  results: AgentResult[];
  loading?: boolean;
}

const AGENT_ORDER = ["cfo", "growth", "investor", "legal"];
const AGENT_NAMES: Record<string, string> = {
  cfo:      "CFO Agent",
  growth:   "Growth Hacker",
  investor: "Skeptical Investor",
  legal:    "Legal Advisor",
};

export default function RoundSection({ label, subtitle, results, loading }: RoundSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="mb-10"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-gray-800" />
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</p>
          <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>
        </div>
        <div className="h-px flex-1 bg-gray-800" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {AGENT_ORDER.map((agentKey, i) => {
          const result = results.find((r) => r.agent === agentKey);
          return (
            <motion.div
              key={agentKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <AgentCard
                agent={agentKey}
                name={AGENT_NAMES[agentKey]}
                response={result?.response}
                loading={loading && !result}
              />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}