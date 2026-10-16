import React from 'react'
import { Divider } from '../components/Bits.jsx'

const SHIELDS = [
  {
    id: 'messages',
    name: 'Message Shield',
    threat: 'message bombing',
    line: 'Hundreds of messages at once, so one real alert scrolls past unseen.',
    does: 'Separates a flood from a conversation by arrival rate, sender variety, unrequested one-time codes and templated wording — then pulls the genuine financial alerts back out of the noise and puts them on top.',
    figure: <MessageFigure />,
  },
  {
    id: 'files',
    name: 'File Shield',
    threat: 'disguised downloads',
    line: 'A file that looks like a photo is a program, or an Android package.',
    does: 'Compares the name against the file’s own first bytes, catches double extensions and the invisible characters used to reverse how a name is drawn, and weighs where it came from.',
    figure: <FileFigure />,
  },
  {
    id: 'calls',
    name: 'Call Shield',
    threat: 'impersonation calls',
    line: 'Someone claiming authority uses fear and secrecy to move your money.',
    does: 'Names the tactics inside the caller’s own words — the authority claim, the threat, the deadline, the demand for secrecy — and identifies which scam in circulation it matches.',
    figure: <CallFigure />,
  },
]

export default function Overview({ onNavigate }) {
  return (
    <div className="space-y-9">
      {/* ── Thesis ──────────────────────────────────────────────────── */}
      <section className="instrument overflow-hidden rounded-[--radius] border px-6 py-9 rule sm:px-9 sm:py-12">
        <p className="label" style={{ color: 'var(--safe)' }}>three attacks · one idea</p>
        <h2 className="display mt-3 max-w-4xl text-[clamp(1.6rem,4.2vw,2.75rem)]">
          Every one of these scams works by overwhelming your judgement —
          <span style={{ color: 'var(--text-3)' }}> with volume, with disguise, or with fear.</span>
        </h2>
        <p className="dim mt-5 max-w-2xl text-[0.98rem] leading-relaxed">
          So each shield does the same two things: it measures something checkable, then
          explains that measurement in language the person being targeted can act on.
          There is no score here without the evidence behind it.
        </p>
      </section>

      {/* ── The three shields ───────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3">
        {SHIELDS.map((s) => (
          <button key={s.id} onClick={() => onNavigate(s.id)}
                  className="card group flex flex-col overflow-hidden text-left transition-colors hover:border-[color:var(--line-strong)]">
            <div className="flex h-24 items-center justify-center border-b px-4 rule"
                 style={{ background: 'var(--surface-2)' }}>
              {s.figure}
            </div>
            <div className="flex flex-1 flex-col p-4">
              <span className="label">{s.threat}</span>
              <h3 className="mt-1.5 text-[1.05rem] font-bold">{s.name}</h3>
              <p className="mt-2 text-[0.88rem] font-medium leading-snug">{s.line}</p>
              <p className="dim mt-2.5 flex-1 text-[0.82rem] leading-relaxed">{s.does}</p>
              <span className="mt-4 text-[0.82rem] font-semibold transition-transform group-hover:translate-x-0.5"
                    style={{ color: 'var(--safe)' }}>
                Open {s.name} →
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* ── What is real ────────────────────────────────────────────── */}
      <div className="space-y-3">
        <Divider>what is real, and what is simulated</Divider>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card p-5">
            <div className="flex items-center gap-2">
              <span className="led" style={{ color: 'var(--safe)' }} aria-hidden />
              <h3 className="text-[0.95rem] font-bold">Real</h3>
            </div>
            <ul className="dim mt-3 space-y-2 text-[0.85rem] leading-relaxed">
              <li>The entire detection engine — pure JavaScript, zero dependencies, no network, no DOM.</li>
              <li>File identification from magic bytes, Unicode disguise detection, domain lookalike scoring.</li>
              <li>Sliding-window burst analysis, and recovery of alerts buried inside a flood.</li>
              <li>Tactic and named-scam matching on call transcripts.</li>
              <li>The risk model that combines independent signals — and never claims certainty.</li>
            </ul>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2">
              <span className="led" style={{ color: 'var(--text-3)' }} aria-hidden />
              <h3 className="text-[0.95rem] font-bold">Simulated</h3>
            </div>
            <ul className="dim mt-3 space-y-2 text-[0.85rem] leading-relaxed">
              <li>The data feed, and nothing else.</li>
              <li>
                Each mock record matches the exact shape of its real source — a Telegram&nbsp;Web
                DOM node, a <code className="mono">chrome.downloads</code> item, a transcript string.
              </li>
              <li>
                Swapping the feed for a live reader requires no change to the engine. That
                boundary was the first thing designed.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Limits ──────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <Divider>what this tool will not do</Divider>
        <ul className="card grid gap-x-8 gap-y-3 p-5 text-[0.85rem] leading-relaxed md:grid-cols-2">
          {[
            'It cannot promise a file is safe. Its strongest claim is “no warning signs found”, which is a different claim.',
            'It does not intercept or block phone calls. A browser extension has no access to the telephony stack, and pretending otherwise would be a lie told to someone relying on it.',
            'It never opens, executes or uploads anything it inspects.',
            'It sends nothing anywhere. No account, no server, no telemetry — which is also why it keeps working with no internet connection.',
          ].map((t) => (
            <li key={t} className="flex gap-2.5">
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full"
                    style={{ background: 'var(--text-3)' }} />
              <span className="dim">{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ── Small diagrammatic figures. Each states its shield's idea in one glance. ── */

function MessageFigure() {
  // A dense flood with one tall marked bar: the alert that was buried.
  const bars = [3, 5, 4, 7, 6, 9, 8, 11, 9, 14, 12, 16, 13, 18, 15, 20, 17, 22, 19, 24]
  return (
    <svg width="150" height="52" viewBox="0 0 150 52" aria-hidden>
      {bars.map((h, i) => (
        <rect key={i} x={i * 7.4} y={44 - h} width="4.4" height={h} rx="1.4"
              fill="var(--text-3)" opacity="0.4" />
      ))}
      <rect x={10 * 7.4 - 0.8} y="6" width="6" height="38" rx="1.8" fill="var(--danger)" />
      <circle cx={10 * 7.4 + 2.2} cy="4" r="3" fill="var(--danger)" />
    </svg>
  )
}

function FileFigure() {
  // The name says one thing; the bytes say another.
  return (
    <svg width="150" height="52" viewBox="0 0 150 52" aria-hidden>
      <rect x="4" y="9" width="62" height="34" rx="5"
            fill="none" stroke="var(--line-strong)" strokeWidth="1.5" />
      <text x="35" y="30" textAnchor="middle" fill="var(--text-2)"
            style={{ font: '600 10px Inter, sans-serif' }}>.jpg</text>
      <path d="M72 26 h12 m-4 -4 l4 4 l-4 4" stroke="var(--text-3)" strokeWidth="1.5"
            fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="90" y="9" width="56" height="34" rx="5"
            fill="color-mix(in srgb, var(--danger) 14%, transparent)"
            stroke="var(--danger)" strokeWidth="1.5" />
      <text x="118" y="30" textAnchor="middle" fill="var(--danger)"
            style={{ font: "700 11px 'JetBrains Mono', monospace" }}>4D 5A</text>
    </svg>
  )
}

function CallFigure() {
  // Speech, with the manipulation underlined.
  return (
    <svg width="150" height="52" viewBox="0 0 150 52" aria-hidden>
      {[
        { y: 12, w: 96, mark: false },
        { y: 24, w: 118, mark: true },
        { y: 36, w: 72, mark: false },
      ].map((r, i) => (
        <g key={i}>
          <rect x="10" y={r.y} width={r.w} height="5.5" rx="2.75"
                fill={r.mark ? 'color-mix(in srgb, var(--danger) 30%, transparent)' : 'var(--text-3)'}
                opacity={r.mark ? 1 : 0.35} />
          {r.mark ? (
            <rect x="10" y={r.y + 7} width={r.w} height="2" rx="1" fill="var(--danger)" />
          ) : null}
        </g>
      ))}
    </svg>
  )
}
