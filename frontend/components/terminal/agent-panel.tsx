"use client"

interface AgentPanelProps {
  symbol: string
}

export function AgentPanel({ symbol }: AgentPanelProps) {
  return (
    <div className="bg-[var(--bg-panel)] border border-[var(--border-1)] rounded-[var(--radius-lg)] overflow-hidden m-3.5 shadow-[var(--shadow-sm)]">
      <div className="flex justify-between items-center py-[13px] px-4 border-b border-[var(--border-1)]">
        <div>
          <div className="font-heading text-[15px] font-semibold text-[var(--text-1)]">AI Trading Agent</div>
          <div className="font-mono text-[9px] text-[var(--text-3)] mt-0.5">Powered by Claude · Real-time</div>
        </div>
        <div className="font-mono text-[9px] tracking-[0.1em] py-1 px-2.5 rounded-[20px] text-[var(--green)] bg-[var(--green-bg)] border border-[var(--green-dim)]">
          ● READY
        </div>
      </div>

      <div className="p-4">
        <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--text-3)] mb-2.5">
          Signal for <span className="text-[var(--accent)]">{symbol}</span>
        </div>

        <div className="grid grid-cols-3 gap-px bg-[var(--border-1)] border border-[var(--border-1)] rounded-[var(--radius)] overflow-hidden mb-3.5">
          {[
            { label: "RSI(14)", value: "—" },
            { label: "MACD", value: "—" },
            { label: "Momentum", value: "—" },
          ].map((metric) => (
            <div key={metric.label} className="bg-[var(--bg-card)] py-[9px] px-2.5 text-center">
              <div className="font-mono text-xs text-[var(--text-1)]">{metric.value}</div>
              <div className="font-mono text-[8px] text-[var(--text-3)] mt-0.5 tracking-[0.08em] uppercase">
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--text-3)] mb-2.5">
          Agent Reasoning
        </div>
        <div className="font-sans text-xs text-[var(--text-3)] bg-[var(--bg-input)] border border-[var(--border-1)] rounded-[var(--radius)] p-[10px_12px] mb-3.5 min-h-[52px]">
          Select a stock and click Analyze.
        </div>

        <div className="flex gap-2">
          <button className="flex-1 py-[9px] border border-[var(--border-2)] rounded-[var(--radius)] bg-[var(--bg-input)] text-[var(--text-2)] font-mono text-[10px] tracking-[0.1em] cursor-pointer transition-all duration-[var(--trans)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-glow)]">
            ○ ANALYZE
          </button>
          <button className="py-[9px] px-4 border border-[var(--green-dim)] rounded-[var(--radius)] bg-[var(--green-bg)] text-[var(--green)] font-mono text-[10px] cursor-pointer transition-all duration-[var(--trans)] opacity-50">
            ▲ BUY
          </button>
          <button className="py-[9px] px-4 border border-[var(--red-dim)] rounded-[var(--radius)] bg-[var(--red-bg)] text-[var(--red)] font-mono text-[10px] cursor-pointer transition-all duration-[var(--trans)] opacity-50">
            ▼ SELL
          </button>
        </div>
      </div>
    </div>
  )
}
