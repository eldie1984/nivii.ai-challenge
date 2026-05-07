"use client"

const OB_ASKS = [
  { p: '$287.75', s: '1,723', t: '10.7K' },
  { p: '$287.65', s: '1,589', t: '9.0K' },
  { p: '$287.57', s: '1,877', t: '7.4K' },
  { p: '$287.48', s: '884', t: '5.5K' },
  { p: '$287.39', s: '549', t: '4.6K' },
  { p: '$287.26', s: '2,086', t: '4.1K' },
  { p: '$287.15', s: '1,228', t: '2.0K' },
  { p: '$287.08', s: '763', t: '0.7K' },
]

const OB_BIDS = [
  { p: '$286.84', s: '1,064', t: '2.2K' },
  { p: '$286.73', s: '2,458', t: '4.7K' },
  { p: '$286.64', s: '1,684', t: '6.3K' },
  { p: '$286.56', s: '662', t: '7.0K' },
  { p: '$286.46', s: '2,373', t: '9.4K' },
  { p: '$286.34', s: '1,040', t: '10.4K' },
  { p: '$286.26', s: '840', t: '11.3K' },
]

export function OrderBook() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex justify-between items-center py-2.5 px-3.5 border-b border-[var(--border-1)] font-mono text-[9px] tracking-[0.14em]">
        <span className="text-[var(--text-3)] uppercase">□ ORDER BOOK</span>
        <span className="text-[var(--accent)]">AAPL</span>
      </div>

      <div className="py-1 px-3.5 font-mono text-[10px] text-[var(--text-2)] flex justify-between">
        <span>SPREAD <span className="text-[var(--text-1)]">$0.118</span></span>
        <span className="text-[var(--accent)]">$287.01</span>
      </div>

      <div className="grid grid-cols-3 py-[5px] px-3.5 font-mono text-[9px] text-[var(--text-3)] tracking-[0.08em]">
        <span>PRICE</span>
        <span className="text-right">SIZE</span>
        <span className="text-right">TOTAL</span>
      </div>

      {/* Asks */}
      {OB_ASKS.map((r, i) => (
        <div
          key={`ask-${i}`}
          className="grid grid-cols-3 py-[3px] px-3.5 font-mono text-[10px] relative cursor-pointer transition-[background] duration-[var(--trans)] hover:bg-[var(--bg-hover)]"
        >
          <div
            className="absolute top-0 bottom-0 right-0 bg-[var(--red)] opacity-10 pointer-events-none"
            style={{ width: `${25 + i * 9}%` }}
          />
          <span className="relative z-[1] text-[var(--red)]">{r.p}</span>
          <span className="relative z-[1] text-right text-[var(--text-2)]">{r.s}</span>
          <span className="relative z-[1] text-right text-[var(--text-2)]">{r.t}</span>
        </div>
      ))}

      {/* Spread bar */}
      <div className="flex items-center justify-center gap-2.5 py-1.5 px-3.5 bg-[var(--bg-muted)] border-y border-[var(--border-1)] font-mono text-[10px]">
        <span className="text-[var(--text-3)] text-[9px] tracking-[0.1em] uppercase">SPREAD</span>
        <span className="text-[var(--text-1)]">$0.118</span>
        <span className="text-[13px] font-bold text-[var(--red)]">▼ $286.96</span>
        <span className="font-mono text-[8px] text-[var(--text-3)]">DOWNTICK</span>
      </div>

      {/* Bids */}
      {OB_BIDS.map((r, i) => (
        <div
          key={`bid-${i}`}
          className="grid grid-cols-3 py-[3px] px-3.5 font-mono text-[10px] relative cursor-pointer transition-[background] duration-[var(--trans)] hover:bg-[var(--bg-hover)]"
        >
          <div
            className="absolute top-0 bottom-0 right-0 bg-[var(--green)] opacity-10 pointer-events-none"
            style={{ width: `${20 + i * 11}%` }}
          />
          <span className="relative z-[1] text-[var(--green)]">{r.p}</span>
          <span className="relative z-[1] text-right text-[var(--text-2)]">{r.s}</span>
          <span className="relative z-[1] text-right text-[var(--text-2)]">{r.t}</span>
        </div>
      ))}

      {/* Imbalance */}
      <div className="flex items-center gap-2 py-1.5 px-3.5">
        <span className="font-mono text-[9px] text-[var(--green)]">51% BID</span>
        <div className="flex-1 h-[3px] bg-[var(--bg-muted)] rounded-[3px] overflow-hidden flex">
          <div className="bg-[var(--green)]" style={{ width: '51%' }} />
          <div className="bg-[var(--red)]" style={{ width: '49%' }} />
        </div>
        <span className="font-mono text-[9px] text-[var(--red)]">49% ASK</span>
      </div>
    </div>
  )
}
