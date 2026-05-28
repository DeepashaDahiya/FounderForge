"use client";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12"
    >
      <div className="inline-flex items-center gap-2 bg-blue-950/50 border border-blue-800/50 rounded-full px-4 py-1.5 mb-6">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
          AI War Room
        </span>
      </div>

      <h1 className="text-6xl font-bold text-white mb-3 tracking-tight">
        Founder<span className="text-blue-500">Forge</span>
      </h1>
      <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
        Four AI advisors. One brutal debate. A complete investor report in minutes.
      </p>

      <div className="flex items-center justify-center gap-8 mt-8">
        {[
          { icon: "📊", label: "CFO Agent"          },
          { icon: "🚀", label: "Growth Hacker"       },
          { icon: "🔍", label: "Skeptical Investor"  },
          { icon: "⚖️", label: "Legal Advisor"       },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-xs text-gray-600">{item.label}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}