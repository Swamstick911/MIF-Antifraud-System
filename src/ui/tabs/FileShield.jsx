import React, { useMemo, useState } from 'react'
import { analyseFile, identifyMagic } from '../../engine/index.js'
import { SAMPLE_FILES } from '../../mock/files.js'
import RiskMeter from '../components/RiskMeter.jsx'
import SignalList from '../components/SignalList.jsx'
import { Section, MockNote, BandBadge, Divider } from '../components/Bits.jsx'
import { toneOf } from '../tone.js'

// File Shield — the download flowchart from the design document, in code.
export default function FileShield() {
  const [key, setKey] = useState('rtlo')
  const sample = SAMPLE_FILES.find((s) => s.key === key)
  const result = useMemo(() => analyseFile(sample.file), [sample])
  const f = sample.file
  const magic = identifyMagic(f.headerHex)
  const actionTone = toneOf(result.action.tone)

  return (
    <div className="space-y-7">
      <Section
        title="File Shield"
        hint="Checks an attachment against its own contents, its name, and where it came from."
        actions={
          <div className="flex flex-wrap items-center gap-1.5">
            {SAMPLE_FILES.map((s) => (
              <button key={s.key}
                      className={`btn ${key === s.key ? 'btn-active' : ''}`}
                      onClick={() => setKey(s.key)}>
                {s.title}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]">
        {/* ── Verdict ──────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <div className="instrument flex items-center justify-center rounded-[--radius] border px-4 py-6 rule">
            <RiskMeter score={result.score} tone={result.tone} label={result.bandLabel} />
          </div>
          <div className="rounded-[--radius] border px-4 py-3 text-center"
               style={{ borderColor: `color-mix(in srgb, ${actionTone.css} 45%, transparent)`,
                        background: `color-mix(in srgb, ${actionTone.css} 10%, var(--surface-1))` }}>
            <div className="label">recommended action</div>
            <div className="mt-1.5 text-[0.95rem] font-bold leading-snug"
                 style={{ color: actionTone.css }}>
              {result.action.label}
            </div>
          </div>

          <p className="card px-4 py-3.5 text-[0.86rem] leading-relaxed">{sample.note}</p>

          <MockNote>
            Reconstructions of real techniques. In a shipped build these fields come from{' '}
            <code className="mono">chrome.downloads</code> plus the file&rsquo;s first sixteen
            bytes — the engine reading them is identical.
          </MockNote>
        </div>

        {/* ── The exhibit ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="card overflow-hidden">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b px-4 py-2.5 rule">
              <span className="label">file under inspection</span>
              <span className="label ml-auto numeral">{result.sizeLabel}</span>
            </div>

            <div className="px-4 py-3.5">
              <div className="label mb-1.5">name as displayed</div>
              <p className="mono break-all text-[0.95rem] font-semibold leading-snug">
                {result.subject}
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Claim label="claimed type" value={f.declaredMime ?? '—'} />
                <Claim label="actual type" value={result.detectedType}
                       tone={magic && magic.family === 'executable' ? 'danger' : undefined} />
                <Claim label="origin" value={result.host || '—'} />
                <Claim label="delivered by" value={f.senderLabel ?? 'direct download'} />
              </div>
            </div>

            {/* The evidence a judge can check with their own eyes. */}
            <div className="border-t px-4 py-3.5 rule" style={{ background: 'var(--surface-2)' }}>
              <div className="label mb-2">first bytes of the file</div>
              <HexDump headerHex={f.headerHex} magic={magic} />
              {magic ? (
                <p className="dim mt-2.5 text-[0.8rem] leading-relaxed">
                  <span className="mono font-bold" style={{ color: 'var(--danger)' }}>
                    {magic.hex.replace(/(.{2})/g, '$1 ').trim()}
                  </span>{' '}
                  is the signature for <strong>{magic.label}</strong>. A file cannot lie about
                  this the way it can lie about its name.
                </p>
              ) : (
                <p className="dim2 mt-2.5 text-[0.8rem]">No recognisable signature.</p>
              )}
            </div>
          </div>

          {result.pattern ? (
            <div className="rounded-[--radius] border px-4 py-3.5"
                 style={{ borderColor: 'var(--danger)',
                          background: 'color-mix(in srgb, var(--danger) 7%, var(--surface-1))' }}>
              <BandBadge tone="danger">known technique</BandBadge>
              <h3 className="mt-2 text-[1.02rem] font-bold">
                {PATTERN_NAMES[result.pattern] ?? result.pattern}
              </h3>
              <p className="dim mt-1.5 text-[0.86rem] leading-relaxed">
                {PATTERN_NOTES[result.pattern]}
              </p>
            </div>
          ) : null}

          <div className="space-y-3 pt-1">
            <Divider>analysis</Divider>
            <SignalList
              signals={result.signals}
              emptyNote="No warning signs found. The contents match the name, the size is ordinary and the origin is known. That is not a guarantee of safety — it means nothing checkable looked wrong."
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function Claim({ label, value, tone }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="mt-1 break-words text-[0.86rem] font-medium"
           style={tone ? { color: `var(--${tone})` } : { color: 'var(--text-2)' }}>
        {value}
      </div>
    </div>
  )
}

/** Byte grid with the identifying signature called out. */
function HexDump({ headerHex = '', magic }) {
  const bytes = (headerHex.match(/.{1,2}/g) ?? []).slice(0, 16)
  const magicLen = magic ? magic.hex.length / 2 : 0
  if (bytes.length === 0) return <p className="dim2 mono text-[0.8rem]">unavailable</p>

  return (
    <div className="flex flex-wrap gap-1">
      {bytes.map((b, i) => {
        const isMagic = i < magicLen
        return (
          <span key={i}
                className="mono rounded px-1.5 py-1 text-[0.82rem] font-semibold"
                style={{
                  background: isMagic ? 'var(--danger)' : 'var(--surface-3)',
                  color: isMagic ? '#0A0406' : 'var(--text-3)',
                  border: `1px solid ${isMagic ? 'var(--danger)' : 'var(--line)'}`,
                }}>
            {b.toUpperCase()}
          </span>
        )
      })}
    </div>
  )
}

const PATTERN_NAMES = {
  'rtlo-disguise': 'Right-to-left override disguise',
  'double-extension': 'Double extension',
  'archive-as-image': 'Android package disguised as a photo',
  'masquerading-executable': 'Executable wearing a document’s name',
}

const PATTERN_NOTES = {
  'rtlo-disguise':
    'A single invisible Unicode character reverses how the rest of the name is drawn, so an executable displays as an image in every file manager and chat app on earth.',
  'double-extension':
    'Windows hides known file extensions by default, so only the first one is visible. The last extension is the one that decides what the file does.',
  'archive-as-image':
    'Android app packages are ZIP archives. Sending one named .jpg is the standard delivery route for banking-trojan APKs over WhatsApp.',
  'masquerading-executable':
    'The leading bytes identify a program while the name claims a document. The name is a claim; the bytes are the truth.',
}
