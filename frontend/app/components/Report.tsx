interface Risk {
  risk: string;
  severity: "high" | "medium" | "low";
  mitigation: string;
}

interface ReportData {
  verdict: "proceed" | "pivot" | "kill";
  confidence: number;
  executive_summary: string;
  consensus: string[];
  key_disagreements: string[];
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  gtm: {
    primary_channel: string;
    ninety_day_plan: string[];
  };
  financials: {
    year1_revenue: number;
    year2_revenue: number;
    year3_revenue: number;
    break_even_month: number;
  };
  risks: Risk[];
  final_recommendation: string;
}

const VERDICT_STYLES = {
  proceed: { text: "text-green-400",  border: "border-green-500"  },
  pivot:   { text: "text-yellow-400", border: "border-yellow-500" },
  kill:    { text: "text-red-400",    border: "border-red-500"    },
};

const VERDICT_LABELS = {
  proceed: "PROCEED",
  pivot:   "PIVOT",
  kill:    "KILL IT",
};

const SEVERITY_STYLES = {
  high:   "bg-red-950 text-red-400 border border-red-800",
  medium: "bg-yellow-950 text-yellow-400 border border-yellow-800",
  low:    "bg-gray-800 text-gray-400 border border-gray-700",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 pb-2 border-b border-gray-800">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function Report({ data }: { data: ReportData }) {
  const verdict = VERDICT_STYLES[data.verdict];
  const label = VERDICT_LABELS[data.verdict];

  function fmt(n: number) {
    if (n >= 1000000) return "$" + (n / 1000000).toFixed(1) + "M";
    return "$" + (n / 1000).toFixed(0) + "K";
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mt-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">War Room Report</h2>
          <p className="text-gray-500 text-sm">Synthesized from full debate transcript</p>
        </div>
        <div className="text-right">
          <div className={`inline-block px-6 py-2 rounded-xl font-bold text-lg border ${verdict.border} ${verdict.text} mb-1`}>
            {label}
          </div>
          <p className="text-gray-500 text-sm">{data.confidence}% confidence</p>
        </div>
      </div>

      {/* Executive Summary */}
      <Section title="Executive Summary">
        <p className="text-gray-300 leading-relaxed">{data.executive_summary}</p>
      </Section>

      {/* Consensus + Disagreements */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
            What All Agents Agreed On
          </h3>
          <ul className="space-y-2">
            {data.consensus.map((point, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-300">
                <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
            Key Disagreements
          </h3>
          <ul className="space-y-2">
            {data.key_disagreements.map((point, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-300">
                <span className="text-red-500 flex-shrink-0 mt-0.5">✕</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* SWOT */}
      <Section title="SWOT Analysis">
        <div className="grid grid-cols-2 gap-3">
          {(["strengths", "weaknesses", "opportunities", "threats"] as const).map((key) => {
            const colors: Record<string, string> = {
              strengths:     "border-green-800  bg-green-950/30",
              weaknesses:    "border-red-800    bg-red-950/30",
              opportunities: "border-blue-800   bg-blue-950/30",
              threats:       "border-yellow-800 bg-yellow-950/30",
            };
            const labels: Record<string, string> = {
              strengths:     "Strengths",
              weaknesses:    "Weaknesses",
              opportunities: "Opportunities",
              threats:       "Threats",
            };
            return (
              <div key={key} className={`border rounded-xl p-4 ${colors[key]}`}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  {labels[key]}
                </h4>
                <ul className="space-y-1">
                  {data.swot[key].map((item, i) => (
                    <li key={i} className="text-sm text-gray-300">• {item}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Section>

      {/* GTM */}
      <Section title="Go-To-Market Strategy">
        <p className="text-sm text-gray-400 mb-3">
          Primary channel:{" "}
          <span className="text-white font-semibold">{data.gtm.primary_channel}</span>
        </p>
        <div className="space-y-2">
          {data.gtm.ninety_day_plan.map((step, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="bg-blue-900 text-blue-300 text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0">
                {i + 1}
              </span>
              <p className="text-sm text-gray-300 pt-0.5">{step}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Financials */}
      <Section title="Financial Projections">
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Year 1 Revenue",   value: fmt(data.financials.year1_revenue)          },
            { label: "Year 2 Revenue",   value: fmt(data.financials.year2_revenue)          },
            { label: "Year 3 Revenue",   value: fmt(data.financials.year3_revenue)          },
            { label: "Break-Even Month", value: `Month ${data.financials.break_even_month}` },
          ].map((item) => (
            <div key={item.label} className="bg-gray-800 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">{item.label}</p>
              <p className="text-xl font-bold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Risk Register */}
      <Section title="Risk Register">
        <div className="space-y-3">
          {data.risks.map((risk, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4 mb-2">
                <p className="text-sm text-white font-medium">{risk.risk}</p>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ${SEVERITY_STYLES[risk.severity]}`}>
                  {risk.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-gray-400">Mitigation: {risk.mitigation}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Final Recommendation */}
      <div className={`border ${verdict.border} rounded-xl p-5`}>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
          Final Recommendation
        </h3>
        <p className={`font-semibold leading-relaxed ${verdict.text}`}>
          {data.final_recommendation}
        </p>
      </div>

    </div>
  );
}