"use client"

import { useState } from "react"
import { ThemeToggle } from "../components/theme-toggle"
import { LoginScreen } from "../components/screens/login-screen"
import { TopNav } from "../components/top-nav"
import { PortfolioScreen } from "../components/screens/portfolio-screen"
import { TerminalScreen } from "../components/screens/terminal-screen"
import { InstrumentsScreen } from "../components/screens/instruments-screen"
import { PreferencesScreen } from "../components/screens/preferences-screen"
import { TickerBar } from "../components/ticker-bar"
import { AuthProvider, useAuth } from "../hooks/use-auth"

type Screen = "portfolio" | "terminal" | "instruments" | "preferences"

function TradingTerminalContent() {
  const { user, isAuthenticated, logout } = useAuth()
  const [activeScreen, setActiveScreen] = useState<Screen>("portfolio")

  if (!isAuthenticated) {
    return (
      <>
        <ThemeToggle />
        <LoginScreen />
      </>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <ThemeToggle />
      
      {/* Ticker Bar */}
      <TickerBar />
      
      {/* Top Navigation */}
      <TopNav 
        activeScreen={activeScreen} 
        onScreenChange={setActiveScreen}
        onLogout={logout}
        userEmail={user?.email || ""}
      />
      
      {/* Screen Content */}
      {activeScreen === "portfolio" && <PortfolioScreen />}
      {activeScreen === "terminal" && <TerminalScreen />}
      {activeScreen === "instruments" && <InstrumentsScreen />}
      {activeScreen === "preferences" && <PreferencesScreen />}
    </div>
  )
}

export default function TradingTerminal() {
  return (
    <AuthProvider>
      <TradingTerminalContent />
    </AuthProvider>
  )
}
