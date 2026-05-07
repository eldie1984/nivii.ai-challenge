"use client"

import { useState } from "react"
import { useAuth } from "../../hooks/use-auth"

interface LoginScreenProps {
  onLogin?: (email: string) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState<"signin" | "create">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [error, setError] = useState("")
  
  const { login, register, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    try {
      if (activeTab === "signin") {
        await login(email, password)
      } else {
        await register(email, password, firstName, lastName)
      }
      
      if (onLogin) {
        onLogin(email)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-root)] bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,var(--accent-glow)_0%,transparent_70%)] transition-[background] duration-300">
      <div className="w-[380px] bg-[var(--bg-panel)] border border-[var(--border-2)] dark:border-dashed dark:border-[var(--border-acc)] rounded-[var(--radius-lg)] p-[38px_34px] shadow-[var(--shadow-md)]">
        <div className="text-center mb-7">
          <h1 className="font-heading text-[34px] font-bold tracking-[0.08em] text-[var(--text-1)]">
            TRADING
          </h1>
          <div className="font-mono text-[10px] tracking-[0.24em] text-[var(--text-2)] mt-0.5">
            TERMINAL
          </div>
          <div className="font-mono text-[9px] tracking-[0.16em] text-[var(--text-3)] mt-[5px]">
            ALGORITHMIC TRADING PLATFORM
          </div>
        </div>

        <div className="flex mb-[22px] border-b border-[var(--border-1)]">
          <button
            type="button"
            onClick={() => setActiveTab("signin")}
            className={`flex-1 text-center py-2.5 font-sans text-sm cursor-pointer border-b-2 transition-all duration-[var(--trans)] ${
              activeTab === "signin"
                ? "text-[var(--text-1)] border-[var(--text-1)]"
                : "text-[var(--text-3)] border-transparent hover:text-[var(--text-2)]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("create")}
            className={`flex-1 text-center py-2.5 font-sans text-sm cursor-pointer border-b-2 transition-all duration-[var(--trans)] ${
              activeTab === "create"
                ? "text-[var(--text-1)] border-[var(--text-1)]"
                : "text-[var(--text-3)] border-transparent hover:text-[var(--text-2)]"
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-3.5 p-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {activeTab === "create" && (
            <>
              <div className="mb-3.5">
                <label className="block font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--text-2)] mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-2)] rounded-[var(--radius)] py-[11px] px-[13px] text-[var(--text-1)] font-sans text-sm outline-none transition-all duration-[var(--trans)] placeholder:text-[var(--text-3)] focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_var(--accent-glow2)]"
                />
              </div>

              <div className="mb-3.5">
                <label className="block font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--text-2)] mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-2)] rounded-[var(--radius)] py-[11px] px-[13px] text-[var(--text-1)] font-sans text-sm outline-none transition-all duration-[var(--trans)] placeholder:text-[var(--text-3)] focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_var(--accent-glow2)]"
                />
              </div>
            </>
          )}

          <div className="mb-3.5">
            <label className="block font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--text-2)] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-[var(--bg-input)] border border-[var(--border-2)] rounded-[var(--radius)] py-[11px] px-[13px] text-[var(--text-1)] font-sans text-sm outline-none transition-all duration-[var(--trans)] placeholder:text-[var(--text-3)] focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_var(--accent-glow2)]"
            />
          </div>

          <div className="mb-3.5">
            <label className="block font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--text-2)] mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-[var(--bg-input)] border border-[var(--border-2)] rounded-[var(--radius)] py-[11px] px-[13px] text-[var(--text-1)] font-sans text-sm outline-none transition-all duration-[var(--trans)] placeholder:text-[var(--text-3)] focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_var(--accent-glow2)]"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-[var(--accent)] border-none rounded-[var(--radius)] py-[13px] text-white font-heading text-base font-bold tracking-[0.06em] cursor-pointer transition-all duration-[var(--trans)] mt-1.5 flex items-center justify-center gap-2 hover:shadow-[var(--shadow-glow)] hover:-translate-y-px disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none"
          >
            {isLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>{activeTab === "signin" ? "Sign In" : "Create Account"} →</>
            )}
          </button>
        </form>

        <div className="font-mono text-[9px] text-[var(--text-3)] text-center mt-3.5">
          Secure authentication with PostgreSQL and Redis
        </div>
      </div>
    </div>
  )
}
