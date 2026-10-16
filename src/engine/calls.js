// Transcript analyser. Not a call interceptor — an extension cannot touch telephony.
import { verdict, clamp01 } from './score.js'
import { TACTICS, NAMED_SCAMS, SAFE_STEPS } from './patterns/callPatterns.js'

export function analyseTranscript(text = '') {
  const haystack = text.toLowerCase()
  const signals = []
  const highlights = []
  const matchedTactics = new Set()

  for (const tactic of TACTICS) {
    const found = []
    for (const phrase of tactic.phrases) {
      for (const index of findAll(haystack, phrase)) {
        found.push({ phrase, index })
        highlights.push({
          start: index,
          end: index + phrase.length,
          tacticId: tactic.id,
          tacticLabel: tactic.label,
        })
      }
    }
    if (found.length === 0) continue

    matchedTactics.add(tactic.id)
    // Repeated phrases within one tactic add confidence, with sharply
    // diminishing returns: the second mention matters, the eighth does not.
    const distinct = new Set(found.map((f) => f.phrase)).size
    // Capped below 1 on purpose: a single tactic, however many times it is
    // phrased, is never conclusive on its own. Certainty is not ours to claim.
    const weight = Math.min(clamp01(tactic.weight * (1 + Math.log2(distinct) * 0.12)), 0.95)

    signals.push({
      id: `call.${tactic.id}`,
      label: tactic.label,
      weight,
      evidence: quoteList(text, found),
      explain: tactic.explain,
      tacticId: tactic.id,
      phrases: [...new Set(found.map((f) => f.phrase))],
    })
  }

  // --- Named scam match ---------------------------------------------------- Most specific match wins.
  const scam = pickScam(haystack, matchedTactics)
  if (scam) {
    signals.push({
      id: `call.named.${scam.id}`,
      label: `Matches ${scam.name}`,
      weight: 0.9,
      evidence: `All the hallmarks are present: ${scam.requires.join(', ')}.`,
      explain: scam.summary,
    })
  }

  const result = verdict({
    kind: 'call',
    subject: scam ? capitalise(scam.name) : 'Caller analysis',
    signals,
    pattern: scam?.id ?? null,
    extras: {
      namedScam: scam ?? null,
      truths: scam?.truths ?? [],
      steps: SAFE_STEPS,
      highlights: mergeHighlights(highlights),
      tacticCount: matchedTactics.size,
      transcriptLength: text.length,
    },
  })

  // A short, vague description simply does not contain enough to judge. Saying
  // "nothing found" there would be falsely reassuring, so we say so plainly.
  if (text.trim().length < 40 && signals.length === 0) {
    result.inconclusive = true
    result.bandLabel = 'Not enough detail'
  }
  return result
}

// Choose which named scam to report.
function pickScam(haystack, matchedTactics) {
  const candidates = NAMED_SCAMS
    .filter((s) => s.requires.every((r) => matchedTactics.has(r)))
    .map((s) => ({
      scam: s,
      hits: (s.keywords ?? []).filter((k) => haystack.includes(k)).length,
    }))
    .sort((a, b) => b.hits - a.hits || b.scam.requires.length - a.scam.requires.length)

  const best = candidates[0]
  if (!best) return null
  // A scam with none of its own keywords present is a shape match only; prefer
  // reporting nothing by name over naming the wrong scam confidently.
  if (best.hits === 0 && candidates.length > 1) return null
  return best.scam
}

/** All occurrences of `needle`, respecting word boundaries where sensible. */
function findAll(haystack, needle) {
  const out = []
  let from = 0
  for (;;) {
    const i = haystack.indexOf(needle, from)
    if (i === -1) break
    const before = i === 0 ? ' ' : haystack[i - 1]
    const after = haystack[i + needle.length] ?? ' '
    // Only require a boundary on the alphanumeric edges of the phrase, so
    // "don't disconnect" still matches mid-sentence punctuation.
    const startOk = !/[a-z0-9]/.test(before) || !/^[a-z0-9]/.test(needle)
    const endOk = !/[a-z0-9]/.test(after) || !/[a-z0-9]$/.test(needle)
    if (startOk && endOk) out.push(i)
    from = i + needle.length
  }
  return out
}

/** Pull the user's own words back out as readable evidence. */
function quoteList(original, found) {
  const quotes = []
  const seen = new Set()
  for (const f of found) {
    if (seen.has(f.phrase)) continue
    seen.add(f.phrase)
    quotes.push(`“${original.slice(f.index, f.index + f.phrase.length)}”`)
    if (quotes.length === 3) break
  }
  const extra = new Set(found.map((f) => f.phrase)).size - quotes.length
  return quotes.join(', ') + (extra > 0 ? ` and ${extra} more` : '')
}

/** Overlapping matches would break rendering, so collapse them. */
function mergeHighlights(list) {
  const sorted = [...list].sort((a, b) => a.start - b.start || b.end - a.end)
  const out = []
  for (const h of sorted) {
    const last = out[out.length - 1]
    if (last && h.start < last.end) {
      if (h.end > last.end) last.end = h.end
      continue
    }
    out.push({ ...h })
  }
  return out
}

function capitalise(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
