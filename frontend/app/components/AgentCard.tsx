"use client";
import { motion } from "framer-motion";
import AgentAvatar from "./AgentAvatar";

const AGENT_STYLES: Record<string, { border: string; label: string; bg: string }> = {
  cfo:      { border: "border-blue-500/40",   label: "text-blue-400",   bg: "bg-blue-950/10"   },
  growth:   { border: "border-green-500/40",  label: "text-green-400",  bg: "bg-green-950/10"  },
  investor: { border: "border-red-500/40",    label: "text-red-400",    bg: "bg-red-950/10"    },
  legal:    { border: "border-purple-500/40", label: "text-purple-400", bg: "bg-purple-950/10" },
};

interface AgentCardProps {
  agent: string;
  name: string;
  response?: string;
  loading?: boolean;
}

export default function AgentCard({ agent, name, response, loading }: AgentCardProps) {
  const style = AGENT_STYLES[agent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`${style.bg} border ${style.border} rounded-2xl p-5 flex flex-col gap-4`}
    >
      <div className="flex items-center gap-3">
        <AgentAvatar agent={agent} size="sm" pulse={loading} />
        <span className={`text-sm font-semibold ${style.label}`}>{name}</span>
        {loading && (
          <div className="ml-auto flex gap-1">
            {[0,1,2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        )}
      </div>

      {response && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm"
        >
          {response}
        </motion.p>
      )}
    </motion.div>
  );
}