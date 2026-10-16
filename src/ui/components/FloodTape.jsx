import React, { useMemo } from 'react'

// Chart recorder for the inbox. Window is derived from the data: a replayed attack spans
// seconds and a quiet inbox spans minutes, and a fixed window flattens one of them.

const BUCKETS = 56
// Only a floor against a zero-width span (every message sharing one timestamp).
const MIN_SPAN_MS = 1000

export default function FloodTape({ messages = [], buried = [], height = 108 }) {
  const { bars, max, from, span, peak } = useMemo(() => {
    if (messages.length === 0) {
      return { bars: [], max: 0, from: 0, span: 0, peak: 0 }
    }
    const times = messages.map((m) => m.timestamp)
    const to = Math.max(...times)
    const rawFrom = Math.min(...times)
    const span = Math.max(MIN_SPAN_MS, to - rawFrom)
    const from = to - span

    const bars = Array.from({ length: BUCKETS }, () => ({ total: 0, unknown: 0 }))
    for (const m of messages) {
      const i = Math.min(BUCKETS - 1, Math.max(0, Math.floor(((m.timestamp - from) / span) * BUCKETS)))
      bars[i].total++
      if (!m.knownContact) bars[i].unknown++
    }
    const peak = Math.max(...bars.map((b) => b.total))
    // Floor the scale so a quiet inbox does not draw single messages as spikes.
    return { bars, max: Math.max(4, peak), from, span, peak }
  }, [messages])

  if (bars.length === 0) {
    return (
      <div className="instrument flex items-center justify-center rounded-[--radius-sm] border rule"
           style={{ height }}>
        <span className="label">awaiting signal</span>
      </div>
    )
  }

  const positionOf = (ts) => Math.max(0, Math.min(100, ((ts - from) / span) * 100))

  return (
    <div className="instrument overflow-hidden rounded-[--radius-sm] border rule">
      <div className="relative flex items-end gap-px px-2 pb-2 pt-5" style={{ height }}>
        {bars.map((b, i) => {
          const density = b.total ? b.unknown / b.total : 0
          const color =
            b.total === 0 ? 'transparent'
            : density > 0.7 ? 'var(--danger)'
            : density > 0.35 ? 'var(--suspicious)'
            : 'var(--text-3)'
          return (
            <span
              key={i}
              className="flex-1 rounded-t-[2px]"
              style={{
                height: `${b.total ? Math.max(7, (b.total / max) * 100) : 0}%`,
                background: color,
                opacity: b.total === 0 ? 0 : density > 0.35 ? 0.92 : 0.5,
                transition: 'height 220ms ease, background 320ms ease',
              }}
            />
          )
        })}

        {buried.map((alert) => (
          <span key={alert.id}
                className="pointer-events-none absolute bottom-0 top-0 flex flex-col items-center"
                style={{ left: `${positionOf(alert.timestamp)}%` }}>
            <span className="whitespace-nowrap rounded px-1.5 py-0.5 text-[0.6rem] font-bold"
                  style={{ background: 'var(--danger)', color: '#0A0406' }}>
              ₹ ALERT
            </span>
            <span className="w-px flex-1" style={{ background: 'var(--danger)' }} />
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between border-t px-2.5 py-1.5 rule">
        <span className="label">{formatSpan(span)} ago</span>
        <span className="label" style={{ color: 'var(--text-2)' }}>
          busiest moment <span className="numeral">{peak}</span>
          &nbsp;·&nbsp;<span className="numeral">{messages.length}</span> total
        </span>
        <span className="label">now</span>
      </div>
    </div>
  )
}

function formatSpan(ms) {
  if (ms < 60000) return `${Math.round(ms / 1000)}s`
  return `${Math.round(ms / 60000)} min`
}
