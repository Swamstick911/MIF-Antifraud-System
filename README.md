# MIF Shield

A browser-based digital safety assistant that spots three scams and, more importantly,
explains them in language the person being targeted can act on.

| Shield | Threat | What it actually does |
|---|---|---|
| **Message Shield** | Message bombing | Tells a flood apart from a conversation, then **recovers the real bank alert buried inside the flood** |
| **File Shield** | Disguised downloads | Compares a file's name against its own bytes; catches double extensions, reversed filenames, APKs posing as photos |
| **Call Shield** | Impersonation calls | Names the pressure tactics in the caller's own words, and identifies which scam it matches |

Runs fully offline. No server, no account, no AI API, no telemetry.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173/dashboard.html — the whole product, in a normal tab
```

### Load as a Chrome extension

```bash
npm run build
```

Then `chrome://extensions` → enable **Developer mode** → **Load unpacked** → select the `dist/` folder.

> The dashboard is intentionally identical in both modes. If loading the unpacked extension
> goes wrong during a demo, `npm run dev` shows the same thing — see `src/platform/bridge.js`.

## Demo deep-links

The dashboard is drivable from the URL, so demo states can be bookmarked instead of
clicked together under stage pressure:

| URL | Opens |
|---|---|
| `dashboard.html#messages` | Message Shield |
| `dashboard.html?play=attack#messages` | Message Shield, **attack already running** |
| `dashboard.html?play=friend#messages` | The false-positive test |
| `dashboard.html#calls` | Call Shield, digital-arrest sample loaded |
| `dashboard.html?theme=light` | Force light theme |
| `dashboard.html?scale=1.3&contrast=1` | Force large text + high contrast |

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server with hot reload (web mode) |
| `npm run build` | Build `dist/` — the loadable extension |
| `npm run watch` | Rebuild on save; pair with Chrome's reload button |
| `npm test` | Engine + design-token tests (17) |
| `npm run smoke` | Renders every screen; catches crash-on-paint |
| `npm run check` | test + smoke + build — **run this before you commit** |

## What is real and what is mocked

The brief requires mock data, so the boundary is drawn deliberately:

- **Real:** the entire detection engine (`src/engine/`) — zero dependencies, no network,
  no DOM. Magic-byte file identification, Unicode disguise detection, domain lookalike
  scoring, sliding-window burst analysis, buried-alert recovery, tactic and named-scam
  matching, and the risk model that combines them.
- **Mocked:** the data feed only (`src/mock/`). Every mock record matches the exact shape of
  its real source — a `chrome.downloads.DownloadItem`, a WhatsApp Web DOM node, a transcript
  string. Replacing the feed with a live reader requires no change to the engine.

## Honest limits

These are stated in the product UI too, not just here.

- It cannot promise a file is safe. Its strongest claim is *"no warning signs found"*.
- It does **not** intercept or block phone calls. A browser extension has no access to the
  telephony stack. Call Shield analyses what the caller said; it does not touch the call.
- It never opens, executes or uploads anything it inspects.
