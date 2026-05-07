"use client"

import { useEffect, useState } from "react"

type Screen = "portfolio" | "terminal" | "instruments" | "preferences"

interface TopNavProps {
  activeScreen: Screen
  onScreenChange: (screen: Screen) => void
  onLogout?: () => void
  userEmail?: string
}

const navItems: { id: Screen; label: string }[] = [
  { id: "portfolio", label: "PORTFOLIO" },
  { id: "terminal", label: "TRADING" },
  { id: "instruments", label: "INSTRUMENTS" },
]

export function TopNav({ activeScreen, onScreenChange, onLogout, userEmail }: TopNavProps) {
  const [time, setTime] = useState("")

  useEffect(() => {
    const tick = () => {
      setTime(new Date().toTimeString().slice(0, 8))
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <nav className="h-[52px] bg-[var(--bg-deep)] border-b border-[var(--border-1)] flex items-center px-5 sticky top-0 z-[500] shadow-[var(--shadow-sm)] transition-[background] duration-300">
      <div className="font-heading text-xl font-bold tracking-wide text-[var(--text-1)] mr-7 flex items-center gap-0.5 shrink-0">
        TRADING <em className="text-[var(--accent)] not-italic">TERMINAL</em>
      </div>

      <div className="flex items-stretch flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onScreenChange(item.id)}
            className={`flex items-center gap-[7px] px-[18px] h-[52px] font-mono text-[10px] tracking-[0.12em] uppercase cursor-pointer border-b-2 transition-all duration-[var(--trans)] ${
              activeScreen === item.id
                ? "text-[var(--accent)] border-[var(--accent)] bg-[var(--accent-glow)]"
                : "text-[var(--text-3)] border-transparent hover:text-[var(--text-2)] hover:bg-[var(--bg-hover)]"
            }`}
          >
            <span
              className={`w-[5px] h-[5px] rounded-full bg-current transition-all duration-[var(--trans)] ${
                activeScreen === item.id ? "opacity-100 shadow-[0_0_5px_currentColor]" : "opacity-50"
              }`}
            />
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3.5 ml-auto shrink-0">
        <div className="flex items-center gap-[5px] font-mono text-[10px] text-[var(--green)]">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--green)] shadow-[0_0_6px_var(--green)] animate-pulse-dot" />
          LIVE
        </div>
        <div className="font-mono text-[11px] text-[var(--text-2)] tracking-[0.1em]">{time}</div>
        <button
          onClick={() => onScreenChange("preferences")}
          className="bg-[var(--bg-card)] border border-[var(--border-2)] text-[var(--accent)] py-[3px] px-2.5 rounded font-mono text-[10px] tracking-[0.06em] cursor-pointer transition-all duration-[var(--trans)] hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)]"
        >
          {userEmail || "Guest"}
        </button>
        {onLogout && (
          <button
            onClick={onLogout}
            className="bg-transparent border border-[var(--border-2)] text-[var(--text-2)] py-[3px] px-2.5 rounded font-mono text-[10px] tracking-[0.06em] cursor-pointer transition-all duration-[var(--trans)] hover:text-[var(--red)] hover:border-[var(--red)]"
          >
            LOGOUT
          </button>
        )}
      </div>
    </nav>
  )
}
