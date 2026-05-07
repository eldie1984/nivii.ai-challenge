"use client"

const LOGS = [
  { time: '06:54 PM', msg: 'Terminal online. Agent ready.' },
  { time: '04:23 PM', msg: 'Terminal online. Agent ready.' },
  { time: '06:08 AM', msg: 'Terminal online. Agent ready.' },
  { time: '06:40 AM', msg: 'Terminal online. Agent ready.' },
  { time: '01:30 AM', msg: 'Terminal online. Agent ready.' },
  { time: '01:38 AM', msg: 'Terminal online. Agent ready.' },
]

export function ActivityLog() {
  return (
    <div className="bg-[var(--bg-panel)] border border-[var(--border-1)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)]">
      <div className="flex justify-between items-center py-[11px] px-[18px] border-b border-[var(--border-1)] font-mono text-[9px] tracking-[0.14em] uppercase">
        <span className="text-[var(--text-2)] flex items-center gap-[7px]">
          <span className="text-[var(--accent)]">◆</span> ACTIVITY LOG
        </span>
        <span className="text-[var(--text-3)]">{LOGS.length} events</span>
      </div>
      
      <div>
        {LOGS.map((log, i) => (
          <div
            key={i}
            className="flex items-start gap-[11px] py-[11px] px-[18px] border-b border-[var(--border-1)] last:border-b-0 transition-[background] duration-[var(--trans)] hover:bg-[var(--bg-hover)]"
          >
            <div className="w-[26px] h-[26px] rounded-full shrink-0 bg-[var(--bg-muted)] border border-[var(--border-2)] flex items-center justify-center font-mono text-[9px] text-[var(--accent)]">
              AI
            </div>
            <div className="flex-1">
              <div className="font-mono text-[9px] font-bold text-[var(--accent)]">SYSTEM</div>
              <div className="font-sans text-xs text-[var(--text-2)] mt-px">{log.msg}</div>
            </div>
            <div className="font-mono text-[9px] text-[var(--text-3)] shrink-0 ml-auto">
              {log.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
