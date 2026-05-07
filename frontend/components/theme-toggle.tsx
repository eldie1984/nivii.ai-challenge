"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="fixed bottom-7 right-7 z-[9999] w-[52px] h-7 bg-[var(--bg-card)] border border-[var(--border-2)] rounded-[20px] cursor-pointer flex items-center p-[3px] shadow-[var(--shadow-md)] transition-all duration-[var(--trans)] hover:border-[var(--accent)] hover:shadow-[var(--shadow-glow)]"
      title="Toggle theme"
    >
      <span className="absolute bottom-[calc(100%+8px)] right-0 font-mono text-[9px] tracking-[0.12em] text-[var(--text-3)] whitespace-nowrap uppercase">
        {isDark ? "DARK" : "LIGHT"}
      </span>
      <div
        className={`w-5 h-5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent-glow2)] transition-transform duration-300 flex items-center justify-center text-[11px] ${
          isDark ? "translate-x-0" : "translate-x-6"
        }`}
      >
        {isDark ? "🌙" : "☀️"}
      </div>
    </button>
  )
}
