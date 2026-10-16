import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

// Design-token integrity.
const CSS = readFileSync(new URL('../src/ui/styles.css', import.meta.url), 'utf8')

const defined = new Set([...CSS.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)].map((m) => m[1]))

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) return walk(full)
    return /\.(jsx?|css)$/.test(entry) ? [full] : []
  })
}

test('every CSS variable referenced by the UI is defined in the stylesheet', () => {
  const srcDir = new URL('../src', import.meta.url).pathname
  const missing = []

  for (const file of walk(srcDir)) {
    if (file.endsWith('styles.css') || file.endsWith('fonts.css')) continue
    const text = readFileSync(file, 'utf8')
    for (const m of text.matchAll(/var\((--[a-z0-9-]+)/gi)) {
      // Tailwind arbitrary values like rounded-[--radius] also land here, which
      // is the point: those must resolve too.
      if (!defined.has(m[1])) missing.push(`${file.split('/src/')[1]} → ${m[1]}`)
    }
  }

  assert.deepEqual([...new Set(missing)], [], 'undefined CSS variables referenced')
})

test('both themes define every risk tone', () => {
  for (const tone of ['safe', 'caution', 'suspicious', 'danger']) {
    assert.ok(defined.has(`--${tone}`), `--${tone} must be defined`)
    // The light block must override it, or light mode inherits dark colours.
    assert.match(CSS, new RegExp(`:root\\.light[\\s\\S]*?--${tone}\\s*:`),
      `--${tone} must be redefined for the light theme`)
  }
})
