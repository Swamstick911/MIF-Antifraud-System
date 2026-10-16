import React, { useCallback, useEffect, useState } from 'react'
import { readActivity, clearActivity, onActivityChange, inExtension } from '../../platform/bridge.js'
import { Section, Stat, Divider, MockNote } from '../components/Bits.jsx'
import { toneOf } from '../tone.js'

// Live activity.
export default function Activity() {
  const [{ log, live }, setActivity] = useState({ log: [], state: null, live: false })

  const refresh = useCallback(() => {
    readActivity().then(setActivity)
  }, [])

  useEffect(() => {
    refresh()
    return onActivityChange(refresh)
  }, [refresh])

  const warnings = log.filter((e) => e.score >= 50)
  const blocked = log.filter((e) => e.blocked)

  return (
    <div className="space-y-7">
      <Section
        title="Live activity"
        hint="What the extension has seen in this browser. Downloads, chat pages, and anything you right-clicked."
        actions={
          log.length > 0 ? (
            <button className="btn" onClick={() => clearActivity().then(refresh)}>
              Clear log
            </button>
          ) : null
        }
      />

      {!inExtension ? (
        <div className="card p-5">
          <h3 className="text-[1rem] font-bold">No live data in web mode</h3>
          <p className="dim mt-2 max-w-2xl text-[0.88rem] leading-relaxed">
            This page is running as an ordinary web page, so there is no service worker
            watching downloads. Build the extension and load <code className="mono">dist/</code>{' '}
            unpacked to see real events here — the three shield tabs work identically either way.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="items checked" value={log.length} hint="downloads, links, messages" />
        <Stat label="warnings" value={warnings.length}
              tone={warnings.length ? 'caution' : undefined} hint="score 50 or above" />
        <Stat label="blocked" value={blocked.length}
              tone={blocked.length ? 'danger' : undefined} hint="download cancelled" />
        <Stat label="worker" value={live ? 'live' : 'idle'}
              tone={live ? 'safe' : undefined} hint={inExtension ? 'service worker' : 'web mode'} />
      </div>

      <div className="space-y-3">
        <Divider>event log</Divider>
        {log.length === 0 ? (
          <div className="card p-5">
            <p className="dim text-[0.88rem] leading-relaxed">
              Nothing yet. {inExtension ? (
                <>Try downloading any <code className="mono">.exe</code>, right-clicking a
                message and choosing <em>Check this message with MIF Shield</em>, or opening a
                chat page.</>
              ) : 'Load the extension to start seeing live events.'}
            </p>
          </div>
        ) : (
          <ul className="card divide-y overflow-hidden rule">
            {log.map((e) => {
              const t = toneOf(e.tone)
              return (
                <li key={e.id} className="flex flex-wrap items-start gap-x-3 gap-y-2 px-4 py-3">
                  <span aria-hidden className="led mt-2 shrink-0" style={{ color: t.css }} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2.5">
                      <span className="text-[0.9rem] font-semibold">{e.subject}</span>
                      {e.blocked ? (
                        <span className="label rounded px-1.5 py-0.5"
                              style={{ background: 'var(--danger)', color: '#0A0406' }}>
                          blocked
                        </span>
                      ) : null}
                      <span className="label numeral">
                        {new Date(e.at).toLocaleTimeString()}
                      </span>
                    </span>
                    {e.reasons?.length ? (
                      <ul className="dim mt-1.5 space-y-0.5 text-[0.8rem] leading-relaxed">
                        {e.reasons.map((r, i) => <li key={i}>· {r}</li>)}
                      </ul>
                    ) : null}
                    {e.host ? <p className="label mt-1.5">{e.host}</p> : null}
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="numeral block text-[1.15rem] font-bold leading-none"
                          style={{ color: t.css }}>{e.score}</span>
                    <span className="label mt-1 block">{e.band}</span>
                  </span>
                </li>
              )
            })}
          </ul>
        )}
        <MockNote>
          This log is the one part of MIF Shield that is never simulated — every row here came
          from the real browser. It is capped at 60 entries, stored locally, and sent nowhere.
        </MockNote>
      </div>
    </div>
  )
}
