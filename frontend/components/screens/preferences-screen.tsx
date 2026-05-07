"use client"

import { useState } from "react"
import { useTheme } from "next-themes"

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn)
  
  return (
    <button
      onClick={() => setOn(!on)}
      className={`w-[38px] h-[21px] rounded-[20px] border cursor-pointer relative transition-all duration-[var(--trans)] ${
        on
          ? "bg-[var(--accent-glow2)] border-[var(--accent)]"
          : "bg-[var(--bg-muted)] border-[var(--border-2)]"
      }`}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-[15px] h-[15px] rounded-full transition-all duration-250 ${
          on
            ? "bg-[var(--accent)] translate-x-[17px] shadow-[0_0_6px_var(--accent)]"
            : "bg-[var(--text-3)] translate-x-0"
        }`}
      />
    </button>
  )
}

function Segmented({ options, defaultValue }: { options: string[]; defaultValue: string }) {
  const [selected, setSelected] = useState(defaultValue)
  
  return (
    <div className="flex gap-0.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => setSelected(opt)}
          className={`py-1.5 px-3 font-mono text-[9px] tracking-[0.08em] uppercase cursor-pointer rounded transition-all duration-[var(--trans)] ${
            selected === opt
              ? "bg-[var(--accent)] text-white border-[var(--accent)] font-bold"
              : "bg-[var(--bg-muted)] border border-[var(--border-1)] text-[var(--text-3)] hover:text-[var(--text-2)] hover:border-[var(--border-2)]"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

function ThemeSegmented() {
  const { theme, setTheme } = useTheme()
  
  return (
    <div className="flex gap-0.5">
      <button
        onClick={() => setTheme("dark")}
        className={`py-1.5 px-3 font-mono text-[9px] tracking-[0.08em] uppercase cursor-pointer rounded transition-all duration-[var(--trans)] ${
          theme === "dark"
            ? "bg-[var(--accent)] text-white border-[var(--accent)] font-bold"
            : "bg-[var(--bg-muted)] border border-[var(--border-1)] text-[var(--text-3)] hover:text-[var(--text-2)] hover:border-[var(--border-2)]"
        }`}
      >
        CYBER
      </button>
      <button
        onClick={() => setTheme("light")}
        className={`py-1.5 px-3 font-mono text-[9px] tracking-[0.08em] uppercase cursor-pointer rounded transition-all duration-[var(--trans)] ${
          theme === "light"
            ? "bg-[var(--accent)] text-white border-[var(--accent)] font-bold"
            : "bg-[var(--bg-muted)] border border-[var(--border-1)] text-[var(--text-3)] hover:text-[var(--text-2)] hover:border-[var(--border-2)]"
        }`}
      >
        MINIMAL
      </button>
    </div>
  )
}

export function PreferencesScreen() {
  return (
    <div className="p-8 bg-[var(--bg-root)] transition-[background] duration-300">
      <div className="flex justify-between items-start mb-7">
        <div>
          <div className="font-heading text-[32px] font-bold text-[var(--text-1)] mb-1.5">
            Preferences
          </div>
          <div className="font-mono text-[9px] tracking-[0.14em] text-[var(--text-3)]">
            ○ Trader profile · risk · notifications · session
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[9px] text-[var(--text-3)]">Signed in as</div>
          <div className="font-mono text-[11px] text-[var(--accent)]">verifier@test.com</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[18px]">
        {/* Profile */}
        <div className="bg-[var(--bg-panel)] border border-[var(--border-1)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-2 py-3 px-[18px] border-b border-[var(--border-1)]">
            <span className="text-[var(--accent)] text-[13px]">▤</span>
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--text-2)]">Profile</span>
          </div>
          <div className="font-sans text-[11px] text-[var(--text-3)] py-2 px-[18px]">
            Your trader identity, shown in headers and activity logs.
          </div>
          
          <div className="flex justify-between items-center py-[13px] px-[18px] border-b border-[var(--border-1)]">
            <div>
              <div className="font-sans text-[13px] text-[var(--text-1)] font-medium mb-0.5">Display name</div>
              <div className="font-mono text-[9px] text-[var(--text-3)] tracking-[0.04em]">How you appear in the app</div>
            </div>
            <input
              type="text"
              defaultValue="Verifier"
              className="bg-[var(--bg-input)] border border-[var(--border-2)] rounded-[var(--radius)] py-[7px] px-2.5 text-[var(--text-1)] font-mono text-[11px] w-[130px] outline-none transition-all duration-[var(--trans)] focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_var(--accent-glow2)]"
            />
          </div>
          
          <div className="flex justify-between items-center py-[13px] px-[18px] border-b border-[var(--border-1)]">
            <div>
              <div className="font-sans text-[13px] text-[var(--text-1)] font-medium mb-0.5">Base currency</div>
              <div className="font-mono text-[9px] text-[var(--text-3)] tracking-[0.04em]">All values in this currency</div>
            </div>
            <select className="bg-[var(--bg-input)] border border-[var(--border-2)] rounded-[var(--radius)] py-[7px] px-2.5 pr-[26px] text-[var(--text-1)] font-mono text-[10px] outline-none cursor-pointer appearance-none transition-[border-color] duration-[var(--trans)] focus:border-[var(--accent)] bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%279%27%20height%3D%275%27%3E%3Cpath%20d%3D%27M0%200l4.5%205L9%200z%27%20fill%3D%27%236fa8cc%27%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center]">
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
            </select>
          </div>
          
          <div className="flex justify-between items-center py-[13px] px-[18px]">
            <div>
              <div className="font-sans text-[13px] text-[var(--text-1)] font-medium mb-0.5">Theme</div>
              <div className="font-mono text-[9px] text-[var(--text-3)] tracking-[0.04em]">Visual density of the terminal</div>
            </div>
            <ThemeSegmented />
          </div>
        </div>

        {/* Trading */}
        <div className="bg-[var(--bg-panel)] border border-[var(--border-1)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-2 py-3 px-[18px] border-b border-[var(--border-1)]">
            <span className="text-[var(--accent)] text-[13px]">○</span>
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--text-2)]">Trading</span>
          </div>
          <div className="font-sans text-[11px] text-[var(--text-3)] py-2 px-[18px]">
            Defaults applied to the order entry form.
          </div>
          
          <div className="flex justify-between items-center py-[13px] px-[18px] border-b border-[var(--border-1)]">
            <div>
              <div className="font-sans text-[13px] text-[var(--text-1)] font-medium mb-0.5">Risk tolerance</div>
              <div className="font-mono text-[9px] text-[var(--text-3)] tracking-[0.04em]">Influences agent suggestions</div>
            </div>
            <Segmented options={["CONSERVATIVE", "MODERATE", "AGGRESSIVE"]} defaultValue="MODERATE" />
          </div>
          
          <div className="flex justify-between items-center py-[13px] px-[18px] border-b border-[var(--border-1)]">
            <div>
              <div className="font-sans text-[13px] text-[var(--text-1)] font-medium mb-0.5">Default order type</div>
              <div className="font-mono text-[9px] text-[var(--text-3)] tracking-[0.04em]">Pre-selected on order entry</div>
            </div>
            <select className="bg-[var(--bg-input)] border border-[var(--border-2)] rounded-[var(--radius)] py-[7px] px-2.5 pr-[26px] text-[var(--text-1)] font-mono text-[10px] outline-none cursor-pointer appearance-none transition-[border-color] duration-[var(--trans)] focus:border-[var(--accent)] bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%279%27%20height%3D%275%27%3E%3Cpath%20d%3D%27M0%200l4.5%205L9%200z%27%20fill%3D%27%236fa8cc%27%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center]">
              <option>MARKET</option>
              <option>LIMIT</option>
            </select>
          </div>
          
          <div className="flex justify-between items-center py-[13px] px-[18px] border-b border-[var(--border-1)]">
            <div>
              <div className="font-sans text-[13px] text-[var(--text-1)] font-medium mb-0.5">Default quantity</div>
              <div className="font-mono text-[9px] text-[var(--text-3)] tracking-[0.04em]">Shares pre-filled in orders</div>
            </div>
            <input
              type="text"
              defaultValue="10"
              className="bg-[var(--bg-input)] border border-[var(--border-2)] rounded-[var(--radius)] py-[7px] px-2.5 text-[var(--text-1)] font-mono text-[11px] w-20 outline-none transition-all duration-[var(--trans)] focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_var(--accent-glow2)]"
            />
          </div>
          
          <div className="flex justify-between items-center py-[13px] px-[18px] border-b border-[var(--border-1)]">
            <div>
              <div className="font-sans text-[13px] text-[var(--text-1)] font-medium mb-0.5">Confirm before submit</div>
              <div className="font-mono text-[9px] text-[var(--text-3)] tracking-[0.04em]">Show dialog before placing</div>
            </div>
            <Toggle defaultOn />
          </div>
          
          <div className="flex justify-between items-center py-[13px] px-[18px]">
            <div>
              <div className="font-sans text-[13px] text-[var(--text-1)] font-medium mb-0.5">Auto-analyze on select</div>
              <div className="font-mono text-[9px] text-[var(--text-3)] tracking-[0.04em]">Run agent on symbol pick</div>
            </div>
            <Toggle />
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-[var(--bg-panel)] border border-[var(--border-1)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-2 py-3 px-[18px] border-b border-[var(--border-1)]">
            <span className="text-[var(--accent)] text-[13px]">◆</span>
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--text-2)]">Notifications</span>
          </div>
          <div className="font-sans text-[11px] text-[var(--text-3)] py-2 px-[18px]">
            What you want to be told about.
          </div>
          
          <div className="flex justify-between items-center py-[13px] px-[18px] border-b border-[var(--border-1)]">
            <div>
              <div className="font-sans text-[13px] text-[var(--text-1)] font-medium mb-0.5">Agent signals</div>
              <div className="font-mono text-[9px] text-[var(--text-3)] tracking-[0.04em]">Alert on new BUY/SELL signal</div>
            </div>
            <Toggle defaultOn />
          </div>
          
          <div className="flex justify-between items-center py-[13px] px-[18px]">
            <div>
              <div className="font-sans text-[13px] text-[var(--text-1)] font-medium mb-0.5">Order fills</div>
              <div className="font-mono text-[9px] text-[var(--text-3)] tracking-[0.04em]">Alert when order executes</div>
            </div>
            <Toggle defaultOn />
          </div>
        </div>

        {/* Session */}
        <div className="bg-[var(--bg-panel)] border border-[var(--border-1)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-2 py-3 px-[18px] border-b border-[var(--border-1)]">
            <span className="text-[var(--accent)] text-[13px]">□</span>
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-[var(--text-2)]">Session &amp; Security</span>
          </div>
          <div className="font-sans text-[11px] text-[var(--text-3)] py-2 px-[18px]">
            Manage your active session.
          </div>
          
          <div className="flex justify-between items-center py-[13px] px-[18px] border-b border-[var(--border-1)]">
            <div>
              <div className="font-sans text-[13px] text-[var(--text-1)] font-medium mb-0.5">Session timeout</div>
              <div className="font-mono text-[9px] text-[var(--text-3)] tracking-[0.04em]">Auto sign-out after inactivity</div>
            </div>
            <select className="bg-[var(--bg-input)] border border-[var(--border-2)] rounded-[var(--radius)] py-[7px] px-2.5 pr-[26px] text-[var(--text-1)] font-mono text-[10px] outline-none cursor-pointer appearance-none transition-[border-color] duration-[var(--trans)] focus:border-[var(--accent)] bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%279%27%20height%3D%275%27%3E%3Cpath%20d%3D%27M0%200l4.5%205L9%200z%27%20fill%3D%27%236fa8cc%27%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center]">
              <option>1 hour</option>
              <option>4 hours</option>
              <option>Never</option>
            </select>
          </div>
          
          <div className="flex justify-between items-center py-[13px] px-[18px]">
            <div>
              <div className="font-sans text-[13px] text-[var(--text-1)] font-medium mb-0.5">Sign out</div>
              <div className="font-mono text-[9px] text-[var(--text-3)] tracking-[0.04em]">End session on this device</div>
            </div>
            <button className="py-[7px] px-4 bg-transparent border border-[var(--red-dim)] rounded-[var(--radius)] text-[var(--red)] font-mono text-[10px] tracking-[0.1em] cursor-pointer font-bold transition-all duration-[var(--trans)] hover:bg-[var(--red-bg)]">
              SIGN OUT
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2.5 justify-end pt-5">
        <button className="py-[11px] px-[22px] bg-transparent border border-[var(--border-2)] rounded-[var(--radius)] text-[var(--text-2)] font-heading text-sm font-semibold tracking-[0.06em] cursor-pointer transition-all duration-[var(--trans)] hover:border-[var(--border-3)] hover:text-[var(--text-1)]">
          RESET DEFAULTS
        </button>
        <button className="py-[11px] px-[26px] bg-[var(--accent)] border-none rounded-[var(--radius)] text-white font-heading text-sm font-bold tracking-[0.06em] cursor-pointer transition-all duration-[var(--trans)] hover:shadow-[var(--shadow-glow)] hover:-translate-y-px">
          SAVE CHANGES
        </button>
      </div>
    </div>
  )
}
