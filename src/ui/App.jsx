import React, { useEffect, useState } from 'react'
import Overview from './tabs/Overview.jsx'
import MessageShield from './tabs/MessageShield.jsx'
import FileShield from './tabs/FileShield.jsx'
import CallShield from './tabs/CallShield.jsx'
import Activity from './tabs/Activity.jsx'
import { useSettings } from './useSettings.js'
import { inExtension } from '../platform/bridge.js'

const TABS = [
  { id: 'overview', label: 'Overview', short: 'Overview' },
  { id: 'messages', label: 'Message Shield', short: 'Messages' },
  { id: 'files', label: 'File Shield', short: 'Files' },
  { id: 'calls', label: 'Call Shield', short: 'Calls' },
  { id: 'activity', label: 'Live Activity', short: 'Activity' },
]

const VALID = new Set(TABS.map((t) => t.id))

export default function App() {
  // Hash routing: lets the demo be driven from bookmarks (#calls goes straight
  // to the digital-arrest screen) and makes each shield independently linkable.
  const [tab, setTab] = useState(() => {
    // Guarded: this component is also rendered to a string by the smoke test,
    // where there is no window.
    if (typeof window === 'undefined') return 'overview'
    const fromHash = window.location.hash.replace('#', '')
    return VALID.has(fromHash) ? fromHash : 'overview'
  })
  const [settings, update] = useSettings()

  useEffect(() => {
    const sync = () => {
      const next = window.location.hash.replace('#', '')
      if (VALID.has(next)) setTab(next)
    }
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  const go = (id) => {
    setTab(id)
    if (typeof window !== 'undefined' && window.location.hash !== `#${id}`) {
      window.history.replaceState(null, '', `#${id}`)
    }
  }

  return (
    <div className="min-h-screen">
      <a href="#main"
         className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 btn">
        Skip to content
      </a>

      {/* The hairline of brand colour at the very top reads as a powered-on
          instrument without spending any saturation on the rest of the page. */}
      <div aria-hidden className="h-[2px] w-full"
           style={{ background: 'linear-gradient(90deg, var(--safe), var(--caution) 45%, var(--danger))', opacity: 0.85 }} />

      <header className="sticky top-0 z-30 border-b backdrop-blur-md rule"
              style={{ background: 'color-mix(in srgb, var(--bg) 86%, transparent)' }}>
        <div className="mx-auto flex max-w-[78rem] flex-wrap items-center gap-x-4 gap-y-3 px-5 py-3">
          <Logo size={30} />
          <div className="mr-auto min-w-0">
            <h1 className="display text-[1.02rem] leading-none">
              MIF&nbsp;Shield
            </h1>
            <p className="label mt-1">digital safety assistant</p>
          </div>

          <span className="hidden items-center gap-2 rounded-full border px-2.5 py-1 sm:inline-flex rule"
                style={{ background: 'var(--surface-1)' }}>
            <span className="led led-live" style={{ color: 'var(--safe)' }} aria-hidden />
            <span className="label" style={{ color: 'var(--text-2)' }}>
              3 shields active
            </span>
          </span>

          <div className="flex items-center gap-1" role="group" aria-label="Display settings">
            <div className="flex items-center rounded-[--radius-sm] border rule"
                 style={{ background: 'var(--surface-1)' }}>
              <button className="btn !border-0 !bg-transparent !px-2.5"
                      aria-label="Decrease text size"
                      disabled={settings.scale <= 0.9}
                      onClick={() => update({ scale: Math.max(0.9, +(settings.scale - 0.1).toFixed(2)) })}>
                A<span className="text-[0.6em] align-sub">−</span>
              </button>
              <span className="numeral w-11 text-center text-[0.7rem]" style={{ color: 'var(--text-3)' }}>
                {Math.round(settings.scale * 100)}%
              </span>
              <button className="btn !border-0 !bg-transparent !px-2.5"
                      aria-label="Increase text size"
                      disabled={settings.scale >= 1.5}
                      onClick={() => update({ scale: Math.min(1.5, +(settings.scale + 0.1).toFixed(2)) })}>
                A<span className="text-[0.85em]">+</span>
              </button>
            </div>

            <button className="btn !px-2.5" aria-pressed={settings.contrast}
                    title="High contrast"
                    onClick={() => update({ contrast: !settings.contrast })}>
              <ContrastIcon /><span className="sr-only">High contrast</span>
            </button>

            <button className="btn !px-2.5"
                    aria-label={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} theme`}
                    onClick={() => update({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}>
              {settings.theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>

        {/* Segmented control rather than underlined tabs: it reads as a mode
            selector on a device, which is what it actually is. */}
        <nav className="mx-auto max-w-[78rem] px-5 pb-3" aria-label="Shields">
          <ul className="inline-flex gap-1 rounded-[--radius-sm] border p-1 rule"
              style={{ background: 'var(--surface-1)' }}>
            {TABS.map((t) => {
              const active = tab === t.id
              return (
                <li key={t.id}>
                  <button
                    onClick={() => go(t.id)}
                    aria-current={active ? 'page' : undefined}
                    className="rounded-[7px] px-3 py-1.5 text-[0.82rem] font-medium transition-colors"
                    style={{
                      background: active ? 'var(--surface-3)' : 'transparent',
                      color: active ? 'var(--text-1)' : 'var(--text-3)',
                      boxShadow: active ? 'inset 0 0 0 1px var(--line-strong)' : 'none',
                    }}
                  >
                    <span className="hidden sm:inline">{t.label}</span>
                    <span className="sm:hidden">{t.short}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </header>

      <main id="main" className="mx-auto max-w-[78rem] px-5 py-7">
        {tab === 'overview' && <Overview onNavigate={go} />}
        {tab === 'messages' && <MessageShield />}
        {tab === 'files' && <FileShield />}
        {tab === 'calls' && <CallShield />}
        {tab === 'activity' && <Activity />}
      </main>

      <footer className="mx-auto max-w-[78rem] px-5 pb-10">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-5 rule">
          <span className="label">
            runs on device · nothing uploaded
            {inExtension ? ' · extension mode' : ' · web mode'}
          </span>
          <span className="label ml-auto" style={{ color: 'var(--text-2)' }}>
            cybercrime helpline <span className="numeral">1930</span> · cybercrime.gov.in
          </span>
        </div>
      </footer>
    </div>
  )
}

export function Logo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="shrink-0">
      <path d="M16 2.6 L28 7.1 V16.2 C28 23 22.6 28 16 29.9 C9.4 28 4 23 4 16.2 V7.1 Z"
            fill="color-mix(in srgb, var(--safe) 10%, transparent)"
            stroke="var(--safe)" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="M10.6 16.3 L14.3 20 L21.4 12.2"
            fill="none" stroke="var(--text-1)" strokeWidth="2.3"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const ico = { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
const SunIcon = () => (
  <svg {...ico}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
)
const MoonIcon = () => (
  <svg {...ico}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
)
const ContrastIcon = () => (
  <svg {...ico}><circle cx="12" cy="12" r="9" /><path d="M12 3v18a9 9 0 0 0 0-18z" fill="currentColor" stroke="none" /></svg>
)
