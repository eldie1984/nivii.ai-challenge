"use client"

export function HoldingsTable() {
  return (
    <div className="bg-[var(--bg-panel)] border border-[var(--border-1)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)] mb-4">
      <div className="flex justify-between items-center py-3 px-[18px] border-b border-[var(--border-1)]">
        <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-[var(--text-2)] flex items-center gap-[7px]">
          <span className="text-[var(--accent)]">◆</span> HOLDINGS
        </span>
        <span className="font-mono text-[9px] text-[var(--text-3)] bg-[var(--bg-muted)] border border-[var(--border-1)] py-0.5 px-2 rounded-[20px]">
          0 positions
        </span>
      </div>
      
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="py-[9px] px-[18px] text-left font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--text-3)] border-b border-[var(--border-1)] font-normal">
              SYMBOL
            </th>
            <th className="py-[9px] px-[18px] text-right font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--text-3)] border-b border-[var(--border-1)] font-normal">
              SHARES
            </th>
            <th className="py-[9px] px-[18px] text-right font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--text-3)] border-b border-[var(--border-1)] font-normal">
              AVG COST
            </th>
            <th className="py-[9px] px-[18px] text-right font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--text-3)] border-b border-[var(--border-1)] font-normal">
              MKT VALUE
            </th>
            <th className="py-[9px] px-[18px] text-right font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--text-3)] border-b border-[var(--border-1)] font-normal">
              P&L
            </th>
            <th className="py-[9px] px-[18px] text-right font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--text-3)] border-b border-[var(--border-1)] font-normal">
              %
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={6} className="text-center py-6 font-mono text-[11px] text-[var(--text-3)]">
              No open positions. <span className="text-[var(--accent)] cursor-pointer hover:underline">Open terminal →</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
