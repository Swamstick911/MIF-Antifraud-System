// Detectors emit weighted signals; all scoring happens here so every number is traceable.

/** Risk bands. Ordered low to high; `bandFor` walks them in reverse. */
export const BANDS = [
  { id: 'safe', label: 'Looks safe', min: 0, tone: 'safe' },
  { id: 'caution', label: 'Be careful', min: 25, tone: 'caution' },
  { id: 'suspicious', label: 'Suspicious', min: 50, tone: 'suspicious' },
  { id: 'danger', label: 'Dangerous', min: 75, tone: 'danger' },
]

export function bandFor(score) {
  for (let i = BANDS.length - 1; i >= 0; i--) {
    if (score >= BANDS[i].min) return BANDS[i]
  }
  return BANDS[0]
}

// Probabilistic OR, not a sum: five weak signals must not fake certainty.
export function combine(signals) {
  const active = signals.filter((s) => s && s.weight > 0)
  let inverse = 1
  for (const s of active) {
    inverse *= 1 - clamp01(s.weight)
  }
  const score = Math.round((1 - inverse) * 100)
  return Math.min(score, 99) // never assert absolute certainty
}

/** Build the standard verdict object every shield returns. */
export function verdict({ signals, subject, kind, pattern = null, extras = {} }) {
  const score = combine(signals)
  const band = bandFor(score)
  return {
    kind,
    subject,
    score,
    band: band.id,
    bandLabel: band.label,
    tone: band.tone,
    pattern, // a named scam pattern, when one matched outright
    signals: [...signals].sort((a, b) => b.weight - a.weight),
    checkedAt: Date.now(),
    ...extras,
  }
}

export function clamp01(n) {
  return Math.max(0, Math.min(1, n))
}

/** Convenience used by detectors to express "this much, but capped". */
export function ramp(value, start, full, maxWeight) {
  if (value <= start) return 0
  const t = Math.min((value - start) / (full - start), 1)
  return t * maxWeight
}
