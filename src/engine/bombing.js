// Message bombing detector. The attack is burial: a flood hides one real bank alert,
// so this both detects the flood and digs that alert back out.
import { verdict, ramp, clamp01 } from './score.js'

const SECOND = 1000

/** Tunable thresholds, kept in one place so they are defensible and editable. */
export const THRESHOLDS = {
  windows: [
    { id: '10s', ms: 10 * SECOND, normal: 4, severe: 30, weight: 0.6 },
    { id: '60s', ms: 60 * SECOND, normal: 12, severe: 90, weight: 0.5 },
    { id: '5m', ms: 300 * SECOND, normal: 30, severe: 250, weight: 0.4 },
  ],
  // Share of the burst coming from senders never seen before.
  unknownSenderShare: { start: 0.5, full: 0.95, weight: 0.35 },
  // Share of the burst that is an OTP / verification code.
  otpShare: { start: 0.25, full: 0.8, weight: 0.65 },
  // Distinct senders all arriving at once => coordinated, not one chatty friend.
  senderFanOut: { start: 4, full: 25, weight: 0.4 },
  // Near-identical bodies => templated / scripted send.
  templateShare: { start: 0.4, full: 0.9, weight: 0.3 },
  quietHours: { from: 1, to: 5, weight: 0.15 },
}

const OTP_PATTERNS = [
  /\b(?:otp|one[-\s]?time\s?(?:password|code|pin)|verification\s?code|security\s?code|auth(?:entication)?\s?code)\b/i,
  /\b\d{4,8}\b\s*(?:is|as)\s*(?:your|the)\b/i,
  /\bis\s+your\s+(?:otp|code|pin|password)\b/i,
]

/** Messages that indicate real money moved. These are what the flood hides. */
const FINANCIAL_PATTERNS = [
  { re: /\b(?:debited|withdrawn|deducted|spent|paid)\b/i, label: 'money leaving the account' },
  { re: /\b(?:credited|received|refund)\b/i, label: 'money entering the account' },
  { re: /(?:₹|rs\.?|inr)\s?[\d,]+(?:\.\d{1,2})?/i, label: 'a rupee amount' },
  { re: /\b(?:upi|neft|imps|rtgs)\b/i, label: 'a bank transfer rail' },
  { re: /\b(?:a\/c|account)\s*(?:no\.?|number)?\s*(?:x+|\*+)?\d{3,}/i, label: 'an account number' },
  { re: /\b(?:new\s+(?:device|login|sign[-\s]?in)|password\s+(?:was\s+)?changed|email\s+(?:was\s+)?(?:changed|updated)|sim\s+swap)\b/i, label: 'an account takeover step' },
]

export function detectBombing(messages, options = {}) {
  const now = options.now ?? Date.now()
  const recent = [...messages].sort((a, b) => a.timestamp - b.timestamp)
  const signals = []

  if (recent.length === 0) {
    return verdict({ kind: 'bombing', subject: 'Inbox', signals, extras: emptyExtras() })
  }

  // --- 1. Rate across sliding windows -------------------------------------
  const counts = {}
  for (const w of THRESHOLDS.windows) {
    const n = recent.filter((m) => now - m.timestamp <= w.ms).length
    counts[w.id] = n
    const weight = ramp(n, w.normal, w.severe, w.weight)
    if (weight > 0) {
      signals.push({
        id: `burst.rate.${w.id}`,
        label: `${n} messages in ${w.id}`,
        weight,
        evidence: `${n} messages arrived in the last ${w.id} (typical is under ${w.normal}).`,
        explain:
          'A sudden spike far above your normal rate is the clearest sign of an automated flood rather than real conversation.',
      })
    }
  }

  // Everything below is measured over the burst window (5 minutes), not the
  // whole history, so an old quiet inbox does not dilute a live attack.
  const burstMs = THRESHOLDS.windows[THRESHOLDS.windows.length - 1].ms
  const burst = recent.filter((m) => now - m.timestamp <= burstMs)
  const total = burst.length || 1

  // --- 2. Unknown senders --------------------------------------------------
  const unknown = burst.filter((m) => !m.knownContact)
  const unknownShare = unknown.length / total
  const uw = THRESHOLDS.unknownSenderShare
  const unknownWeight = ramp(unknownShare, uw.start, uw.full, uw.weight)
  if (unknownWeight > 0) {
    signals.push({
      id: 'burst.unknownSenders',
      label: 'Mostly unknown senders',
      weight: unknownWeight,
      evidence: `${pct(unknownShare)} of the burst (${unknown.length}/${total}) came from senders not in your contacts.`,
      explain:
        'Friends and family are already in your contacts. A wall of first-time senders means something is generating these, not someone.',
    })
  }

  // --- 3. OTP density ------------------------------------------------------
  const otps = burst.filter((m) => isOtp(m.text))
  const otpShare = otps.length / total
  const ow = THRESHOLDS.otpShare
  const otpWeight = ramp(otpShare, ow.start, ow.full, ow.weight)
  if (otpWeight > 0) {
    signals.push({
      id: 'burst.otpDensity',
      label: 'Flood of one-time codes',
      weight: otpWeight,
      evidence: `${otps.length} of ${total} messages are verification codes you did not request.`,
      explain:
        'Unrequested OTPs mean someone is actively trying to log in to, or sign up with, your number right now. The flood is the side effect of that attempt.',
    })
  }

  // --- 4.
  const distinct = new Set(burst.map((m) => m.sender)).size
  const distinctUnknown = new Set(unknown.map((m) => m.sender)).size
  const fw = THRESHOLDS.senderFanOut
  const fanWeight = ramp(distinctUnknown, fw.start, fw.full, fw.weight)
  if (fanWeight > 0) {
    signals.push({
      id: 'burst.senderFanOut',
      label: 'Many unknown senders at once',
      weight: fanWeight,
      evidence: `${distinctUnknown} senders you do not know messaged within ${THRESHOLDS.windows[2].id}.`,
      explain:
        'One excited friend sends many messages from one number. An attack script triggers many services at once, so unfamiliar senders fan out.',
    })
  }

  // --- 5. Templated bodies -------------------------------------------------
  const templateShare = duplicateShare(burst.map((m) => m.text))
  const tw = THRESHOLDS.templateShare
  const templateWeight = ramp(templateShare, tw.start, tw.full, tw.weight)
  if (templateWeight > 0) {
    signals.push({
      id: 'burst.templated',
      label: 'Near-identical wording',
      weight: templateWeight,
      evidence: `${pct(templateShare)} of the messages share the same template.`,
      explain:
        'Human conversation varies. Repeated boilerplate means the messages were generated from a script.',
    })
  }

  // --- 6. Quiet hours ------------------------------------------------------
  const hour = new Date(now).getHours()
  const qh = THRESHOLDS.quietHours
  if (hour >= qh.from && hour <= qh.to) {
    signals.push({
      id: 'burst.quietHours',
      label: 'Arrived overnight',
      weight: qh.weight,
      evidence: `The burst landed at ${String(hour).padStart(2, '0')}:00, while you were likely asleep.`,
      explain:
        'Attacks are timed for when you cannot react. A flood at 3am is designed to be noticed only after the money is gone.',
    })
  }

  // --- 7. Pull the buried alerts back out ---------------------------------
  const buried = findBuriedAlerts(burst)
  if (buried.length > 0) {
    signals.push({
      id: 'burst.buriedAlert',
      label: 'Real financial alert hidden in the flood',
      weight: 0.85,
      evidence: `${buried.length} genuine-looking account alert${buried.length > 1 ? 's were' : ' was'} buried inside the noise.`,
      explain:
        'This is the point of the attack. The flood exists so you scroll past the one message that tells you money is moving. Read these first.',
    })
  }

  return verdict({
    kind: 'bombing',
    subject: 'Inbox',
    signals,
    pattern: buried.length > 0 && otpShare > 0.3 ? 'otp-burial' : null,
    extras: {
      stats: {
        counts,
        total: burst.length,
        distinctSenders: distinct,
        distinctUnknownSenders: distinctUnknown,
        unknownShare,
        otpShare,
        templateShare,
      },
      buriedAlerts: buried,
      sampled: burst.slice(-40),
    },
  })
}

// Rank the messages that a human must not miss.
export function findBuriedAlerts(messages) {
  const hits = []
  for (const m of messages) {
    if (isOtp(m.text)) continue // the flood, not the signal
    const matched = FINANCIAL_PATTERNS.filter((p) => p.re.test(m.text))
    if (matched.length < 2) continue
    hits.push({
      ...m,
      importance: clamp01(matched.length / 3),
      reasons: matched.map((p) => p.label),
    })
  }
  return hits.sort((a, b) => b.importance - a.importance || b.timestamp - a.timestamp)
}

export function isOtp(text = '') {
  return OTP_PATTERNS.some((re) => re.test(text))
}

/** Share of messages whose normalised body is not unique. */
function duplicateShare(texts) {
  if (texts.length < 2) return 0
  const seen = new Map()
  for (const t of texts) {
    const key = normalise(t)
    seen.set(key, (seen.get(key) ?? 0) + 1)
  }
  let duplicated = 0
  for (const count of seen.values()) if (count > 1) duplicated += count
  return duplicated / texts.length
}

/** Strip digits and punctuation so "Your code is 1234" collapses with "...9876". */
function normalise(t = '') {
  return t.toLowerCase().replace(/\d+/g, '#').replace(/[^a-z#\s]/g, '').replace(/\s+/g, ' ').trim()
}

function pct(n) {
  return `${Math.round(n * 100)}%`
}

function emptyExtras() {
  return {
    stats: { counts: {}, total: 0, distinctSenders: 0, unknownShare: 0, otpShare: 0, templateShare: 0 },
    buriedAlerts: [],
    sampled: [],
  }
}
