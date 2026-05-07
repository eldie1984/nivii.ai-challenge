"use client"

import { useState } from "react"

const WATCH = [
  { sym: 'AAPL', name: 'Apple Inc.', price: '$285.22', chg: '+1.52%', up: true },
  { sym: 'MSFT', name: 'Microsoft Corp.', price: '$532.00', chg: '+3.79%', up: true },
  { sym: 'NVDA', name: 'NVIDIA Corp.', price: '$1063.45', chg: '+2.08%', up: true },
  { sym: 'GOOGL', name: 'Alphabet Inc.', price: '$251.38', chg: '+0.93%', up: true },
  { sym: 'AMZN', name: 'Amazon.com Inc.', price: '$282.71', chg: '+0.38%', up: true },
  { sym: 'META', name: 'Meta Platforms', price: '$712.67', chg: '+1.21%', up: true },
  { sym: 'TSLA', name: 'Tesla Inc.', price: '$314.16', chg: '-2.35%', up: false },
  { sym: 'JPM', name: 'JPMorgan Chase', price: '$282.30', chg: '+2.74%', up: true },
  { sym: 'NFLX', name: 'Netflix Inc.', price: '$867.78', chg: '+0.31%', up: true },
  { sym: 'COIN', name: 'Coinbase Global', price: '$348.37', chg: '-1.81%', up: false },
]

interface WatchlistProps {
  onSelect?: (symbol: string) => void
  showOpenTerminal?: boolean
}

export function Watchlist({ onSelect, showOpenTerminal = false }: WatchlistProps) {
  const [activeSymbol, setActiveSymbol] = useState('AAPL')

  const handleSelect = (sym: string) => {
    setActiveSymbol(sym)
    onSelect?.(sym)
  }

  return (
    <div className="w-[210px] shrink-0 bg-[var(--bg-deep)] border-r border-[var(--border-1)] flex flex-col transition-[background] duration-300">
      <div className="flex justify-between items-center py-[11px] px-3.5 border-b border-[var(--border-1)] font-mono text-[9px] tracking-[0.16em] uppercase">
        <span className="text-[var(--text-3)] flex items-center gap-1.5">
          <span className="text-[var(--accent)]">▤</span> WATCHLIST
        </span>
        <span className="text-[var(--text-3)]">{WATCH.length} symbols</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {WATCH.map((w) => (
          <div
            key={w.sym}
            onClick={() => handleSelect(w.sym)}
            className={`flex justify-between items-center py-[11px] px-3.5 border-b border-[var(--border-1)] cursor-pointer transition-[background] duration-[var(--trans)] relative ${
              activeSymbol === w.sym ? "bg-[var(--accent-glow)]" : "hover:bg-[var(--bg-hover)]"
            }`}
          >
            <div
              className={`absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--accent)] transition-opacity duration-[var(--trans)] ${
                activeSymbol === w.sym ? "opacity-100" : "opacity-0"
              }`}
            />
            <div>
              <div className="font-heading text-sm font-semibold text-[var(--text-1)]">{w.sym}</div>
              <div className="font-sans text-[10px] text-[var(--text-3)] mt-px">{w.name}</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[11px] text-[var(--text-1)]">{w.price}</div>
              <div className={`font-mono text-[10px] ${w.up ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                {w.up ? '▲' : '▼'}{w.chg}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showOpenTerminal && (
        <button className="m-3 py-3 px-2 bg-transparent border border-[var(--accent-dim)] rounded-[var(--radius)] text-[var(--accent)] font-mono text-[10px] tracking-[0.1em] cursor-pointer transition-all duration-[var(--trans)] flex items-center justify-center gap-1.5 hover:bg-[var(--accent-glow)] hover:shadow-[var(--shadow-glow)]">
          ○ OPEN TRADING TERMINAL →
        </button>
      )}
    </div>
  )
}
