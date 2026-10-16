// MV3 service worker — the extension's only long-lived component.
import { detectBombing, analyseTranscript, analyseFile } from '../engine/index.js'
import { record, refreshBadge, notify, setState, readLog, clearLog, readState } from './log.js'
import { watchDownloads } from './downloads.js'
import { installMenus, watchMenus } from './menus.js'

watchDownloads()
watchMenus()

chrome.runtime.onInstalled.addListener(() => {
  installMenus()
  chrome.action.setBadgeText({ text: '' })
  chrome.storage.local.set({ installedAt: Date.now() })
})

chrome.runtime.onStartup?.addListener(() => {
  installMenus()
  refreshBadge()
})

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Returning true keeps the channel open for the async reply below.
  handle(msg ?? {}, sender)
    .then(sendResponse)
    .catch((error) => sendResponse({ error: String(error) }))
  return true
})

async function handle(msg, sender) {
  switch (msg.type) {
    /** A chat page reporting the messages currently on screen. */
    case 'messages:window': {
      const verdict = detectBombing(msg.payload ?? [])
      if (verdict.score >= 50) {
        await record({
          kind: 'bombing',
          subject: `Message flood on ${hostOf(sender)}`,
          score: verdict.score,
          tone: verdict.tone,
          band: verdict.bandLabel,
          buried: verdict.buriedAlerts.length,
          reasons: verdict.signals.slice(0, 3).map((s) => s.evidence),
        })
        await setState({
          tone: verdict.tone,
          score: verdict.score,
          headline: 'Message flood detected',
          detail: verdict.buriedAlerts.length
            ? `${verdict.buriedAlerts.length} real alert(s) were buried in the flood.`
            : `${verdict.stats.total} messages in the last five minutes.`,
        })
        await refreshBadge()
        if (verdict.score >= 75) {
          notify({
            id: `mif-flood-${Date.now()}`,
            title: 'MIF Shield: message flood',
            message: verdict.buriedAlerts.length
              ? `A genuine account alert was buried in the flood. Open MIF Shield to read it.`
              : `${verdict.stats.total} messages arrived in a few minutes.`,
          })
        }
      }
      // The content script renders its own banner from this.
      return {
        score: verdict.score,
        tone: verdict.tone,
        band: verdict.bandLabel,
        buriedAlerts: verdict.buriedAlerts,
        top: verdict.signals.slice(0, 3),
      }
    }

    case 'analyse:file':
      return analyseFile(msg.payload ?? {})

    case 'analyse:transcript':
      return analyseTranscript(msg.payload ?? '')

    case 'log:read':
      return { log: await readLog(), state: await readState() }

    case 'open:dashboard':
      await chrome.tabs.create({ url: chrome.runtime.getURL(`dashboard.html${msg.hash ?? ''}`) })
      return { ok: true }

    case 'log:clear':
      await clearLog()
      await chrome.action.setBadgeText({ text: '' })
      return { ok: true }

    default:
      return { ok: false, reason: `unknown message type: ${msg.type}` }
  }
}

function hostOf(sender) {
  try {
    return new URL(sender?.tab?.url ?? sender?.url ?? '').hostname
  } catch {
    return 'this page'
  }
}
