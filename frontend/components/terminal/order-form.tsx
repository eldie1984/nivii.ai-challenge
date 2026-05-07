"use client"

import { useState } from "react"

export function OrderForm() {
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy")
  const [symbol, setSymbol] = useState("AAPL")
  const [quantity, setQuantity] = useState("10")
  const [type, setType] = useState("MARKET")

  return (
    <div className="p-3.5 border-b border-[var(--border-1)]">
      <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--text-3)] mb-1">
        Available Cash
      </div>
      <div className="font-heading text-lg font-bold text-[var(--text-1)] mb-3.5">
        $50,000.00
      </div>

      <div className="flex gap-px rounded-[var(--radius)] overflow-hidden mb-3.5">
        <button
          onClick={() => setOrderType("buy")}
          className={`flex-1 py-[9px] text-center font-heading text-sm font-bold tracking-[0.06em] border-none cursor-pointer transition-all duration-[var(--trans)] ${
            orderType === "buy"
              ? "bg-[var(--green)] text-white"
              : "bg-[var(--bg-muted)] text-[var(--text-3)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-2)]"
          }`}
        >
          BUY
        </button>
        <button
          onClick={() => setOrderType("sell")}
          className={`flex-1 py-[9px] text-center font-heading text-sm font-bold tracking-[0.06em] border-none cursor-pointer transition-all duration-[var(--trans)] ${
            orderType === "sell"
              ? "bg-[var(--red)] text-white"
              : "bg-[var(--bg-muted)] text-[var(--text-3)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-2)]"
          }`}
        >
          SELL
        </button>
      </div>

      <div className="font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--text-3)] mb-[5px]">
        Symbol
      </div>
      <input
        type="text"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        className="w-full bg-[var(--bg-input)] border border-[var(--border-2)] rounded-[var(--radius)] py-[9px] px-[11px] text-[var(--text-1)] font-mono text-xs outline-none transition-all duration-[var(--trans)] mb-2.5 focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_var(--accent-glow2)]"
      />

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <div className="font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--text-3)] mb-[5px]">
            Quantity
          </div>
          <input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-[var(--bg-input)] border border-[var(--border-2)] rounded-[var(--radius)] py-[9px] px-[11px] text-[var(--text-1)] font-mono text-xs outline-none transition-all duration-[var(--trans)] mb-2.5 focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_var(--accent-glow2)]"
          />
        </div>
        <div>
          <div className="font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--text-3)] mb-[5px]">
            Type
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-[var(--bg-input)] border border-[var(--border-2)] rounded-[var(--radius)] py-[9px] px-[11px] pr-7 text-[var(--text-1)] font-mono text-[11px] outline-none cursor-pointer appearance-none mb-2.5 transition-[border-color] duration-[var(--trans)] focus:border-[var(--accent)] bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%279%27%20height%3D%275%27%3E%3Cpath%20d%3D%27M0%200l4.5%205L9%200z%27%20fill%3D%27%236fa8cc%27%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_9px_center]"
          >
            <option>MARKET</option>
            <option>LIMIT</option>
          </select>
        </div>
      </div>

      <div className="bg-[var(--bg-muted)] border border-[var(--border-1)] rounded-[var(--radius)] p-[10px_12px] mb-3">
        <div className="font-mono text-[8px] tracking-[0.14em] uppercase text-[var(--text-3)] mb-[7px]">
          ORDER COST PREVIEW
        </div>
        <div className="flex justify-between font-mono text-[10px] mb-1">
          <span className="text-[var(--text-3)]">Commission</span>
          <span className="text-[var(--text-2)]">$6.50</span>
        </div>
        <div className="flex justify-between font-mono text-[10px] mb-1">
          <span className="text-[var(--text-3)]">Slippage est.</span>
          <span className="text-[var(--text-2)]">$0.86</span>
        </div>
        <div className="flex justify-between font-mono text-xs">
          <span className="text-[var(--text-1)]">Net Cost</span>
          <span className="text-[var(--text-1)]">$2,877.46</span>
        </div>
      </div>

      <button
        className={`w-full py-[13px] border-none rounded-[var(--radius)] font-heading text-[15px] font-bold tracking-[0.08em] uppercase cursor-pointer transition-all duration-[var(--trans)] ${
          orderType === "buy"
            ? "bg-[var(--green)] text-white hover:shadow-[0_4px_16px_var(--green-bg)] hover:-translate-y-px"
            : "bg-[var(--red)] text-white hover:shadow-[0_4px_16px_var(--red-bg)] hover:-translate-y-px"
        }`}
      >
        PLACE {orderType.toUpperCase()} ORDER
      </button>
    </div>
  )
}
