"use client"

import { useState } from "react"
import { Watchlist } from "@/components/watchlist"
import { Chart } from "@/components/terminal/chart"
import { AgentPanel } from "@/components/terminal/agent-panel"
import { OrderForm } from "@/components/terminal/order-form"
import { OrderBook } from "@/components/terminal/order-book"

const STOCK_DATA: Record<string, { name: string; price: string; change: string; isUp: boolean }> = {
  AAPL: { name: "Apple Inc.", price: "$287.01", change: "+1.32%", isUp: true },
  MSFT: { name: "Microsoft Corp.", price: "$532.00", change: "+3.79%", isUp: true },
  NVDA: { name: "NVIDIA Corp.", price: "$1063.45", change: "+2.08%", isUp: true },
  GOOGL: { name: "Alphabet Inc.", price: "$251.38", change: "+0.93%", isUp: true },
  AMZN: { name: "Amazon.com Inc.", price: "$282.71", change: "+0.38%", isUp: true },
  META: { name: "Meta Platforms", price: "$712.67", change: "+1.21%", isUp: true },
  TSLA: { name: "Tesla Inc.", price: "$314.16", change: "-2.35%", isUp: false },
  JPM: { name: "JPMorgan Chase", price: "$282.30", change: "+2.74%", isUp: true },
  NFLX: { name: "Netflix Inc.", price: "$867.78", change: "+0.31%", isUp: true },
  COIN: { name: "Coinbase Global", price: "$348.37", change: "-1.81%", isUp: false },
}

export function TerminalScreen() {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL")
  const stockData = STOCK_DATA[selectedSymbol] || STOCK_DATA.AAPL

  return (
    <div className="flex flex-1 min-h-0">
      {/* Sidebar */}
      <div className="hidden md:block">
        <Watchlist onSelect={setSelectedSymbol} />
      </div>

      {/* Main: Chart + Agent */}
      <div className="flex-1 overflow-auto bg-[var(--bg-root)] transition-[background] duration-300 flex flex-col">
        <Chart
          symbol={selectedSymbol}
          companyName={stockData.name}
          price={stockData.price}
          change={stockData.change}
          isUp={stockData.isUp}
        />
        <div className="flex-1 p-3.5">
          <AgentPanel symbol={selectedSymbol} />
        </div>
      </div>

      {/* Right: Order Form + Book */}
      <div className="hidden lg:flex w-[270px] shrink-0 border-l border-[var(--border-1)] bg-[var(--bg-deep)] flex-col overflow-y-auto transition-[background] duration-300">
        <OrderForm />
        <OrderBook />
      </div>
    </div>
  )
}
