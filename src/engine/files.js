// File analyser. Nothing here claims a file is safe — only that nothing checkable looked wrong.
import { verdict, ramp } from './score.js'
import {
  identifyMagic, expectedFamily, EXECUTABLE_EXTENSIONS, IMAGE_EXTENSIONS,
  DECEPTIVE_CHARS,
} from './patterns/fileSignatures.js'
import {
  parseHost, tldOf, isRawIp, lookalikeBrand, HIGH_RISK_TLDS, SHORTENERS,
  KNOWN_BAD, KNOWN_GOOD,
} from './patterns/domains.js'

export function analyseFile(file) {
  const signals = []
  const name = file.filename ?? 'unknown'
  const parts = name.toLowerCase().split('.')
  const ext = parts.length > 1 ? parts[parts.length - 1] : ''
  const magic = identifyMagic(file.headerHex)
  const host = parseHost(file.sourceUrl ?? '')
  let pattern = null

  // --- 1. Deceptive filename: invisible / direction-flipping characters ----
  const tricks = DECEPTIVE_CHARS.filter((c) => name.includes(c.code))
  if (tricks.length > 0) {
    pattern = 'rtlo-disguise'
    signals.push({
      id: 'file.unicodeTrick',
      label: 'Filename contains hidden characters',
      weight: 0.92,
      evidence: `The name embeds a ${tricks.map((t) => t.name).join(' and ')}, so what you see is not the real name. Actual name: ${escapeInvisible(name)}`,
      explain:
        'There is no legitimate reason for a photo to carry a direction-override character. Its only purpose is to make an executable display as an image.',
    })
  }

  // --- 2. Double extension -------------------------------------------------
  if (parts.length > 2) {
    const inner = parts[parts.length - 2]
    if ((IMAGE_EXTENSIONS.has(inner) || inner === 'pdf' || inner === 'doc') && EXECUTABLE_EXTENSIONS.has(ext)) {
      pattern = pattern ?? 'double-extension'
      signals.push({
        id: 'file.doubleExtension',
        label: 'Double extension',
        weight: 0.9,
        evidence: `Named "…${inner}.${ext}" — it looks like a ${inner.toUpperCase()} but the real type is ${ext.toUpperCase()}.`,
        explain:
          'Windows hides known extensions by default, so "holiday.jpg.exe" shows up as "holiday.jpg". The last extension is the one that runs.',
      })
    }
  }

  // --- 3. Executable extension outright -----------------------------------
  if (EXECUTABLE_EXTENSIONS.has(ext)) {
    const viaChat = Boolean(file.senderLabel)
    signals.push({
      id: 'file.executableExtension',
      label: `.${ext} can run code`,
      weight: viaChat ? 0.8 : 0.5,
      evidence: viaChat
        ? `A .${ext} file arrived as a chat attachment from ${file.senderLabel}.`
        : `This is a .${ext} file, which executes instructions rather than displaying content.`,
      explain: viaChat
        ? 'Legitimate contacts share photos and documents. Installable files arriving over chat are how device takeover usually begins.'
        : 'Only install executables you went looking for, from the vendor’s own site.',
    })
  }

  // --- 4. Content does not match the claim --------------------------------
  if (magic) {
    const claimed = expectedFamily(ext)
    if (claimed !== 'unknown' && magic.family !== claimed) {
      const severe = magic.family === 'executable'
      pattern = severe ? 'masquerading-executable' : pattern
      signals.push({
        id: 'file.magicMismatch',
        label: 'File contents contradict its name',
        weight: severe ? 0.95 : 0.6,
        evidence: `Named .${ext} (expects ${claimed}), but the first bytes identify it as a ${magic.label}.`,
        explain: severe
          ? 'The file is a program wearing a picture’s name. Opening it runs it. This is the single most reliable sign of a disguised payload.'
          : 'The declared type and the real type disagree, which means the sender is describing the file inaccurately.',
      })
    }
    // ZIP container claiming to be an image — the APK-in-a-photo trick.
    if (magic.type === 'application/zip' && IMAGE_EXTENSIONS.has(ext)) {
      pattern = pattern ?? 'archive-as-image'
      signals.push({
        id: 'file.archiveAsImage',
        label: 'Archive disguised as an image',
        weight: 0.85,
        evidence: `"${name}" is really a ZIP-family container (APK and installer packages share this header).`,
        explain:
          'Android app packages are ZIP files. An "image" with a ZIP header shared over chat is the standard way malicious APKs are delivered.',
      })
    }
  } else if (file.headerHex) {
    signals.push({
      id: 'file.unknownType',
      label: 'Unrecognised file format',
      weight: 0.25,
      evidence: 'The leading bytes do not match any common format.',
      explain: 'Not proof of anything by itself, but it means the file cannot be verified as what it claims to be.',
    })
  }

  // --- 5. MIME claim vs reality -------------------------------------------
  if (magic && file.declaredMime && !mimeAgrees(file.declaredMime, magic)) {
    signals.push({
      id: 'file.mimeMismatch',
      label: 'Server described the file incorrectly',
      weight: 0.45,
      evidence: `Served as "${file.declaredMime}" but the content is ${magic.label}.`,
      explain: 'Browsers and chat apps decide how to preview a file from this label. Misdeclaring it is how a preview is made to look harmless.',
    })
  }

  // --- 6. Size anomalies ---------------------------------------------------
  const mb = (file.sizeBytes ?? 0) / (1024 * 1024)
  if (IMAGE_EXTENSIONS.has(ext) && mb > 12) {
    signals.push({
      id: 'file.oversizedImage',
      label: 'Far too large for a photo',
      weight: ramp(mb, 12, 80, 0.5),
      evidence: `${mb.toFixed(1)} MB for a .${ext} — phone photos are typically 1–6 MB.`,
      explain: 'Bundled payloads inflate the file. A picture this large is usually carrying something else.',
    })
  }
  if (IMAGE_EXTENSIONS.has(ext) && file.sizeBytes != null && file.sizeBytes < 1024 && !tricks.length) {
    signals.push({
      id: 'file.tinyImage',
      label: 'Suspiciously small',
      weight: 0.3,
      evidence: `Only ${file.sizeBytes} bytes.`,
      explain: 'Too small to be a real photograph — often a tracking pixel or a stub that fetches the real payload later.',
    })
  }

  // --- 7. Where it came from ----------------------------------------------
  signals.push(...sourceSignals(host, file))

  // --- 8. Delivery context -------------------------------------------------
  if (file.userInitiated === false) {
    signals.push({
      id: 'file.driveBy',
      label: 'Download you did not start',
      weight: 0.65,
      evidence: 'The page began this download on its own, without a click.',
      explain: 'Legitimate sites wait for you to ask. An automatic download is trying to get onto your device before you decide.',
    })
  }
  if (file.passwordProtected) {
    signals.push({
      id: 'file.passwordProtected',
      label: 'Password-protected archive',
      weight: 0.55,
      evidence: 'The archive is encrypted, with the password supplied alongside it.',
      explain: 'Encryption here is not for privacy — it stops antivirus from reading the contents until after you have opened it.',
    })
  }

  return verdict({
    kind: 'file',
    subject: escapeInvisible(name),
    signals,
    pattern,
    extras: {
      detectedType: magic ? magic.label : 'Unidentified',
      declaredExtension: ext || '(none)',
      host,
      sizeLabel: formatSize(file.sizeBytes),
      action: recommendedAction(signals),
    },
  })
}

function sourceSignals(host, file) {
  const out = []
  if (!host) return out

  if (KNOWN_GOOD.has(host)) {
    return out // a trusted origin contributes no risk, but never cancels content evidence
  }
  if (KNOWN_BAD.has(host)) {
    out.push({
      id: 'source.blocklisted',
      label: 'Source is a known scam site',
      weight: 0.9,
      evidence: `${host} appears on the reported-abuse list.`,
      explain: 'This domain has already been reported for distributing malicious downloads.',
    })
    return out
  }
  if (isRawIp(host)) {
    out.push({
      id: 'source.rawIp',
      label: 'Served from a bare IP address',
      weight: 0.6,
      evidence: `The download came from ${host} rather than a named domain.`,
      explain: 'Real services use domain names. A bare IP avoids registration records and domain-level blocking.',
    })
  }
  if (host.startsWith('xn--') || host.includes('.xn--')) {
    out.push({
      id: 'source.punycode',
      label: 'Non-Latin characters in the address',
      weight: 0.7,
      evidence: `${host} uses punycode encoding, so the address shown in the bar may not be the address you reach.`,
      explain: 'Cyrillic and Greek letters that look identical to Latin ones are used to clone a familiar web address exactly.',
    })
  }
  const tld = tldOf(host)
  if (HIGH_RISK_TLDS.has(tld)) {
    out.push({
      id: 'source.riskyTld',
      label: `.${tld} domain`,
      weight: 0.4,
      evidence: `.${tld} registrations are free or near-free and are heavily over-represented in abuse reports.`,
      explain: 'Low cost and weak verification make these the default choice for disposable scam sites.',
    })
  }
  if (SHORTENERS.has(host)) {
    out.push({
      id: 'source.shortener',
      label: 'Shortened link',
      weight: 0.35,
      evidence: `${host} hides the real destination until you arrive.`,
      explain: 'A shortener prevents you — and this tool — from inspecting where the file actually comes from.',
    })
  }
  const look = lookalikeBrand(host)
  if (look) {
    out.push({
      id: 'source.lookalike',
      label: `Imitates ${look.brand}`,
      weight: look.kind === 'typo-squat' ? 0.8 : 0.6,
      evidence: look.kind === 'typo-squat'
        ? `${host} is ${look.distance} character${look.distance === 1 ? '' : 's'} away from the real ${look.brand} address.`
        : `${host} puts "${look.brand}" in the name, but it is not an official ${look.brand} domain.`,
      explain: 'Anyone can register a domain containing a brand name. Familiarity in the address is not evidence of authenticity.',
    })
  }
  if (file.hostAgeDays != null && file.hostAgeDays < 60) {
    out.push({
      id: 'source.newDomain',
      label: 'Domain registered recently',
      weight: ramp(60 - file.hostAgeDays, 0, 59, 0.5),
      evidence: `${host} was registered ${file.hostAgeDays} day${file.hostAgeDays === 1 ? '' : 's'} ago.`,
      explain: 'Scam domains are discarded as soon as they are reported, so they are almost always new. Established services are years old.',
    })
  }
  return out
}

/** Map the verdict onto the action labels used in the project flowchart. */
function recommendedAction(signals) {
  const top = Math.max(0, ...signals.map((s) => s.weight))
  if (top >= 0.8) return { id: 'block', label: 'Do not open — delete and report', tone: 'danger' }
  if (top >= 0.5) return { id: 'quarantine', label: 'Do not open until you verify the sender', tone: 'suspicious' }
  if (top >= 0.25) return { id: 'caution', label: 'Open carefully, and only if you expected it', tone: 'caution' }
  return { id: 'proceed', label: 'No warning signs found', tone: 'safe' }
}

function mimeAgrees(declared, magic) {
  const d = declared.toLowerCase()
  if (d === magic.type) return true
  const family = d.split('/')[0]
  if (family === 'image' && magic.family === 'image') return true
  if (magic.type === 'application/zip' && /officedocument|opendocument|android|java-archive|zip/.test(d)) return true
  if (magic.family === 'document' && /pdf|msword|office|text/.test(d)) return true
  return false
}

/** Render invisible control characters visibly, so the UI cannot be fooled too. */
export function escapeInvisible(name = '') {
  let out = name
  for (const c of DECEPTIVE_CHARS) {
    out = out.split(c.code).join(`‹${c.name.toUpperCase().replace(/ /g, '-')}›`)
  }
  return out
}

function formatSize(bytes) {
  if (bytes == null) return 'unknown size'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
