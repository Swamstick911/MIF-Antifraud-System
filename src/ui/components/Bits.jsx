import React from 'react'
import { toneOf } from '../tone.js'

/** Risk-tone pill. Used wherever a verdict needs naming inline. */
export function BandBadge({ tone, children }) {
  const t = toneOf(tone)
  return (
    <span
      className="label inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
      style={{
        color: t.css,
        background: `color-mix(in srgb, ${t.css} 13%, transparent)`,
        border: `1px solid color-mix(in srgb, ${t.css} 38%, transparent)`,
      }}
    >
      <span aria-hidden className="led" style={{ color: t.css }} />
      {children}
    </span>
  )
}

// A single instrument reading.
export function Stat({ label, value, tone, hint }) {
  return (
    <div className="card px-3 py-2.5">
      <div className="label">{label}</div>
      <div className="numeral mt-1.5 text-[1.6rem] font-bold leading-none"
           style={tone ? { color: toneOf(tone).css } : undefined}>
        {value}
      </div>
      {hint ? <div className="dim2 mt-1 text-[0.7rem] leading-tight">{hint}</div> : null}
    </div>
  )
}

export function Section({ title, hint, children, actions, id }) {
  return (
    <section id={id} className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h2 className="display text-[1.15rem]">{title}</h2>
          {hint ? <p className="dim mt-1 text-[0.85rem] leading-relaxed">{hint}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  )
}

/** A horizontal rule carrying a label — the instrument's section divider. */
export function Divider({ children }) {
  return (
    <div className="flex items-center gap-3">
      <span className="label shrink-0">{children}</span>
      <span className="h-px flex-1" style={{ background: 'var(--line)' }} />
    </div>
  )
}

/** Where the prototype must be honest about what is real. */
export function MockNote({ children }) {
  return (
    <p className="dim2 rounded-[--radius-sm] border border-dashed px-3 py-2 text-[0.76rem] leading-relaxed rule">
      <span className="label" style={{ color: 'var(--text-2)' }}>prototype data</span>
      <span className="mx-1.5" aria-hidden>·</span>
      {children}
    </p>
  )
}
