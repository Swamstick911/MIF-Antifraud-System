// Chat-page monitor. Analysis lives in the worker; this only observes and renders.
// Site class names change without notice, so selectors are defensive and fail quiet.

const WINDOW_MS = 5 * 60 * 1000
const DEBOUNCE_MS = 700
const BANNER_ID = 'mif-shield-flood-banner'

/** Per-site strategies, most specific first. */
const STRATEGIES = [
  {
    host: /web\.whatsapp\.com$/,
    container: () => document.querySelector('#main [data-testid="conversation-panel-messages"]')
      ?? document.querySelector('#main') ?? document.body,
    rows: (root) => root.querySelectorAll(
      '[data-testid="msg-container"], .message-in, [data-id][class*="message"]',
    ),
    isIncoming: (el) => el.classList.contains('message-in')
      || Boolean(el.closest('.message-in'))
      || !el.classList.contains('message-out'),
    text: (el) => pick(el, ['.selectable-text', '[data-testid="conversation-text"]', 'span.copyable-text']),
    sender: (el) => el.querySelector('[data-pre-plain-text]')?.getAttribute('data-pre-plain-text') ?? '',
  },
  {
    host: /web\.telegram\.org$/,
    container: () => document.querySelector('.messages-container, .bubbles, .im_history') ?? document.body,
    rows: (root) => root.querySelectorAll('.message, .bubble, .im_message_body'),
    isIncoming: (el) => !el.classList.contains('is-out') && !el.classList.contains('im_message_out'),
    text: (el) => pick(el, ['.text-content', '.message-text', '.im_message_text']) || el.textContent,
    sender: (el) => pick(el, ['.peer-title', '.sender-title', '.im_message_author']),
  },
  {
    host: /messages\.google\.com$/,
    container: () => document.querySelector('mws-messages-list') ?? document.body,
    rows: (root) => root.querySelectorAll('mws-message-wrapper'),
    isIncoming: (el) => el.getAttribute('is-outgoing') !== 'true',
    text: (el) => pick(el, ['mws-text-message-part', '.text-msg']),
    sender: (el) => pick(el, ['.name']),
  },
]

const strategy = STRATEGIES.find((s) => s.host.test(location.hostname))
if (strategy) start()

function start() {
  let timer = null
  const run = () => {
    clearTimeout(timer)
    timer = setTimeout(() => report().catch(() => {}), DEBOUNCE_MS)
  }

  const root = safe(() => strategy.container()) ?? document.body
  new MutationObserver(run).observe(root, { childList: true, subtree: true })
  run()

  // Demo hook: the dashboard or popup can ask this page to simulate a flood,
  // so the live path can be shown without waiting to actually be attacked.
  chrome.runtime.onMessage.addListener((msg, _s, respond) => {
    if (msg?.type === 'simulate:flood') {
      report(simulatedBurst()).then(respond).catch(() => respond({ error: true }))
      return true
    }
    return false
  })
}

/** Build the rolling window from what is currently rendered. */
function collect() {
  const root = safe(() => strategy.container())
  if (!root) return []
  const rows = safe(() => [...strategy.rows(root)]) ?? []
  const now = Date.now()
  const out = []

  rows.forEach((el, i) => {
    if (!safe(() => strategy.isIncoming(el))) return
    const text = (safe(() => strategy.text(el)) ?? '').trim()
    if (!text) return
    const senderRaw = (safe(() => strategy.sender(el)) ?? '').trim()
    const sender = senderRaw || 'unknown'

    out.push({
      id: el.getAttribute?.('data-id') ?? `row-${i}`,
      sender,
      senderLabel: sender.replace(/\[.*?\]\s*/, '').replace(/:$/, '') || 'Unknown',
      text,
      // The page does not reliably expose arrival time, so rows are spaced across the recent window by.
      timestamp: now - (rows.length - i) * 400,
      channel: location.hostname,
      knownContact: !looksLikePhoneNumber(sender),
    })
  })

  return out.filter((m) => now - m.timestamp <= WINDOW_MS).slice(-200)
}

async function report(override) {
  const messages = override ?? collect()
  if (messages.length < 8) {
    removeBanner()
    return { skipped: true }
  }
  const verdict = await chrome.runtime.sendMessage({ type: 'messages:window', payload: messages })
  if (!verdict || verdict.error) return { error: true }

  if (verdict.score >= 50) showBanner(verdict)
  else removeBanner()
  return verdict
}

/* ── Banner ─────────────────────────────────────────────────────────────── */

function showBanner(verdict) {
  removeBanner()
  const host = document.createElement('div')
  host.id = BANNER_ID
  // A closed shadow root keeps the host page's CSS from restyling a warning.
  const root = host.attachShadow({ mode: 'closed' })
  const alert = verdict.buriedAlerts?.[0]

  root.innerHTML = `
    <style>
      :host { all: initial; }
      .wrap {
        position: fixed; top: 16px; right: 16px; z-index: 2147483647;
        width: min(390px, calc(100vw - 32px));
        font: 14px/1.5 Inter, system-ui, -apple-system, 'Segoe UI', sans-serif;
        color: #E8EFF7; background: #0C1118;
        border: 1px solid #FF5C6E; border-radius: 14px; overflow: hidden;
        box-shadow: 0 18px 50px rgba(0,0,0,.5);
      }
      .head { display:flex; gap:9px; align-items:center; padding:11px 14px;
              background: rgba(255,92,110,.15); font-weight:700; font-size:14px; }
      .dot { width:8px; height:8px; border-radius:99px; background:#FF5C6E; }
      .score { margin-left:auto; font-variant-numeric: tabular-nums;
               font-weight:800; font-size:18px; color:#FF5C6E; }
      .body { padding: 12px 14px; }
      ul { margin:0; padding-left:17px; }
      li { margin:5px 0; color:#A3B4C8; font-size:12.5px; }
      .alert { margin-top:12px; padding:11px 12px; border-radius:9px;
               background: rgba(255,92,110,.1); border:1px solid rgba(255,92,110,.35); }
      .alert b { display:block; font-size:11px; letter-spacing:.09em;
                 text-transform:uppercase; color:#FF5C6E; margin-bottom:5px; }
      .alert p { margin:0; font-size:13px; color:#E8EFF7; }
      .row { display:flex; gap:8px; padding:11px 14px; border-top:1px solid #1E2936; }
      button { flex:1; padding:8px 10px; border-radius:9px; cursor:pointer; font:inherit;
               font-weight:600; font-size:13px; border:1px solid #1E2936;
               background:#18222F; color:#E8EFF7; }
      .primary { background:#2DD4A7; border-color:#2DD4A7; color:#04140D; }
    </style>
    <div class="wrap" role="alertdialog" aria-labelledby="t">
      <div class="head">
        <span class="dot"></span><span id="t">Message flood detected</span>
        <span class="score">${verdict.score}</span>
      </div>
      <div class="body">
        <ul>${(verdict.top ?? []).map((s) => `<li>${esc(s.evidence)}</li>`).join('')}</ul>
        ${alert ? `
          <div class="alert">
            <b>Buried in the flood — read this first</b>
            <p>${esc(alert.text)}</p>
          </div>` : ''}
      </div>
      <div class="row">
        <button class="primary" id="open">Open MIF Shield</button>
        <button id="hide">Dismiss</button>
      </div>
    </div>
  `
  root.getElementById('hide').addEventListener('click', removeBanner)
  root.getElementById('open').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'open:dashboard' }).catch(() => {})
    removeBanner()
  })
  document.documentElement.appendChild(host)
}

function removeBanner() {
  document.getElementById(BANNER_ID)?.remove()
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

function pick(el, selectors) {
  for (const sel of selectors) {
    const found = el.querySelector?.(sel)
    if (found?.textContent?.trim()) return found.textContent.trim()
  }
  return ''
}

/** A sender rendered as a raw number was never saved as a contact. */
function looksLikePhoneNumber(s = '') {
  return /^[+\d][\d\s\-()]{6,}$/.test(s.replace(/\[.*?\]/g, '').trim())
}

function safe(fn) {
  try {
    return fn()
  } catch {
    return null
  }
}

function esc(s = '') {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

/** Mock burst used by the demo hook, shaped exactly like collected messages. */
function simulatedBurst() {
  const brands = ['Amazon', 'Flipkart', 'Paytm', 'Swiggy', 'Zomato', 'Netflix',
                  'PhonePe', 'Myntra', 'Jio', 'Meesho', 'BigBasket', 'Ola']
  const now = Date.now()
  const out = []
  for (let i = 0; i < 120; i++) {
    const brand = brands[i % brands.length]
    out.push({
      id: `sim-${i}`,
      sender: `AX-${brand.slice(0, 5).toUpperCase()}`,
      senderLabel: brand,
      text: `${100000 + ((i * 7919) % 899999)} is your OTP for ${brand} login. Do not share with anyone.`,
      timestamp: now - (120 - i) * 900,
      channel: location.hostname,
      knownContact: false,
    })
  }
  out.push({
    id: 'sim-alert',
    sender: 'VM-HDFCBK',
    senderLabel: 'HDFC Bank',
    text: 'Rs 84,500.00 debited from A/c XX4417 on 16-10-25 via UPI to PAYEE-9823. Not you? Call 18002586161.',
    timestamp: now - 48000,
    channel: location.hostname,
    knownContact: true,
  })
  return out.sort((a, b) => a.timestamp - b.timestamp)
}
