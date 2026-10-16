// Live download inspection.
import { analyseFile } from '../engine/index.js'
import { record, refreshBadge, notify, setState } from './log.js'

/** At or above this, the download is stopped rather than merely flagged. */
const BLOCK_AT = 75
/** At or above this, the user is interrupted with a notification. */
const WARN_AT = 50

const handled = new Set()

export function watchDownloads() {
  if (!chrome.downloads) return

  chrome.downloads.onCreated.addListener((item) => {
    inspect(item).catch(() => {})
  })

  // Fires with the filename Chrome is about to use.
  if (chrome.downloads.onDeterminingFilename) {
    chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
      inspect(item).catch(() => {})
      suggest() // must always be called or the download stalls
    })
  }
}

async function inspect(item) {
  if (!item || handled.has(item.id)) return
  handled.add(item.id)

  const url = item.finalUrl || item.url || ''
  const filename = basename(item.filename) || basename(url)
  if (!filename) return

  const verdict = analyseFile({
    filename,
    declaredMime: item.mime || null,
    sizeBytes: item.totalBytes || item.fileSize || null,
    sourceUrl: url,
    referrer: item.referrer || null,
    // Chrome does not tell us whether a click started this, so we do not guess.
    userInitiated: undefined,
  })

  const blocked = verdict.score >= BLOCK_AT
  if (blocked) {
    try {
      await chrome.downloads.cancel(item.id)
    } catch {
      // Already finished or cancelled; the warning below still stands.
    }
  }

  await record({
    kind: 'file',
    subject: verdict.subject,
    score: verdict.score,
    tone: verdict.tone,
    band: verdict.bandLabel,
    blocked,
    host: verdict.host,
    action: verdict.action.label,
    reasons: verdict.signals.slice(0, 3).map((s) => s.evidence),
  })

  if (verdict.score >= WARN_AT) {
    await setState({
      tone: verdict.tone,
      score: verdict.score,
      headline: blocked ? 'Download blocked' : 'Risky download',
      detail: `${verdict.subject} — ${verdict.action.label}`,
    })
    notify({
      id: `mif-file-${item.id}`,
      title: blocked ? 'MIF Shield blocked a download' : 'MIF Shield: risky download',
      message: `${verdict.subject}\n${verdict.signals[0]?.evidence ?? verdict.action.label}`,
    })
  }

  await refreshBadge()
}

/** Last path segment, tolerant of query strings and of an empty filename. */
function basename(pathOrUrl = '') {
  if (!pathOrUrl) return ''
  let s = String(pathOrUrl)
  try {
    if (/^https?:/i.test(s)) s = new URL(s).pathname
  } catch {
    /* fall through and treat it as a plain path */
  }
  s = s.split(/[\\/]/).filter(Boolean).pop() ?? ''
  try {
    s = decodeURIComponent(s)
  } catch {
    /* leave percent-encoding in place rather than losing the name */
  }
  return s.split('?')[0]
}
