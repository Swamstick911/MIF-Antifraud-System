import React, { useEffect, useMemo, useState } from 'react'
import { analyseTranscript } from '../../engine/index.js'
import { SAMPLE_TRANSCRIPTS } from '../../mock/transcripts.js'
import RiskMeter from '../components/RiskMeter.jsx'
import SignalList from '../components/SignalList.jsx'
import { Section, MockNote, BandBadge, Divider } from '../components/Bits.jsx'
import { takePendingTranscript } from '../../platform/bridge.js'

// Call Shield.
export default function CallShield() {
  const [text, setText] = useState(SAMPLE_TRANSCRIPTS[0].text)
  const [activeKey, setActiveKey] = useState(SAMPLE_TRANSCRIPTS[0].key)
  const result = useMemo(() => analyseTranscript(text), [text])
  const [fromSelection, setFromSelection] = useState(false)

  // Text handed over by the "Check this message with MIF Shield" right-click item.
  useEffect(() => {
    takePendingTranscript().then((incoming) => {
      if (!incoming) return
      setText(incoming)
      setActiveKey(null)
      setFromSelection(true)
    })
  }, [])

  // Stable footnote numbering, ordered by first appearance in the transcript.
  const legend = useMemo(() => {
    const order = []
    for (const h of result.highlights) {
      if (!order.some((o) => o.id === h.tacticId)) {
        order.push({ id: h.tacticId, label: h.tacticLabel, count: 0 })
      }
    }
    for (const h of result.highlights) {
      order.find((o) => o.id === h.tacticId).count++
    }
    return order
  }, [result.highlights])

  const indexOf = (tacticId) => legend.findIndex((l) => l.id === tacticId) + 1

  return (
    <div className="space-y-7">
      <Section
        title="Call Shield"
        hint="Paste what the caller said. The manipulation gets named, in their own words."
        actions={
          <div className="flex flex-wrap items-center gap-1.5">
            {SAMPLE_TRANSCRIPTS.map((s) => (
              <button key={s.key}
                      className={`btn ${activeKey === s.key ? 'btn-active' : ''}`}
                      onClick={() => { setText(s.text); setActiveKey(s.key) }}>
                {s.title}
              </button>
            ))}
            <button className="btn" onClick={() => { setText(''); setActiveKey(null) }}>Clear</button>
          </div>
        }
      />

      {fromSelection ? (
        <p className="rounded-[--radius-sm] border px-3.5 py-2.5 text-[0.82rem] rule"
           style={{ borderColor: 'color-mix(in srgb, var(--safe) 45%, transparent)',
                    background: 'color-mix(in srgb, var(--safe) 8%, var(--surface-1))' }}>
          Analysing the message you selected. Nothing was sent anywhere — it was read
          straight from the page into this tab.
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]">
        <div className="instrument flex items-center justify-center rounded-[--radius] border px-4 py-6 rule">
          <RiskMeter
            score={result.score}
            tone={result.inconclusive ? 'caution' : result.tone}
            label={result.bandLabel}
            sub={result.inconclusive
              ? 'add more of what was said'
              : `${result.tacticCount} pressure tactic${result.tacticCount === 1 ? '' : 's'} identified`}
          />
        </div>

        {result.namedScam ? (
          <div className="rounded-[--radius] border p-5"
               style={{ borderColor: 'var(--danger)',
                        background: 'color-mix(in srgb, var(--danger) 7%, var(--surface-1))' }}>
            <BandBadge tone="danger">recognised scam</BandBadge>
            <h3 className="display mt-2.5 text-[1.45rem]">
              This matches {result.namedScam.name}.
            </h3>
            <p className="dim mt-2 max-w-3xl text-[0.9rem] leading-relaxed">
              {result.namedScam.summary}
            </p>
            <ul className="mt-4 grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(15rem,1fr))]">
              {result.truths.map((t) => (
                <li key={t} className="flex gap-2.5 rounded-[--radius-sm] border px-3 py-2.5 rule"
                    style={{ background: 'var(--surface-1)' }}>
                  <span aria-hidden className="mt-[3px] shrink-0 text-[0.8rem]"
                        style={{ color: 'var(--safe)' }}>✓</span>
                  <span className="text-[0.84rem] leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="card flex flex-col justify-center p-5">
            <h3 className="text-[1.05rem] font-semibold">
              {result.inconclusive ? 'Not enough to judge yet' : 'No known scam pattern matched'}
            </h3>
            <p className="dim mt-2 max-w-2xl text-[0.88rem] leading-relaxed">
              {result.inconclusive
                ? 'Add what the caller asked you to do, and anything they told you not to do. Those two things carry most of the signal.'
                : 'Nothing here matches a scam in circulation. If it still feels wrong, that instinct is worth acting on — hang up and call back on a number you look up yourself.'}
            </p>
          </div>
        )}
      </div>

      {/* ── Annotated transcript: the heart of the screen ───────────── */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="space-y-3">
          <Divider>the call, annotated</Divider>
          {legend.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {legend.map((l, i) => (
                <li key={l.id}
                    className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 rule"
                    style={{ background: 'var(--surface-1)' }}>
                  <span className="numeral flex h-4 w-4 items-center justify-center rounded-full text-[0.62rem] font-bold"
                        style={{ background: 'var(--danger)', color: '#0A0406' }}>{i + 1}</span>
                  <span className="text-[0.76rem] font-medium">{l.label}</span>
                  <span className="label numeral">×{l.count}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <Annotated text={text} highlights={result.highlights} indexOf={indexOf} />

          <details className="card px-4 py-3">
            <summary className="cursor-pointer text-[0.86rem] font-medium">
              Edit or paste a different call
            </summary>
            <textarea
              value={text}
              onChange={(e) => { setText(e.target.value); setActiveKey(null) }}
              rows={9}
              aria-label="Call transcript"
              placeholder="Type or paste what the caller said — in your own words if you need to. You can do this while the call is still going."
              className="scroll-slim mt-3 w-full resize-y rounded-[--radius-sm] border p-3 text-[0.85rem] leading-relaxed rule"
              style={{ background: 'var(--surface-2)', color: 'var(--text-1)' }}
            />
            <p className="label mt-2">nothing you type leaves this device</p>
          </details>
        </div>

        {/* ── What to do ──────────────────────────────────────────── */}
        <div className="space-y-3">
          <Divider>what to do now</Divider>
          <ol className="card divide-y overflow-hidden rule">
            {result.steps.map((s, i) => (
              <li key={s.title} className="flex gap-3 px-3.5 py-3">
                <span aria-hidden
                      className="numeral mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.75rem] font-bold"
                      style={{ background: 'var(--surface-3)', color: 'var(--safe)',
                               boxShadow: 'inset 0 0 0 1px var(--line-strong)' }}>
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.88rem] font-semibold">{s.title}</span>
                  <span className="dim mt-1 block text-[0.82rem] leading-relaxed">{s.body}</span>
                </span>
              </li>
            ))}
          </ol>

          <div className="rounded-[--radius] border px-4 py-3.5"
               style={{ borderColor: 'color-mix(in srgb, var(--safe) 45%, transparent)',
                        background: 'color-mix(in srgb, var(--safe) 8%, var(--surface-1))' }}>
            <div className="label">national cybercrime helpline</div>
            <div className="numeral mt-1 text-[2rem] font-bold leading-none"
                 style={{ color: 'var(--safe)' }}>1930</div>
            <p className="dim mt-2 text-[0.78rem] leading-relaxed">
              Or file at cybercrime.gov.in. If money has already been sent, report within the
              first few hours — transfers can sometimes be frozen before they are withdrawn.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          <Divider>analysis</Divider>
          <SignalList
            signals={result.signals}
            emptyNote={result.inconclusive
              ? 'Not enough detail yet to judge.'
              : 'No pressure tactics found in what you entered.'}
          />
        </div>
        <div className="space-y-3">
          <Divider>how this works</Divider>
          <p className="card px-4 py-3.5 text-[0.86rem] leading-relaxed">
            Seven tactics are matched independently — the authority claim, the threat, the
            deadline, the demand for secrecy, the request for money, the request for codes or
            remote access, and discouragement from verifying. A scam is named only when the
            right <em>combination</em> appears together with its own distinguishing details, so
            a bank-impersonation call and a KYC call resolve differently despite sharing most
            of their words.
          </p>
          <MockNote>
            Runs entirely on-device with no AI service and no network request — the same
            analysis works in airplane mode.
          </MockNote>
        </div>
      </div>
    </div>
  )
}

// Render the transcript with each matched span marked and footnoted.
function Annotated({ text, highlights, indexOf }) {
  if (!text.trim()) {
    return <p className="card dim2 px-4 py-6 text-center text-[0.85rem]">Nothing to analyse yet.</p>
  }

  const parts = []
  let cursor = 0
  for (const h of highlights) {
    if (h.start > cursor) parts.push({ text: text.slice(cursor, h.start) })
    parts.push({ text: text.slice(h.start, h.end), tactic: h })
    cursor = h.end
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor) })

  return (
    <div className="scroll-slim card max-h-[32rem] overflow-y-auto whitespace-pre-wrap px-5 py-4 text-[0.92rem] leading-[1.95]">
      {parts.map((p, i) =>
        p.tactic ? (
          <mark key={i}
                title={p.tactic.tacticLabel}
                className="rounded-[3px] px-[3px] font-semibold"
                style={{
                  background: 'color-mix(in srgb, var(--danger) 20%, transparent)',
                  color: 'var(--text-1)',
                  boxShadow: 'inset 0 -2px 0 var(--danger)',
                }}>
            {p.text}
            <sup className="numeral ml-[2px] text-[0.62em] font-bold"
                 style={{ color: 'var(--danger)' }}>
              {indexOf(p.tactic.tacticId)}
            </sup>
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </div>
  )
}
