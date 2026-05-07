"use client"

interface StatCardProps {
  label: string
  value: string
  sub: string
  color?: "default" | "green" | "red" | "accent"
  subColor?: "default" | "green"
}

function StatCard({ label, value, sub, color = "default", subColor = "default" }: StatCardProps) {
  const valueColors = {
    default: "text-[var(--text-1)]",
    green: "text-[var(--green)]",
    red: "text-[var(--red)]",
    accent: "text-[var(--accent)]",
  }

  const subColors = {
    default: "text-[var(--text-3)]",
    green: "text-[var(--green-dim)]",
  }

  return (
    <div className="bg-[var(--bg-panel)] p-4 transition-[background] duration-[var(--trans)] cursor-default hover:bg-[var(--bg-hover)]">
      <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--text-3)] mb-1.5">
        {label}
      </div>
      <div className={`font-heading text-xl font-bold ${valueColors[color]}`}>
        {value}
      </div>
      <div className={`font-mono text-[9px] mt-[3px] ${subColors[subColor]}`}>
        {sub}
      </div>
    </div>
  )
}

export function StatsGrid() {
  return (
    <div className="grid grid-cols-3 gap-px bg-[var(--border-1)] border border-[var(--border-1)] rounded-[var(--radius-lg)] overflow-hidden mb-4 shadow-[var(--shadow-sm)]">
      <StatCard label="Cash" value="$50,000" sub="Available" />
      <StatCard label="Total P&L" value="+$0" sub="+0.00%" color="green" subColor="green" />
      <StatCard label="Positions" value="0" sub="0 orders" />
      <StatCard label="Win Rate" value="—" sub="Est." />
      <StatCard label="Signals" value="0" sub="Agent runs" color="accent" />
      <StatCard label="MKT Value" value="$0" sub="Holdings" />
    </div>
  )
}
