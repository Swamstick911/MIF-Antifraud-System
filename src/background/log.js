// The extension's event log.

export const LOG_KEY = 'eventLog'
export const STATE_KEY = 'shieldState'
const MAX_EVENTS = 60

/** Append one event, newest first, and return the trimmed log. */
export async function record(event) {
  const { [LOG_KEY]: existing = [] } = await chrome.storage.local.get(LOG_KEY)
  const log = [{ id: crypto.randomUUID(), at: Date.now(), ...event }, ...existing].slice(0, MAX_EVENTS)
  await chrome.storage.local.set({ [LOG_KEY]: log })
  return log
}

export async function readLog() {
  const { [LOG_KEY]: log = [] } = await chrome.storage.local.get(LOG_KEY)
  return log
}

export async function clearLog() {
  await chrome.storage.local.set({ [LOG_KEY]: [], [STATE_KEY]: null })
}

// The single "what is happening right now" record the popup renders.
export async function setState(state) {
  await chrome.storage.local.set({ [STATE_KEY]: { ...state, at: Date.now() } })
}

export async function readState() {
  const { [STATE_KEY]: state = null } = await chrome.storage.local.get(STATE_KEY)
  return state
}

const TONE_COLOR = {
  safe: '#2DD4A7',
  caution: '#F5B33C',
  suspicious: '#FF8A4C',
  danger: '#FF5C6E',
}

/** Toolbar badge: a count of unseen warnings, coloured by the worst one. */
export async function refreshBadge() {
  const log = await readLog()
  const warnings = log.filter((e) => e.score >= 50)
  if (warnings.length === 0) {
    await chrome.action.setBadgeText({ text: '' })
    return
  }
  const worst = warnings.reduce((a, b) => (b.score > a.score ? b : a))
  await chrome.action.setBadgeText({ text: String(Math.min(warnings.length, 99)) })
  await chrome.action.setBadgeBackgroundColor({ color: TONE_COLOR[worst.tone] ?? TONE_COLOR.danger })
}

/** Desktop notification, only for things that genuinely warrant interrupting. */
export function notify({ title, message, id }) {
  try {
    chrome.notifications.create(id, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon128.png'),
      title,
      message,
      priority: 2,
    })
  } catch {
    // Notifications can be disabled at the OS level; never let that break a scan.
  }
}
