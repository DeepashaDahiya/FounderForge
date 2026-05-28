interface AgentAvatarProps {
  agent: string;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
}

const AVATARS: Record<string, { icon: string; bg: string; ring: string }> = {
  cfo:      { icon: "📊", bg: "bg-blue-950",   ring: "ring-blue-500"   },
  growth:   { icon: "🚀", bg: "bg-green-950",  ring: "ring-green-500"  },
  investor: { icon: "🔍", bg: "bg-red-950",    ring: "ring-red-500"    },
  legal:    { icon: "⚖️", bg: "bg-purple-950", ring: "ring-purple-500" },
};

export default function AgentAvatar({ agent, size = "md", pulse = false }: AgentAvatarProps) {
  const avatar = AVATARS[agent];
  const sizes = { sm: "w-8 h-8 text-sm", md: "w-12 h-12 text-xl", lg: "w-16 h-16 text-2xl" };

  return (
    <div className="relative flex-shrink-0">
      <div className={`${sizes[size]} ${avatar.bg} ring-2 ${avatar.ring} rounded-full flex items-center justify-center`}>
        {avatar.icon}
      </div>
      {pulse && (
        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
        </span>
      )}
    </div>
  );
}