import React, { useState } from 'react'

// The evidence log.
export default function SignalList({ signals = [], emptyNote = 'No warning signs found.' }) {
  if (signals.length === 0) {
    return (
      <div className="card flex items-start gap-3 p-4">
        <span aria-hidden className="led mt-1.5 shrink-0" style={{ color: 'var(--safe)' }} />
        <p className="dim text-[0.875rem] leading-relaxed">{emptyNote}</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b px-3.5 py-2 rule">
        <span className="label">evidence</span>
        <span className="label">
          {signals.length} signal{signals.length === 1 ? '' : 's'} · contribution
        </span>
      </div>
      <ul className="divide-y rule">
        {signals.map((s, i) => (
          <SignalRow key={s.id} signal={s} defaultOpen={i === 0} />
        ))}
      </ul>
    </div>
  )
}

function SignalRow({ signal, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const pct = Math.round(signal.weight * 100)
  const tone =
    signal.weight >= 0.75 ? 'var(--danger)'
    : signal.weight >= 0.5 ? 'var(--suspicious)'
    : signal.weight >= 0.25 ? 'var(--caution)'
    : 'var(--safe)'

  return (
    <li>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group flex w-full items-start gap-3 px-3.5 py-3 text-left transition-colors"
        style={{ background: open ? 'var(--surface-2)' : 'transparent' }}
      >
        {/* Contribution, as a bar you can scan down the column. */}
        <span aria-hidden className="mt-[3px] flex shrink-0 flex-col items-center gap-1"
              style={{ width: '2.75rem' }}>
          <span className="numeral text-[0.8rem] font-semibold" style={{ color: tone }}>
            {pct}%
          </span>
          <span className="h-[3px] w-full overflow-hidden rounded-full"
                style={{ background: 'var(--line)' }}>
            <span className="block h-full rounded-full"
                  style={{ width: `${pct}%`, background: tone, transition: 'width 420ms ease' }} />
          </span>
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[0.9rem] font-semibold leading-snug">{signal.label}</span>
          <span className="dim mt-1 block text-[0.84rem] leading-relaxed">{signal.evidence}</span>
        </span>

        <span aria-hidden
              className="dim2 mt-0.5 shrink-0 text-[0.65rem] transition-transform"
              style={{ transform: open ? 'rotate(180deg)' : 'none' }}>
          ▾
        </span>
      </button>

      {open && signal.explain ? (
        <div className="border-t px-3.5 py-3 rule"
             style={{ background: 'var(--surface-2)' }}>
          <p className="label mb-1.5">why this matters</p>
          <p className="text-[0.85rem] leading-relaxed" style={{ color: 'var(--text-2)' }}>
            {signal.explain}
          </p>
        </div>
      ) : null}
    </li>
  )
}
