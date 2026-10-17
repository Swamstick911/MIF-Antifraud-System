import React, { useMemo, useState } from 'react'
import { analyseTranscript, analyseFile } from '../engine/index.js'
import { CHECKER_EXAMPLES } from './data.js'

// The design mocked this as static. It runs the real engine instead — on-device,
// nothing submitted — which is both more useful and still honest.
const TABS = [
  { id: 'message', label: 'Message', prompt: 'The message you received' },
  { id: 'link', label: 'Download link', prompt: 'The link or file name' },
  { id: 'phone', label: 'Phone number', prompt: 'The number that called you' },
]

const PLACEHOLDER = {
  message: '“This is your bank. Your account will be blocked in 10 minutes. Share your OTP now to keep it active.”',
  link: 'https://example.com/your-prize/photo.jpg.apk',
  phone: '+91 98XXX XXXXX',
}

export default function Checker() {
  const [tab, setTab] = useState('message')
  const [value, setValue] = useState('')
  const [checked, setChecked] = useState(false)

  const result = useMemo(() => {
    if (!checked || !value.trim()) return null
    if (tab === 'message') return fromVerdict(analyseTranscript(value))
    if (tab === 'link') return fromVerdict(analyseFile(fileFromUrl(value)))
    return checkPhone(value)
  }, [checked, tab, value])

  const examples = CHECKER_EXAMPLES[tab] ?? []

  function switchTab(id) {
    setTab(id)
    setValue('')
    setChecked(false)
  }

  return (
    <div className="card stack-dark border-2 border-[color:var(--ink)] p-5 sm:p-7">
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => switchTab(t.id)}
                  aria-pressed={tab === t.id}
                  className="rounded-full px-4 py-2.5 text-[0.9rem] font-bold transition"
                  style={tab === t.id
                    ? { background: 'var(--violet)', color: '#fff' }
                    : { background: '#F1F1F6', color: 'var(--ink)' }}>
            {t.label}
          </button>
        ))}
        <span className="ml-auto rounded-full px-3 py-1.5 text-[0.75rem] font-bold"
              style={{ background: 'var(--amber-soft)', color: '#7A5600' }}>
          Runs on your device
        </span>
      </div>

      <label htmlFor="checker" className="mt-5 block text-[0.95rem] font-bold">
        {TABS.find((t) => t.id === tab).prompt}
      </label>

      <textarea
        id="checker"
        rows={tab === 'message' ? 5 : 2}
        value={value}
        onChange={(e) => { setValue(e.target.value); setChecked(false) }}
        placeholder={PLACEHOLDER[tab]}
        className="mt-2 w-full resize-y rounded-2xl p-4 text-[0.95rem] leading-relaxed"
        style={{ background: '#F7F7FA', border: '1px solid var(--line)' }}
      />
      <p className="mt-2 text-[0.8rem]" style={{ color: 'var(--muted)' }}>
        Never include a real OTP, password or account number.
      </p>

      {examples.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[0.85rem]" style={{ color: 'var(--muted)' }}>Try an example:</span>
          {examples.map((ex) => (
            <button key={ex.label}
                    onClick={() => { setValue(ex.value); setChecked(false) }}
                    className="rounded-full px-3.5 py-2 text-[0.82rem] font-bold"
                    style={{ background: '#F1F1F6' }}>
              {ex.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-4 border-t pt-5"
           style={{ borderColor: 'var(--line)' }}>
        <p className="flex-1 text-[0.82rem]" style={{ color: 'var(--muted)' }}>
          Nothing is uploaded. The check happens in this browser tab.
        </p>
        <button className="pill pill-violet" onClick={() => setChecked(true)} disabled={!value.trim()}
                style={!value.trim() ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}>
          Preview warning signs →
        </button>
      </div>

      {result ? <Result result={result} /> : null}
    </div>
  )
}

function Result({ result }) {
  const color = result.tone === 'danger' ? 'var(--red)'
    : result.tone === 'suspicious' ? '#C2410C'
    : result.tone === 'caution' ? '#8A6100'
    : '#0F7A52'
  const bg = result.tone === 'danger' ? 'var(--red-soft)'
    : result.tone === 'suspicious' ? '#FDEBDD'
    : result.tone === 'caution' ? 'var(--amber-soft)'
    : '#DFF5EA'

  return (
    <div className="mt-5 rounded-2xl p-5" style={{ background: bg }}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-[1.3rem] font-extrabold" style={{ color }}>{result.headline}</span>
        {result.score != null ? (
          <span className="text-[0.85rem] font-bold" style={{ color }}>
            {result.score} / 100 warning score
          </span>
        ) : null}
      </div>

      {result.named ? (
        <p className="mt-2 text-[0.95rem] font-semibold">{result.named}</p>
      ) : null}

      {result.signals.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {result.signals.map((s, i) => (
            <li key={i} className="rounded-xl bg-white/70 px-3.5 py-2.5">
              <span className="block text-[0.9rem] font-bold">{s.label}</span>
              <span className="mt-0.5 block text-[0.85rem]" style={{ color: 'var(--muted)' }}>
                {s.evidence}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-[0.9rem]" style={{ color: 'var(--muted)' }}>
          Nothing here matched a known warning sign. That is not the same as proof it is safe —
          if it still feels wrong, check with someone you trust.
        </p>
      )}

      <p className="mt-4 text-[0.85rem] font-semibold">{result.advice}</p>
    </div>
  )
}

function fromVerdict(v) {
  return {
    tone: v.tone,
    score: v.score,
    headline: v.score >= 75 ? 'Strong warning signs'
      : v.score >= 50 ? 'Several warning signs'
      : v.score >= 25 ? 'Worth a second look'
      : 'No warning signs found',
    named: v.namedScam ? `This matches ${v.namedScam.name}.` : null,
    signals: v.signals.slice(0, 4).map((s) => ({ label: s.label, evidence: s.evidence })),
    advice: v.score >= 50
      ? 'Don’t reply, pay or open anything. Verify on a number you look up yourself, and call 1930 if money has moved.'
      : 'Still pause before you act. Verify using a number you look up yourself, never one you were given.',
  }
}

// Parse a pasted URL into the shape the file analyser expects.
function fileFromUrl(raw) {
  const url = raw.trim()
  let filename = url
  try {
    const path = new URL(url.startsWith('http') ? url : `https://${url}`).pathname
    filename = decodeURIComponent(path.split('/').filter(Boolean).pop() ?? '') || 'download'
  } catch {
    filename = url.split('/').pop() ?? url
  }
  return { filename, sourceUrl: url.startsWith('http') ? url : `https://${url}` }
}

// A number on its own proves very little, and caller ID is trivially spoofed.
// The honest answer is to say so rather than invent a verdict.
function checkPhone(raw) {
  const digits = raw.replace(/\D/g, '')
  const signals = []

  if (digits.length && digits.length < 10) {
    signals.push({
      label: 'Short code, not a normal number',
      evidence: 'Shortcodes are used for bulk sending and cannot be called back.',
    })
  }
  if (/^\+?(?!91)\d{1,3}/.test(raw.trim()) && !raw.trim().startsWith('+91') && raw.trim().startsWith('+')) {
    signals.push({
      label: 'International number',
      evidence: 'An overseas number claiming to be an Indian bank, police force or courier is a warning sign.',
    })
  }

  return {
    tone: signals.length ? 'caution' : 'safe',
    score: null,
    headline: signals.length ? 'Treat this number carefully' : 'A number alone cannot be checked',
    named: null,
    signals,
    advice:
      'Caller ID can be faked, so no number proves who is calling. Hang up and call back on a number printed on your card or on the organisation’s official website.',
  }
}
