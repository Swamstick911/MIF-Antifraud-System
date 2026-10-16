// Source-reputation heuristics.

/** Brands impersonated most often in Indian phishing, for lookalike scoring. */
export const PROTECTED_BRANDS = [
  'whatsapp', 'google', 'gmail', 'paytm', 'phonepe', 'googlepay', 'amazon',
  'flipkart', 'netflix', 'instagram', 'facebook', 'sbi', 'onlinesbi', 'hdfcbank',
  'icicibank', 'axisbank', 'kotak', 'rbi', 'npci', 'irctc', 'epfo', 'uidai',
  'incometax', 'cowin', 'dhl', 'fedex', 'bluedart', 'microsoft', 'apple',
]

/** TLDs over-represented in abuse relative to legitimate consumer traffic. */
export const HIGH_RISK_TLDS = new Set([
  'tk', 'ml', 'ga', 'cf', 'gq', 'top', 'xyz', 'click', 'link', 'zip', 'mov',
  'rest', 'cam', 'surf', 'icu', 'cyou', 'sbs', 'quest', 'bond', 'lol',
])

/** Link shorteners hide the real destination, so they block inspection. */
export const SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'is.gd', 'cutt.ly', 'rb.gy',
  'shorturl.at', 'ow.ly', 'buff.ly', 'rebrand.ly', 'short.link',
])

/** Mock blocklist, standing in for a live feed like Safe Browsing. */
export const KNOWN_BAD = new Set([
  'free-photo-download.tk',
  'whatsapp-image-viewer.top',
  'sbi-kyc-update.xyz',
  'rbi-verification-portal.click',
  'courier-redelivery-fee.cf',
])

/** Domains we trust outright, so the demo has believable negatives too. */
export const KNOWN_GOOD = new Set([
  'web.whatsapp.com', 'drive.google.com', 'mail.google.com', 'github.com',
  'wikipedia.org', 'onlinesbi.sbi', 'incometax.gov.in', 'cybercrime.gov.in',
])

export function parseHost(url = '') {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return String(url).toLowerCase().replace(/^https?:\/\//, '').split('/')[0]
  }
}

export function tldOf(host = '') {
  const parts = host.split('.')
  return parts[parts.length - 1] ?? ''
}

export function isRawIp(host = '') {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host) || host.includes(':')
}

// Levenshtein distance, iterative two-row form.
export function editDistance(a, b) {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const row = [i]
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(
        prev[j] + 1,
        row[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
    }
    prev = row
  }
  return prev[b.length]
}

// Find the brand a hostname is imitating.
export function lookalikeBrand(host = '') {
  const labels = host.split('.')
  const core = labels.slice(0, -1).join('-')
  const bare = core.replace(/[^a-z0-9]/g, '')
  // Tokens are the hyphen/dot separated words, e.g. `sbi-kyc-update` -> [sbi,kyc,update]
  const tokens = new Set(core.split(/[^a-z0-9]+/).filter(Boolean))
  if (!bare) return null

  for (const brand of PROTECTED_BRANDS) {
    if (bare === brand) return null // the genuine article, or a match we cannot dispute
    const distance = editDistance(bare, brand)
    if (brand.length >= 5 && distance > 0 && distance <= 2) {
      return { brand, kind: 'typo-squat', distance }
    }
    // Short brands (sbi, rbi, dhl) only count when they stand alone as a word, otherwise they fire on.
    const containedAsWord = tokens.has(brand)
    const containedAsSubstring = brand.length >= 5 && bare.includes(brand)
    if (bare !== brand && (containedAsWord || containedAsSubstring)) {
      return { brand, kind: 'combo-squat', distance }
    }
  }
  return null
}
