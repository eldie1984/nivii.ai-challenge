"use client"

import { useState } from "react"

const timeframes = ["1D", "1W", "1M", "3M", "1Y"]

interface ChartProps {
  symbol: string
  companyName: string
  price: string
  change: string
  isUp: boolean
}

export function Chart({ symbol, companyName, price, change, isUp }: ChartProps) {
  const [activeTimeframe, setActiveTimeframe] = useState("1D")

  // SVG path data for chart
  const pts = [120, 118, 115, 117, 114, 116, 112, 110, 113, 111, 109, 107, 110, 108, 105, 103, 106, 104, 101, 98, 100, 95, 93, 96, 91, 88, 86, 84, 80, 76, 70, 65, 58, 50, 40, 28, 12]
  const W = 800
  const H = 150
  const n = pts.length
  
  const linePath = pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i / (n - 1)) * W},${v}`).join(' ')
  const fillPath = `${linePath} L${W},${H} L0,${H} Z`

  return (
    <div className="bg-[var(--bg-panel)] border-b border-[var(--border-1)]">
      <div className="flex justify-between items-center py-4 px-5">
        <div>
          <div className="font-heading text-xl font-bold text-[var(--text-1)]">{symbol}</div>
          <div className="font-sans text-[11px] text-[var(--text-3)]">{companyName}</div>
        </div>
        <div className="text-right">
          <div className="font-heading text-2xl font-bold text-[var(--text-1)]">{price}</div>
          <div className={`font-mono text-[11px] ${isUp ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
            {isUp ? '▲' : '▼'} {change}
          </div>
        </div>
      </div>

      <div className="flex gap-1 px-5 pb-2.5">
        {timeframes.map((tf) => (
          <button
            key={tf}
            onClick={() => setActiveTimeframe(tf)}
            className={`py-1 px-[11px] rounded font-mono text-[10px] tracking-[0.06em] border cursor-pointer transition-all duration-[var(--trans)] ${
              activeTimeframe === tf
                ? "text-[var(--accent)] border-[var(--border-acc)] bg-[var(--accent-glow)]"
                : "text-[var(--text-3)] bg-transparent border-transparent hover:text-[var(--text-2)] hover:border-[var(--border-2)]"
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      <svg className="w-full h-[170px] block px-3 pb-3" viewBox="0 0 800 150" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={fillPath} fill="url(#chartGradient)" />
        <path d={linePath} fill="none" strokeWidth="2" strokeLinejoin="round" stroke="var(--accent)" />
      </svg>
    </div>
  )
}
