"use client"

import { useState } from "react"

type InstrumentType = "stocks" | "options" | "crypto" | "bonds" | "loans" | "blocks"

interface Instrument {
  id: string
  type: InstrumentType
  symbol: string
  name: string
  market: string
  quantity: number
  avgPrice: number
  currentPrice: number
  totalValue: number
}

interface Transaction {
  id: string
  instrumentId: string
  type: "buy" | "sell"
  symbol: string
  market: string
  quantity: number
  price: number
  brokerCommission: number
  marketCommission: number
  tariffs: number
  total: number
  date: string
}

const STOCK_MARKETS = [
  { id: "NYSE", name: "New York Stock Exchange" },
  { id: "NASDAQ", name: "NASDAQ" },
  { id: "LSE", name: "London Stock Exchange" },
  { id: "TSE", name: "Tokyo Stock Exchange" },
  { id: "HKEX", name: "Hong Kong Stock Exchange" },
  { id: "SSE", name: "Shanghai Stock Exchange" },
  { id: "EURONEXT", name: "Euronext" },
  { id: "BSE", name: "Bombay Stock Exchange" },
  { id: "TSX", name: "Toronto Stock Exchange" },
  { id: "ASX", name: "Australian Securities Exchange" },
  { id: "BINANCE", name: "Binance" },
  { id: "COINBASE", name: "Coinbase" },
  { id: "OTC", name: "Over-The-Counter" },
]

const INSTRUMENT_LABELS: Record<InstrumentType, string> = {
  stocks: "Stocks",
  options: "Options",
  crypto: "Cryptocurrencies",
  bonds: "Corporate Bonds",
  loans: "Securities-Guaranteed Loans",
  blocks: "Blocks of Shares",
}

const MOCK_INSTRUMENTS: Instrument[] = [
  { id: "1", type: "stocks", symbol: "AAPL", name: "Apple Inc.", market: "NASDAQ", quantity: 50, avgPrice: 178.50, currentPrice: 287.01, totalValue: 14350.50 },
  { id: "2", type: "stocks", symbol: "MSFT", name: "Microsoft Corp.", market: "NASDAQ", quantity: 25, avgPrice: 380.00, currentPrice: 532.00, totalValue: 13300.00 },
  { id: "3", type: "crypto", symbol: "BTC", name: "Bitcoin", market: "BINANCE", quantity: 0.5, avgPrice: 42000, currentPrice: 67500, totalValue: 33750.00 },
  { id: "4", type: "crypto", symbol: "ETH", name: "Ethereum", market: "COINBASE", quantity: 5, avgPrice: 2200, currentPrice: 3450, totalValue: 17250.00 },
  { id: "5", type: "options", symbol: "AAPL 300C", name: "Apple Call $300 Jun 2025", market: "NASDAQ", quantity: 10, avgPrice: 12.50, currentPrice: 8.75, totalValue: 87.50 },
  { id: "6", type: "bonds", symbol: "MSFT-2028", name: "Microsoft Corp Bond 4.5% 2028", market: "NYSE", quantity: 10, avgPrice: 980, currentPrice: 1015, totalValue: 10150.00 },
  { id: "7", type: "loans", symbol: "SGL-001", name: "Secured Loan Portfolio A", market: "OTC", quantity: 1, avgPrice: 50000, currentPrice: 51200, totalValue: 51200.00 },
  { id: "8", type: "blocks", symbol: "NVDA-BLK", name: "NVIDIA Block Position", market: "NASDAQ", quantity: 1000, avgPrice: 890, currentPrice: 1063.45, totalValue: 1063450.00 },
]

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "t1", instrumentId: "1", type: "buy", symbol: "AAPL", market: "NASDAQ", quantity: 50, price: 178.50, brokerCommission: 9.95, marketCommission: 2.50, tariffs: 1.25, total: 8938.70, date: "2024-01-15" },
  { id: "t2", instrumentId: "3", type: "buy", symbol: "BTC", market: "BINANCE", quantity: 0.5, price: 42000, brokerCommission: 25.00, marketCommission: 0, tariffs: 15.00, total: 21040.00, date: "2024-02-20" },
  { id: "t3", instrumentId: "2", type: "buy", symbol: "MSFT", market: "NASDAQ", quantity: 25, price: 380.00, brokerCommission: 9.95, marketCommission: 2.50, tariffs: 1.25, total: 9513.70, date: "2024-03-10" },
]

export function InstrumentsScreen() {
  const [activeTab, setActiveTab] = useState<InstrumentType>("stocks")
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [transactionType, setTransactionType] = useState<"buy" | "sell">("buy")
  const [instruments, setInstruments] = useState<Instrument[]>(MOCK_INSTRUMENTS)
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS)
  
  // Transaction form state
  const [formData, setFormData] = useState({
    symbol: "",
    name: "",
    market: "",
    quantity: "",
    price: "",
    brokerCommission: "",
    marketCommission: "",
    tariffs: "",
  })

  const filteredInstruments = instruments.filter((i) => i.type === activeTab)

  const calculateTotal = () => {
    const qty = parseFloat(formData.quantity) || 0
    const price = parseFloat(formData.price) || 0
    const broker = parseFloat(formData.brokerCommission) || 0
    const market = parseFloat(formData.marketCommission) || 0
    const tariff = parseFloat(formData.tariffs) || 0
    const subtotal = qty * price
    const fees = broker + market + tariff
    return transactionType === "buy" ? subtotal + fees : subtotal - fees
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const qty = parseFloat(formData.quantity) || 0
    const price = parseFloat(formData.price) || 0
    const broker = parseFloat(formData.brokerCommission) || 0
    const market = parseFloat(formData.marketCommission) || 0
    const tariff = parseFloat(formData.tariffs) || 0

    const newTransaction: Transaction = {
      id: `t${Date.now()}`,
      instrumentId: "",
      type: transactionType,
      symbol: formData.symbol.toUpperCase(),
      market: formData.market,
      quantity: qty,
      price: price,
      brokerCommission: broker,
      marketCommission: market,
      tariffs: tariff,
      total: calculateTotal(),
      date: new Date().toISOString().split("T")[0],
    }

    setTransactions([newTransaction, ...transactions])

    // Update or add instrument
    const existingIndex = instruments.findIndex(
      (i) => i.symbol === formData.symbol.toUpperCase() && i.type === activeTab
    )

    if (existingIndex >= 0) {
      const updated = [...instruments]
      const existing = updated[existingIndex]
      if (transactionType === "buy") {
        const newQty = existing.quantity + qty
        const newAvg = (existing.avgPrice * existing.quantity + price * qty) / newQty
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          avgPrice: newAvg,
          totalValue: newQty * existing.currentPrice,
        }
      } else {
        const newQty = Math.max(0, existing.quantity - qty)
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          totalValue: newQty * existing.currentPrice,
        }
      }
      setInstruments(updated)
    } else if (transactionType === "buy") {
      const newInstrument: Instrument = {
        id: `i${Date.now()}`,
        type: activeTab,
        symbol: formData.symbol.toUpperCase(),
        name: formData.name || formData.symbol.toUpperCase(),
        market: formData.market,
        quantity: qty,
        avgPrice: price,
        currentPrice: price,
        totalValue: qty * price,
      }
      setInstruments([...instruments, newInstrument])
    }

    setShowTransactionModal(false)
    setFormData({
      symbol: "",
      name: "",
      market: "",
      quantity: "",
      price: "",
      brokerCommission: "",
      marketCommission: "",
      tariffs: "",
    })
  }

  const openTransaction = (type: "buy" | "sell", instrument?: Instrument) => {
    setTransactionType(type)
    if (instrument) {
      setFormData({
        ...formData,
        symbol: instrument.symbol,
        name: instrument.name,
        market: instrument.market,
        price: instrument.currentPrice.toString(),
      })
    } else {
      setFormData({
        symbol: "",
        name: "",
        market: "",
        quantity: "",
        price: "",
        brokerCommission: "",
        marketCommission: "",
        tariffs: "",
      })
    }
    setShowTransactionModal(true)
  }

  return (
    <div className="flex-1 overflow-auto bg-[var(--bg-root)] transition-[background] duration-300 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--text-1)] tracking-wide">
            Instrument Management
          </h1>
          <p className="font-mono text-xs text-[var(--text-3)] mt-1">
            Manage your portfolio across all asset classes
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openTransaction("buy")}
            className="bg-[var(--green)] text-white px-4 py-2 rounded-[var(--radius)] font-heading text-sm font-bold tracking-wide cursor-pointer transition-all duration-[var(--trans)] hover:shadow-[0_4px_16px_var(--green-bg)] hover:-translate-y-px"
          >
            + BUY
          </button>
          <button
            onClick={() => openTransaction("sell")}
            className="bg-[var(--red)] text-white px-4 py-2 rounded-[var(--radius)] font-heading text-sm font-bold tracking-wide cursor-pointer transition-all duration-[var(--trans)] hover:shadow-[0_4px_16px_var(--red-bg)] hover:-translate-y-px"
          >
            - SELL
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 overflow-x-auto pb-2">
        {(Object.keys(INSTRUMENT_LABELS) as InstrumentType[]).map((type) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`px-4 py-2 rounded-[var(--radius)] font-mono text-[10px] tracking-[0.1em] uppercase whitespace-nowrap cursor-pointer transition-all duration-[var(--trans)] ${
              activeTab === type
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--bg-card)] text-[var(--text-3)] border border-[var(--border-2)] hover:text-[var(--text-2)] hover:border-[var(--accent)]"
            }`}
          >
            {INSTRUMENT_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Instruments Table */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border-2)] rounded-[var(--radius-lg)] overflow-hidden mb-5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--bg-muted)] border-b border-[var(--border-1)]">
                <th className="text-left py-3 px-4 font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--text-3)]">Symbol</th>
                <th className="text-left py-3 px-4 font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--text-3)]">Name</th>
                <th className="text-left py-3 px-4 font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--text-3)]">Market</th>
                <th className="text-right py-3 px-4 font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--text-3)]">Quantity</th>
                <th className="text-right py-3 px-4 font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--text-3)]">Avg Price</th>
                <th className="text-right py-3 px-4 font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--text-3)]">Current</th>
                <th className="text-right py-3 px-4 font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--text-3)]">P/L</th>
                <th className="text-right py-3 px-4 font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--text-3)]">Total Value</th>
                <th className="text-center py-3 px-4 font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--text-3)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstruments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center font-mono text-sm text-[var(--text-3)]">
                    No {INSTRUMENT_LABELS[activeTab].toLowerCase()} in your portfolio
                  </td>
                </tr>
              ) : (
                filteredInstruments.map((instrument) => {
                  const pl = (instrument.currentPrice - instrument.avgPrice) * instrument.quantity
                  const plPercent = ((instrument.currentPrice - instrument.avgPrice) / instrument.avgPrice) * 100
                  const isProfit = pl >= 0

                  return (
                    <tr key={instrument.id} className="border-b border-[var(--border-1)] hover:bg-[var(--bg-hover)] transition-colors duration-[var(--trans)]">
                      <td className="py-3 px-4 font-mono text-sm font-bold text-[var(--accent)]">
                        {instrument.symbol}
                      </td>
                      <td className="py-3 px-4 font-sans text-sm text-[var(--text-2)]">
                        {instrument.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-[var(--text-3)]">
                        {instrument.market}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-sm text-[var(--text-1)]">
                        {instrument.quantity.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-sm text-[var(--text-2)]">
                        ${instrument.avgPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-sm text-[var(--text-1)]">
                        ${instrument.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`py-3 px-4 text-right font-mono text-sm ${isProfit ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
                        {isProfit ? "+" : ""}{pl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        <span className="text-[10px] ml-1">({isProfit ? "+" : ""}{plPercent.toFixed(2)}%)</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-sm font-bold text-[var(--text-1)]">
                        ${instrument.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => openTransaction("buy", instrument)}
                            className="px-2 py-1 rounded text-[10px] font-mono bg-[var(--green)]/20 text-[var(--green)] border border-[var(--green)]/30 cursor-pointer hover:bg-[var(--green)] hover:text-white transition-all duration-[var(--trans)]"
                          >
                            BUY
                          </button>
                          <button
                            onClick={() => openTransaction("sell", instrument)}
                            className="px-2 py-1 rounded text-[10px] font-mono bg-[var(--red)]/20 text-[var(--red)] border border-[var(--red)]/30 cursor-pointer hover:bg-[var(--red)] hover:text-white transition-all duration-[var(--trans)]"
                          >
                            SELL
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border-2)] rounded-[var(--radius-lg)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border-1)]">
          <h2 className="font-heading text-lg font-bold text-[var(--text-1)]">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--bg-muted)] border-b border-[var(--border-1)]">
                <th className="text-left py-3 px-4 font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--text-3)]">Date</th>
                <th className="text-left py-3 px-4 font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--text-3)]">Type</th>
                <th className="text-left py-3 px-4 font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--text-3)]">Symbol</th>
                <th className="text-left py-3 px-4 font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--text-3)]">Market</th>
                <th className="text-right py-3 px-4 font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--text-3)]">Qty</th>
                <th className="text-right py-3 px-4 font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--text-3)]">Price</th>
                <th className="text-right py-3 px-4 font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--text-3)]">Broker Fee</th>
                <th className="text-right py-3 px-4 font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--text-3)]">Market Fee</th>
                <th className="text-right py-3 px-4 font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--text-3)]">Tariffs</th>
                <th className="text-right py-3 px-4 font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--text-3)]">Total</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map((tx) => (
                <tr key={tx.id} className="border-b border-[var(--border-1)] hover:bg-[var(--bg-hover)] transition-colors duration-[var(--trans)]">
                  <td className="py-3 px-4 font-mono text-xs text-[var(--text-3)]">{tx.date}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      tx.type === "buy" 
                        ? "bg-[var(--green)]/20 text-[var(--green)]" 
                        : "bg-[var(--red)]/20 text-[var(--red)]"
                    }`}>
                      {tx.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-sm font-bold text-[var(--accent)]">{tx.symbol}</td>
                  <td className="py-3 px-4 font-mono text-[10px] text-[var(--text-3)]">{tx.market}</td>
                  <td className="py-3 px-4 text-right font-mono text-sm text-[var(--text-1)]">{tx.quantity}</td>
                  <td className="py-3 px-4 text-right font-mono text-sm text-[var(--text-2)]">${tx.price.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-mono text-xs text-[var(--text-3)]">${tx.brokerCommission.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-mono text-xs text-[var(--text-3)]">${tx.marketCommission.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-mono text-xs text-[var(--text-3)]">${tx.tariffs.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-mono text-sm font-bold text-[var(--text-1)]">${tx.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-panel)] border border-[var(--border-2)] rounded-[var(--radius-lg)] w-full max-w-md p-6 shadow-[var(--shadow-lg)]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-xl font-bold text-[var(--text-1)]">
                {transactionType === "buy" ? "Buy" : "Sell"} {INSTRUMENT_LABELS[activeTab]}
              </h3>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="w-8 h-8 rounded-full bg-[var(--bg-muted)] text-[var(--text-3)] flex items-center justify-center cursor-pointer hover:text-[var(--text-1)] transition-colors duration-[var(--trans)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--text-3)] mb-1">
                    Symbol *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-2)] rounded-[var(--radius)] py-2 px-3 text-[var(--text-1)] font-mono text-sm outline-none transition-all duration-[var(--trans)] focus:border-[var(--accent)]"
                    placeholder="e.g. AAPL"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--text-3)] mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-2)] rounded-[var(--radius)] py-2 px-3 text-[var(--text-1)] font-mono text-sm outline-none transition-all duration-[var(--trans)] focus:border-[var(--accent)]"
                    placeholder="Apple Inc."
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--text-3)] mb-1">
                  Stock Market / Exchange *
                </label>
                <select
                  required
                  value={formData.market}
                  onChange={(e) => setFormData({ ...formData, market: e.target.value })}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-2)] rounded-[var(--radius)] py-2 px-3 text-[var(--text-1)] font-mono text-sm outline-none transition-all duration-[var(--trans)] focus:border-[var(--accent)] cursor-pointer"
                >
                  <option value="">Select exchange...</option>
                  {STOCK_MARKETS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id} - {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--text-3)] mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    step="any"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-2)] rounded-[var(--radius)] py-2 px-3 text-[var(--text-1)] font-mono text-sm outline-none transition-all duration-[var(--trans)] focus:border-[var(--accent)]"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--text-3)] mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    required
                    step="any"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-2)] rounded-[var(--radius)] py-2 px-3 text-[var(--text-1)] font-mono text-sm outline-none transition-all duration-[var(--trans)] focus:border-[var(--accent)]"
                    placeholder="150.00"
                  />
                </div>
              </div>

              <div className="border-t border-[var(--border-1)] pt-4 mb-4">
                <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--text-3)] mb-3">
                  Fees & Commissions
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--text-3)] mb-1">
                      Broker Fee
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.brokerCommission}
                      onChange={(e) => setFormData({ ...formData, brokerCommission: e.target.value })}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-2)] rounded-[var(--radius)] py-2 px-3 text-[var(--text-1)] font-mono text-sm outline-none transition-all duration-[var(--trans)] focus:border-[var(--accent)]"
                      placeholder="9.95"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--text-3)] mb-1">
                      Market Fee
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.marketCommission}
                      onChange={(e) => setFormData({ ...formData, marketCommission: e.target.value })}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-2)] rounded-[var(--radius)] py-2 px-3 text-[var(--text-1)] font-mono text-sm outline-none transition-all duration-[var(--trans)] focus:border-[var(--accent)]"
                      placeholder="2.50"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--text-3)] mb-1">
                      Tariffs
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.tariffs}
                      onChange={(e) => setFormData({ ...formData, tariffs: e.target.value })}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-2)] rounded-[var(--radius)] py-2 px-3 text-[var(--text-1)] font-mono text-sm outline-none transition-all duration-[var(--trans)] focus:border-[var(--accent)]"
                      placeholder="1.25"
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-[var(--bg-muted)] border border-[var(--border-1)] rounded-[var(--radius)] p-3 mb-4">
                <div className="font-mono text-[8px] tracking-[0.14em] uppercase text-[var(--text-3)] mb-2">
                  Order Summary
                </div>
                <div className="flex justify-between font-mono text-xs mb-1">
                  <span className="text-[var(--text-3)]">Subtotal</span>
                  <span className="text-[var(--text-2)]">
                    ${((parseFloat(formData.quantity) || 0) * (parseFloat(formData.price) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between font-mono text-xs mb-1">
                  <span className="text-[var(--text-3)]">Total Fees</span>
                  <span className="text-[var(--text-2)]">
                    ${((parseFloat(formData.brokerCommission) || 0) + (parseFloat(formData.marketCommission) || 0) + (parseFloat(formData.tariffs) || 0)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-mono text-sm font-bold pt-1 border-t border-[var(--border-1)]">
                  <span className="text-[var(--text-1)]">Total</span>
                  <span className={transactionType === "buy" ? "text-[var(--green)]" : "text-[var(--red)]"}>
                    ${calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3 border-none rounded-[var(--radius)] font-heading text-base font-bold tracking-[0.08em] uppercase cursor-pointer transition-all duration-[var(--trans)] ${
                  transactionType === "buy"
                    ? "bg-[var(--green)] text-white hover:shadow-[0_4px_16px_var(--green-bg)]"
                    : "bg-[var(--red)] text-white hover:shadow-[0_4px_16px_var(--red-bg)]"
                }`}
              >
                CONFIRM {transactionType.toUpperCase()}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
