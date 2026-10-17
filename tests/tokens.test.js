import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

// An undefined CSS variable fails silently - var(--gone) just inherits the
// parent colour. This makes that loud. Each surface is checked against its own
// stylesheet, since the dashboard and the public site have separate tokens.
const SRC = new URL('../src', import.meta.url).pathname
const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8')

const SURFACES = [
  { name: 'dashboard', css: '../src/ui/styles.css', dirs: ['ui', 'platform', 'background', 'content', 'engine', 'mock'] },
  { name: 'site', css: '../src/site/site.css', dirs: ['site'] },
]

const definedIn = (css) =>
  new Set([...css.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)].map((m) => m[1]))

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) return walk(full)
    return /\.(jsx?|css)$/.test(entry) ? [full] : []
  })
}

for (const surface of SURFACES) {
  test(`${surface.name}: every CSS variable referenced is defined`, () => {
    const defined = definedIn(read(surface.css))
    const missing = []

    for (const dir of surface.dirs) {
      for (const file of walk(join(SRC, dir))) {
        if (/styles\.css$|site\.css$|fonts\.css$/.test(file)) continue
        for (const m of readFileSync(file, 'utf8').matchAll(/var\((--[a-z0-9-]+)/gi)) {
          if (!defined.has(m[1])) missing.push(`${file.split('/src/')[1]} → ${m[1]}`)
        }
      }
    }
    assert.deepEqual([...new Set(missing)], [], 'undefined CSS variables referenced')
  })
}

test('both dashboard themes define every risk tone', () => {
  const css = read('../src/ui/styles.css')
  const defined = definedIn(css)
  for (const tone of ['safe', 'caution', 'suspicious', 'danger']) {
    assert.ok(defined.has(`--${tone}`), `--${tone} must be defined`)
    assert.match(css, new RegExp(`:root\\.light[\\s\\S]*?--${tone}\\s*:`),
      `--${tone} must be redefined for the light theme`)
  }
})
