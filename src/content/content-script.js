// Content script.
import { analyseFile } from '../engine/index.js'

const BANNER_ID = 'mif-shield-banner'
let dismissed = false

document.addEventListener('click', onClick, true)

function onClick(event) {
  if (dismissed) return
  const link = event.target?.closest?.('a[href]')
  if (!link) return

  const name = filenameFor(link)
  if (!name) return

  // No header bytes are available before the download starts, so this is a name-and-origin check only.
  const verdict = analyseFile({
    filename: name,
    sourceUrl: link.href,
    userInitiated: true,
  })

  if (verdict.score < 50) return

  event.preventDefault()
  event.stopPropagation()
  showBanner(verdict, link.href)
}

function filenameFor(link) {
  const explicit = link.getAttribute('download')
  if (explicit) return explicit
  try {
    const path = new URL(link.href, location.href).pathname
    const last = decodeURIComponent(path.split('/').filter(Boolean).pop() ?? '')
    return last.includes('.') ? last : null
  } catch {
    return null
  }
}

function showBanner(verdict, href) {
  document.getElementById(BANNER_ID)?.remove()

  const host = document.createElement('div')
  host.id = BANNER_ID
  // A shadow root keeps the page's own CSS from restyling a safety warning.
  const root = host.attachShadow({ mode: 'closed' })
  root.innerHTML = `
    <style>
      :host { all: initial; }
      .wrap {
        position: fixed; inset: 16px 16px auto auto; z-index: 2147483647;
        width: min(380px, calc(100vw - 32px));
        font: 14px/1.5 Inter, system-ui, -apple-system, 'Segoe UI', sans-serif;
        color: #e8eef5; background: #121a23;
        border: 1px solid #e5484d; border-radius: 12px;
        box-shadow: 0 16px 48px rgba(0,0,0,.45); overflow: hidden;
      }
      .head { display: flex; gap: 8px; align-items: center;
              padding: 10px 12px; background: rgba(229,72,77,.16); font-weight: 700; }
      .body { padding: 12px; }
      .name { font-family: ui-monospace, Menlo, monospace; font-size: 12px;
              word-break: break-all; color: #f3b0b2; }
      ul { margin: 10px 0 0; padding-left: 18px; }
      li { margin: 4px 0; color: #b9c7d8; font-size: 13px; }
      .row { display: flex; gap: 8px; padding: 10px 12px; border-top: 1px solid #253244; }
      button { flex: 1; padding: 8px 10px; border-radius: 8px; cursor: pointer;
               font: inherit; font-weight: 600; border: 1px solid #253244;
               background: #18232f; color: #e8eef5; }
      .go { background: transparent; color: #95a6ba; font-weight: 500; }
      .stop { background: #17a673; border-color: #17a673; color: #04140d; }
    </style>
    <div class="wrap" role="alertdialog" aria-labelledby="t">
      <div class="head"><span aria-hidden>✕</span><span id="t">MIF Shield stopped this download</span></div>
      <div class="body">
        <div class="name">${escapeHtml(verdict.subject)}</div>
        <ul>${verdict.signals.slice(0, 3).map((s) => `<li>${escapeHtml(s.evidence)}</li>`).join('')}</ul>
      </div>
      <div class="row">
        <button class="stop" id="stop">Don't download</button>
        <button class="go" id="go">Download anyway</button>
      </div>
    </div>
  `
  root.getElementById('stop').addEventListener('click', () => host.remove())
  root.getElementById('go').addEventListener('click', () => {
    dismissed = true // the user overrode us; do not fight them on the retry
    host.remove()
    window.location.href = href
  })

  document.documentElement.appendChild(host)
}

function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}
