// Right-click entry points.
import { analyseFile, analyseTranscript } from '../engine/index.js'
import { record, refreshBadge, notify, setState } from './log.js'

export const PENDING_TRANSCRIPT = 'pendingTranscript'

const ITEMS = [
  { id: 'mif-check-selection', title: 'Check this message with MIF Shield', contexts: ['selection'] },
  { id: 'mif-check-link', title: 'Check this link with MIF Shield', contexts: ['link'] },
  { id: 'mif-open', title: 'Open MIF Shield dashboard', contexts: ['action'] },
]

export function installMenus() {
  if (!chrome.contextMenus) return
  // removeAll first: onInstalled can fire again on update, and duplicate ids throw.
  chrome.contextMenus.removeAll(() => {
    for (const item of ITEMS) chrome.contextMenus.create(item)
  })
}

export function watchMenus() {
  if (!chrome.contextMenus) return
  chrome.contextMenus.onClicked.addListener((info) => {
    handle(info).catch(() => {})
  })
}

async function handle(info) {
  if (info.menuItemId === 'mif-open') return openDashboard('#overview')

  if (info.menuItemId === 'mif-check-selection') {
    const text = (info.selectionText ?? '').trim()
    if (!text) return
    const verdict = analyseTranscript(text)

    // Hand the text to the dashboard so the user sees the full annotated
    // breakdown, not just a verdict they have to take on trust.
    await chrome.storage.local.set({ [PENDING_TRANSCRIPT]: { text, at: Date.now() } })

    await record({
      kind: 'call',
      subject: verdict.namedScam ? `Matches ${verdict.namedScam.name}` : 'Message checked',
      score: verdict.score,
      tone: verdict.tone,
      band: verdict.bandLabel,
      reasons: verdict.signals.slice(0, 3).map((s) => s.label),
    })
    await setState({
      tone: verdict.tone,
      score: verdict.score,
      headline: verdict.namedScam ? 'Scam pattern recognised' : 'Message analysed',
      detail: verdict.namedScam?.summary ?? `${verdict.tacticCount} pressure tactics found.`,
    })
    await refreshBadge()
    return openDashboard('#calls')
  }

  if (info.menuItemId === 'mif-check-link') {
    const url = info.linkUrl ?? ''
    const filename = lastSegment(url)
    const verdict = analyseFile({ filename: filename || 'link', sourceUrl: url })
    await record({
      kind: 'file',
      subject: verdict.subject,
      score: verdict.score,
      tone: verdict.tone,
      band: verdict.bandLabel,
      host: verdict.host,
      action: verdict.action.label,
      reasons: verdict.signals.slice(0, 3).map((s) => s.evidence),
    })
    await refreshBadge()
    notify({
      id: `mif-link-${Date.now()}`,
      title: `MIF Shield: ${verdict.bandLabel.toLowerCase()}`,
      message: verdict.signals.length
        ? `${verdict.host}\n${verdict.signals[0].evidence}`
        : `${verdict.host}\nNo warning signs found in the address or filename.`,
    })
  }
}

function openDashboard(hash = '') {
  return chrome.tabs.create({ url: chrome.runtime.getURL(`dashboard.html${hash}`) })
}

function lastSegment(url = '') {
  try {
    const path = new URL(url).pathname
    const last = decodeURIComponent(path.split('/').filter(Boolean).pop() ?? '')
    return last.includes('.') ? last : ''
  } catch {
    return ''
  }
}
