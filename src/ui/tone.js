// Engine names a tone; the stylesheet owns what it looks like. tests/tokens.test.js guards the link.
export const TONE = {
  safe: { css: 'var(--safe)', label: 'Safe', icon: '✓' },
  caution: { css: 'var(--caution)', label: 'Caution', icon: '!' },
  suspicious: { css: 'var(--suspicious)', label: 'Suspicious', icon: '!' },
  danger: { css: 'var(--danger)', label: 'Dangerous', icon: '✕' },
}

export function toneOf(tone) {
  return TONE[tone] ?? TONE.safe
}
