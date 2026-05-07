"use client"

const TICKERS = [
  { sym: 'GOOGL', price: '$251.38', chg: '+0.93%', up: true },
  { sym: 'AMZN', price: '$282.71', chg: '+0.38%', up: true },
  { sym: 'META', price: '$712.67', chg: '+1.21%', up: true },
  { sym: 'TSLA', price: '$314.16', chg: '-2.35%', up: false },
  { sym: 'JPM', price: '$282.30', chg: '+2.74%', up: true },
  { sym: 'NFLX', price: '$867.78', chg: '+0.31%', up: true },
  { sym: 'COIN', price: '$348.37', chg: '-1.81%', up: false },
  { sym: 'AAPL', price: '$285.22', chg: '+1.52%', up: true },
  { sym: 'MSFT', price: '$532.00', chg: '+3.79%', up: true },
  { sym: 'NVDA', price: '$1063.4', chg: '+2.08%', up: true },
]

export function TickerBar() {
  const tickerItems = [...TICKERS, ...TICKERS]

  return (
    <div className="h-[34px] bg-[var(--bg-deep)] dark:bg-[rgba(5,16,30,0.95)] border-b border-[var(--border-1)] overflow-hidden relative flex items-center">
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[var(--bg-deep)] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[var(--bg-deep)] to-transparent z-10 pointer-events-none" />
      
      <div className="flex whitespace-nowrap animate-ticker">
        {tickerItems.map((t, i) => (
          <div
            key={`${t.sym}-${i}`}
            className="flex items-center gap-1.5 px-5 border-r border-[var(--border-1)] font-mono text-[10px]"
          >
            <span className="text-[var(--text-1)] font-bold">{t.sym}</span>
            <span className="text-[var(--text-2)]">{t.price}</span>
            <span className={t.up ? 'text-[var(--green)]' : 'text-[var(--red)]'}>
              {t.up ? '▲' : '▼'}{t.chg}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
