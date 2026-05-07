"use client"

import { Watchlist } from "@/components/watchlist"
import { PortfolioHero } from "@/components/portfolio/portfolio-hero"
import { StatsGrid } from "@/components/portfolio/stats-grid"
import { HoldingsTable } from "@/components/portfolio/holdings-table"
import { ActivityLog } from "@/components/portfolio/activity-log"
import { SignalsPanel } from "@/components/portfolio/signals-panel"

export function PortfolioScreen() {
  return (
    <div className="flex flex-1 min-h-0">
      {/* Sidebar */}
      <div className="hidden md:block">
        <Watchlist showOpenTerminal />
      </div>

      {/* Main */}
      <div className="flex-1 overflow-auto bg-[var(--bg-root)] transition-[background] duration-300 p-5">
        <div className="font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--text-3)] flex items-center gap-2.5 mb-3.5">
          <span className="text-[var(--accent)]">◆</span> TOTAL PORTFOLIO VALUE
          <span className="flex-1 h-px bg-[var(--border-1)]" />
        </div>

        <PortfolioHero />
        <StatsGrid />
        <HoldingsTable />
        <ActivityLog />
      </div>

      {/* Right Panel */}
      <div className="hidden lg:flex w-[270px] shrink-0 border-l border-[var(--border-1)] bg-[var(--bg-deep)] flex-col transition-[background] duration-300">
        <SignalsPanel />
      </div>
    </div>
  )
}
