// Platform bridge.

export const inExtension =
  typeof chrome !== 'undefined' && Boolean(chrome?.runtime?.id)

const memory = new Map()

/** Persisted state, backed by chrome.storage.local or localStorage. */
export const storage = {
  async get(key, fallback = null) {
    if (inExtension) {
      const got = await chrome.storage.local.get(key)
      return got[key] ?? fallback
    }
    try {
      const raw = localStorage.getItem(`mif:${key}`)
      return raw ? JSON.parse(raw) : fallback
    } catch {
      return memory.get(key) ?? fallback
    }
  },
  async set(key, value) {
    if (inExtension) return chrome.storage.local.set({ [key]: value })
    try {
      localStorage.setItem(`mif:${key}`, JSON.stringify(value))
    } catch {
      memory.set(key, value)
    }
  },
}

/** Fire-and-forget message to the service worker; a no-op on the web. */
export function notifyWorker(type, payload = {}) {
  if (!inExtension) return
  try {
    chrome.runtime.sendMessage({ type, payload })
  } catch {
    /* worker asleep or context invalidated — nothing here is critical */
  }
}

/** Desktop notification, falling back to an in-page event the UI can render. */
export function raiseAlert({ title, message }) {
  if (inExtension && chrome.notifications) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title,
      message,
      priority: 2,
    })
    return
  }
  window.dispatchEvent(new CustomEvent('mif:alert', { detail: { title, message } }))
}

/** Toolbar badge — the at-a-glance state when the popup is closed. */
export function setBadge(text, color = '#d93a36') {
  if (!inExtension || !chrome.action) return
  chrome.action.setBadgeText({ text: String(text ?? '') })
  chrome.action.setBadgeBackgroundColor({ color })
}

// Ask the service worker for the live event log.
export async function readActivity() {
  if (!inExtension) return { log: [], state: null, live: false }
  try {
    const res = await chrome.runtime.sendMessage({ type: 'log:read' })
    return { log: res?.log ?? [], state: res?.state ?? null, live: true }
  } catch {
    return { log: [], state: null, live: false }
  }
}

export async function clearActivity() {
  if (!inExtension) return
  try {
    await chrome.runtime.sendMessage({ type: 'log:clear' })
  } catch {
    /* worker asleep; the next read simply shows what is stored */
  }
}

// Text handed over by the "Check this message" right-click item, so the dashboard can open straight.
export async function takePendingTranscript() {
  if (!inExtension) return null
  try {
    const { pendingTranscript } = await chrome.storage.local.get('pendingTranscript')
    if (!pendingTranscript?.text) return null
    await chrome.storage.local.remove('pendingTranscript')
    return pendingTranscript.text
  } catch {
    return null
  }
}

/** Subscribe to live changes in the event log. Returns an unsubscribe function. */
export function onActivityChange(handler) {
  if (!inExtension || !chrome.storage?.onChanged) return () => {}
  const listener = (changes, area) => {
    if (area === 'local' && (changes.eventLog || changes.shieldState)) handler()
  }
  chrome.storage.onChanged.addListener(listener)
  return () => chrome.storage.onChanged.removeListener(listener)
}

/** Open the full dashboard, in a tab in the extension and in place on the web. */
export function openDashboard() {
  if (inExtension) {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') })
  } else {
    window.location.href = './dashboard.html'
  }
}
