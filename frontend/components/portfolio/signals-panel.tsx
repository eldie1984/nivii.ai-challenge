"use client"

export function SignalsPanel() {
  return (
    <div className="p-3.5 flex-1 flex flex-col gap-2.5">
      <div className="font-mono text-[9px] tracking-[0.16em] uppercase text-[var(--text-3)] flex justify-between">
        <span>□ AGENT SIGNALS</span>
        <span>0 signals</span>
      </div>
      <div className="font-sans text-xs text-[var(--text-3)] text-center py-8">
        Run analysis in the Terminal to see signals here.
      </div>
    </div>
  )
}
