import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Validates dist/ is a loadable MV3 extension. Run after `npm run build`.
const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const has = (p) => existsSync(join(DIST, p))

const built = has('manifest.json')
const manifest = built ? JSON.parse(readFileSync(join(DIST, 'manifest.json'), 'utf8')) : null

test('dist/ exists — run `npm run build` first', () => {
  assert.ok(built, 'dist/manifest.json missing')
})

test('manifest declares MV3 and the required entry points', { skip: !built }, () => {
  assert.equal(manifest.manifest_version, 3)
  assert.ok(manifest.name && manifest.version && manifest.description)
  assert.ok(manifest.action?.default_popup)
  assert.ok(manifest.background?.service_worker)
})

test('every file the manifest references is present', { skip: !built }, () => {
  const referenced = [
    manifest.action.default_popup,
    manifest.background.service_worker,
    ...Object.values(manifest.icons ?? {}),
    ...(manifest.content_scripts ?? []).flatMap((c) => c.js ?? []),
  ]
  for (const file of referenced) {
    assert.ok(has(file), `manifest references missing file: ${file}`)
  }
})

test('html entry points and their assets are emitted', { skip: !built }, () => {
  for (const page of ['popup.html', 'dashboard.html']) {
    assert.ok(has(page), `${page} missing`)
    const html = readFileSync(join(DIST, page), 'utf8')
    for (const m of html.matchAll(/(?:src|href)="\.\/([^"]+)"/g)) {
      assert.ok(has(m[1]), `${page} references missing asset: ${m[1]}`)
    }
    assert.ok(!/(?:src|href)="\//.test(html), `${page} uses root-absolute paths`)
  }
})

test('fonts resolve next to the stylesheet that requests them', { skip: !built }, () => {
  const css = readFileSync(join(DIST, 'assets/styles.css'), 'utf8')
  const urls = [...css.matchAll(/url\(\.\/([^)]+\.woff2)\)/g)].map((m) => m[1])
  assert.ok(urls.length > 0, 'no self-hosted fonts found')
  for (const u of urls) assert.ok(has(join('assets', u)), `missing font: ${u}`)
})

test('extension scripts are self-contained, not ES modules', { skip: !built }, () => {
  for (const file of ['background.js', 'content.js', 'messaging.js']) {
    const src = readFileSync(join(DIST, file), 'utf8')
    assert.ok(!/^\s*import\s.+from\s/m.test(src), `${file} contains a bare import`)
    assert.ok(!/^\s*export\s/m.test(src), `${file} contains an export`)
  }
})

test('permissions are declared for every chrome API the worker uses', { skip: !built }, () => {
  const src = readFileSync(join(DIST, 'background.js'), 'utf8')
  const granted = new Set(manifest.permissions ?? [])
  const needs = { downloads: 'downloads', notifications: 'notifications', contextMenus: 'contextMenus', storage: 'storage' }
  for (const [api, permission] of Object.entries(needs)) {
    if (new RegExp(`chrome\\.${api}\\b`).test(src)) {
      assert.ok(granted.has(permission), `chrome.${api} used without "${permission}" permission`)
    }
  }
})

test('no remote code or remote stylesheets — MV3 forbids both', { skip: !built }, () => {
  for (const page of ['popup.html', 'dashboard.html']) {
    const html = readFileSync(join(DIST, page), 'utf8')
    assert.ok(!/src="https?:/.test(html), `${page} loads a remote script`)
    assert.ok(!/<link[^>]+href="https?:/.test(html), `${page} loads a remote stylesheet`)
  }
  const css = readFileSync(join(DIST, 'assets/styles.css'), 'utf8')
  assert.ok(!/url\(https?:/.test(css), 'stylesheet fetches a remote resource')
})
