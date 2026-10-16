import React from 'react'
import { toneOf } from '../tone.js'

// The instrument gauge.

const START = 150 // degrees; gap sits at the bottom
const SWEEP = 240
const TICKS = 44

/** Zone boundaries mirror BANDS in the engine. */
function zoneAt(pct) {
  if (pct >= 75) return 'danger'
  if (pct >= 50) return 'suspicious'
  if (pct >= 25) return 'caution'
  return 'safe'
}

export default function RiskMeter({
  score = 0,
  tone = 'safe',
  label = '',
  sub = '',
  size = 232,
  live = false,
}) {
  const t = toneOf(tone)
  const cx = size / 2
  const cy = size / 2
  const rOuter = size * 0.455
  const rInner = size * 0.365

  const ticks = []
  for (let i = 0; i < TICKS; i++) {
    const frac = i / (TICKS - 1)
    const pct = frac * 100
    const angle = ((START + frac * SWEEP) * Math.PI) / 180
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    // At a reading of zero nothing is lit: a single stray lit tick reads as a
    // rendering artefact rather than as a measurement.
    const lit = score > 0 && pct <= score
    // The tick immediately at the reading is drawn longer and brighter: the
    // instrument equivalent of a needle.
    const isCursor = score > 0 && Math.abs(pct - score) < (100 / (TICKS - 1)) / 2
    const ri = isCursor ? rInner - size * 0.035 : rInner
    const ro = isCursor ? rOuter + size * 0.018 : rOuter
    ticks.push({
      key: i,
      x1: cx + ri * cos, y1: cy + ri * sin,
      x2: cx + ro * cos, y2: cy + ro * sin,
      color: lit ? `var(--${zoneAt(pct)})` : 'var(--line)',
      width: isCursor ? size * 0.021 : size * 0.0145,
      opacity: lit ? 1 : 0.65,
    })
  }

  return (
    <div
      className="relative inline-flex flex-col items-center"
      role="img"
      aria-label={`Risk score ${score} out of 100 — ${label}. ${sub}`}
    >
      <svg width={size} height={size * 0.78} viewBox={`0 0 ${size} ${size * 0.78}`} aria-hidden>
        {ticks.map((k) => (
          <line
            key={k.key}
            x1={k.x1} y1={k.y1} x2={k.x2} y2={k.y2}
            stroke={k.color}
            strokeWidth={k.width}
            strokeLinecap="round"
            opacity={k.opacity}
            style={{ transition: 'stroke 420ms ease, opacity 420ms ease' }}
          />
        ))}
      </svg>

      {/* Readout, centred inside the arc. */}
      <div className="pointer-events-none absolute inset-x-0 flex flex-col items-center"
           style={{ top: size * 0.235 }}>
        <span
          className="numeral display tabular-nums"
          style={{ fontSize: size * 0.275, color: t.css, transition: 'color 420ms ease' }}
        >
          {score}
        </span>
        <span className="label mt-1">risk score</span>
      </div>

      <div className="-mt-1 flex flex-col items-center text-center">
        <div className="flex items-center gap-2">
          {live ? (
            <span className="led led-live" style={{ color: t.css }} aria-hidden />
          ) : null}
          <span className="text-[0.95rem] font-semibold" style={{ color: t.css }}>{label}</span>
        </div>
        {sub ? <p className="dim2 mt-1 max-w-[18rem] text-[0.78rem] leading-snug">{sub}</p> : null}
      </div>
    </div>
  )
}
