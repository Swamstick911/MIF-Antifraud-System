import React, { useCallback, useEffect, useState } from 'react'
import { Logo } from './App.jsx'
import { openDashboard, inExtension, readActivity, onActivityChange } from '../platform/bridge.js'
import { toneOf } from './tone.js'

// Toolbar popup.
export default function Popup() {
  const [{ log, state, live }, setActivity] = useState({ log: [], state: null, live: false })

  const refresh = useCallback(() => {
    readActivity().then(setActivity)
  }, [])

  useEffect(() => {
    refresh()
    return onActivityChange(refresh)
  }, [refresh])

  const warnings = log.filter((e) => e.score >= 50)
  const blocked = log.filter((e) => e.blocked)
  const current = state && Date.now() - state.at < 30 * 60 * 1000 ? state : null

  const tone = current?.tone ?? (warnings.length ? 'caution' : 'safe')
  const t = toneOf(tone)

  return (
    <div style={{ width: 340 }}>
      <div aria-hidden style={{ height: 2, background: t.css, opacity: 0.9 }} />

      <div className="flex items-center gap-2.5 border-b px-4 py-3 rule">
        <Logo size={24} />
        <div className="mr-auto min-w-0">
          <div className="text-[0.86rem] font-bold leading-none">MIF&nbsp;Shield</div>
          <div className="label mt-1">
            {inExtension ? (live ? 'watching this browser' : 'starting up') : 'preview mode'}
          </div>
        </div>
        <span className={`led ${live ? 'led-live' : ''}`} style={{ color: t.css }} aria-hidden />
      </div>

      <div className="instrument border-b px-4 py-4 rule">
        <div className="flex items-start gap-3">
          {current?.score >= 50 ? (
            <span className="numeral shrink-0 text-[2.4rem] font-bold leading-none"
                  style={{ color: t.css }}>
              {current.score}
            </span>
          ) : null}
          <div className="min-w-0">
            <div className="text-[0.95rem] font-bold leading-snug" style={{ color: t.css }}>
              {current?.headline ?? 'Nothing unusual'}
            </div>
            <p className="dim mt-1.5 text-[0.79rem] leading-relaxed">
              {current?.detail
                ?? (inExtension
                  ? 'Downloads and chat pages are being watched. Nothing has tripped a warning.'
                  : 'Preview mode — load the extension to watch live downloads.')}
            </p>
          </div>
        </div>
      </div>

      {/* Live counters, straight from the worker's log. */}
      <div className="grid grid-cols-3 divide-x border-b rule" style={{ borderColor: 'var(--line)' }}>
        <Counter label="checked" value={log.length} />
        <Counter label="warnings" value={warnings.length} tone={warnings.length ? 'caution' : undefined} />
        <Counter label="blocked" value={blocked.length} tone={blocked.length ? 'danger' : undefined} />
      </div>

      {log.length > 0 ? (
        <ul className="scroll-slim max-h-44 divide-y overflow-y-auto rule">
          {log.slice(0, 6).map((e) => (
            <li key={e.id} className="flex items-start gap-2.5 px-4 py-2.5">
              <span aria-hidden className="led mt-1.5 shrink-0" style={{ color: toneOf(e.tone).css }} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.78rem] font-semibold">{e.subject}</span>
                <span className="label mt-0.5 block">
                  {e.blocked ? 'blocked · ' : ''}{e.band}
                </span>
              </span>
              <span className="numeral shrink-0 text-[0.75rem] font-bold"
                    style={{ color: toneOf(e.tone).css }}>{e.score}</span>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="divide-y rule">
          {[
            ['Message Shield', 'chat pages'],
            ['File Shield', 'every download'],
            ['Call Shield', 'right-click any message'],
          ].map(([name, what]) => (
            <li key={name} className="flex items-center gap-2.5 px-4 py-2.5">
              <span className="led" style={{ color: 'var(--safe)' }} aria-hidden />
              <span className="text-[0.82rem] font-medium">{name}</span>
              <span className="label ml-auto">{what}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-2.5 border-t p-4 rule">
        <button className="btn btn-primary w-full" onClick={() => openDashboard()}>
          Open full dashboard
        </button>
        <p className="label text-center leading-relaxed">
          runs on device · nothing uploaded
          <br />
          <span style={{ color: 'var(--text-2)' }}>
            cybercrime helpline <span className="numeral">1930</span>
          </span>
        </p>
      </div>
    </div>
  )
}

function Counter({ label, value, tone }) {
  return (
    <div className="px-3 py-2.5 text-center">
      <div className="numeral text-[1.3rem] font-bold leading-none"
           style={tone ? { color: toneOf(tone).css } : undefined}>{value}</div>
      <div className="label mt-1">{label}</div>
    </div>
  )
}
