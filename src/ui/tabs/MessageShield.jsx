import React, { useEffect, useMemo, useRef, useState } from 'react'
import { detectBombing, isOtp } from '../../engine/index.js'
import { bombingBurst, calmInbox, chattyFriend, resetIds } from '../../mock/messages.js'
import RiskMeter from '../components/RiskMeter.jsx'
import FloodTape from '../components/FloodTape.jsx'
import SignalList from '../components/SignalList.jsx'
import { Stat, Section, MockNote, Divider } from '../components/Bits.jsx'

// Message Shield.

const SCENARIOS = [
  { key: 'calm', label: 'Normal inbox', build: (now) => calmInbox(now), speed: 0 },
  { key: 'friend', label: 'Chatty friend', build: (now) => chattyFriend(now), speed: 55 },
  { key: 'attack', label: 'OTP bombing attack', build: (now) => bombingBurst({ now }), speed: 42 },
]

export default function MessageShield() {
  const [scenario, setScenario] = useState('calm')
  const [shown, setShown] = useState([])
  const [running, setRunning] = useState(false)
  const timer = useRef(null)
  const feedRef = useRef(null)

  const result = useMemo(() => detectBombing(shown, { now: Date.now() }), [shown])

  useEffect(() => () => clearInterval(timer.current), [])

  // Open with the calm inbox already loaded.
  useEffect(() => {
    const wanted =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('play')
        : null
    if (wanted && SCENARIOS.some((c) => c.key === wanted)) {
      play(wanted)
      return
    }
    resetIds()
    setShown(calmInbox(Date.now()))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function play(key) {
    clearInterval(timer.current)
    resetIds()
    setScenario(key)
    const config = SCENARIOS.find((s) => s.key === key)
    const all = config.build(Date.now())

    if (config.speed === 0) {
      setShown(all)
      setRunning(false)
      return
    }
    setShown([])
    setRunning(true)
    let i = 0
    timer.current = setInterval(() => {
      // Re-stamp arrivals to "now" so the sliding windows see a live burst.
      const batch = all.slice(i, i + 3).map((m) => ({ ...m, timestamp: Date.now() }))
      i += 3
      setShown((prev) => [...prev, ...batch])
      if (i >= all.length) {
        clearInterval(timer.current)
        setRunning(false)
      }
    }, config.speed)
  }

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight
  }, [shown.length])

  const s = result.stats

  return (
    <div className="space-y-7">
      <Section
        title="Message Shield"
        hint="Tells a flood apart from a conversation — then recovers what the flood was hiding."
        actions={
          <div className="flex flex-wrap items-center gap-1.5">
            {SCENARIOS.map((c) => (
              <button key={c.key}
                      className={`btn ${scenario === c.key ? 'btn-active' : ''}`}
                      onClick={() => play(c.key)}>
                {c.label}
              </button>
            ))}
            {running ? (
              <button className="btn btn-stop" onClick={() => { clearInterval(timer.current); setRunning(false) }}>
                Stop
              </button>
            ) : null}
          </div>
        }
      />

      {/* ── Instrument hero ─────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]">
        <div className="instrument flex items-center justify-center rounded-[--radius] border px-4 py-6 rule">
          <RiskMeter
            score={result.score}
            tone={result.tone}
            label={result.bandLabel}
            live={running}
            sub={running ? 'messages arriving now' : `${s.total} messages in the last 5 minutes`}
          />
        </div>

        <div className="flex flex-col gap-4">
          <FloodTape messages={shown} buried={result.buriedAlerts} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="last 10 s" value={s.counts['10s'] ?? 0} hint="typical: under 4"
                  tone={(s.counts['10s'] ?? 0) > 8 ? 'danger' : undefined} />
            <Stat label="last 60 s" value={s.counts['60s'] ?? 0} hint="typical: under 12"
                  tone={(s.counts['60s'] ?? 0) > 25 ? 'danger' : undefined} />
            <Stat label="senders" value={s.distinctSenders} hint="distinct, in window" />
            <Stat label="are OTPs" value={`${Math.round((s.otpShare ?? 0) * 100)}%`}
                  hint="unrequested codes"
                  tone={s.otpShare > 0.5 ? 'danger' : s.otpShare > 0.25 ? 'caution' : undefined} />
          </div>
        </div>
      </div>

      {/* ── The recovered alert: the point of the whole feature ─────── */}
      {result.buriedAlerts.length > 0 ? (
        <section className="overflow-hidden rounded-[--radius] border"
                 style={{ borderColor: 'var(--danger)',
                          background: 'color-mix(in srgb, var(--danger) 7%, var(--surface-1))' }}>
          <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b px-4 py-2.5"
                  style={{ borderColor: 'color-mix(in srgb, var(--danger) 35%, transparent)' }}>
            <span className="led led-live" style={{ color: 'var(--danger)' }} aria-hidden />
            <h3 className="text-[0.95rem] font-bold">Recovered from the flood — read this first</h3>
            <span className="label ml-auto" style={{ color: 'var(--danger)' }}>
              {result.buriedAlerts.length} found among {s.total}
            </span>
          </header>
          <ul className="divide-y" style={{ borderColor: 'color-mix(in srgb, var(--danger) 22%, transparent)' }}>
            {result.buriedAlerts.map((a) => (
              <li key={a.id} className="px-4 py-3.5">
                <div className="flex flex-wrap items-baseline gap-x-2.5">
                  <span className="text-[0.9rem] font-semibold">{a.senderLabel}</span>
                  <span className="label numeral">{new Date(a.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="mt-1.5 text-[1rem] leading-snug">{a.text}</p>
                <p className="dim2 mt-2 text-[0.74rem]">
                  surfaced because it mentions {a.reasons.join(', ')}
                </p>
              </li>
            ))}
          </ul>
          <p className="dim border-t px-4 py-3 text-[0.84rem] leading-relaxed"
             style={{ borderColor: 'color-mix(in srgb, var(--danger) 22%, transparent)' }}>
            The flood exists so this message scrolls past unseen. If you did not make this
            transaction, call the number printed on your card — never a number from these messages.
          </p>
        </section>
      ) : null}

      {/* ── Evidence + raw feed ─────────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          <Divider>analysis</Divider>
          <SignalList
            signals={result.signals}
            emptyNote="Nothing unusual. Arrival rate, sender variety and message content all look like ordinary conversation."
          />
          <MockNote>
            Generated locally in the shape a WhatsApp&nbsp;Web or Telegram&nbsp;Web content script
            reads off the page. The engine is real and unmodified — only the feed is simulated.
          </MockNote>
        </div>

        <div className="space-y-3">
          <Divider>incoming · {shown.length}</Divider>
          <p className="label flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--safe)' }} />known
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--text-3)' }} />unknown
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--danger)' }} />one-time code
            </span>
          </p>
          <div ref={feedRef} className="scroll-slim card max-h-[26rem] overflow-y-auto">
            {shown.length === 0 ? (
              <p className="dim2 p-4 text-[0.85rem]">Choose a scenario above to begin.</p>
            ) : (
              <ul className="divide-y rule">
                {shown.slice(-70).map((m) => {
                  const otp = isOtp(m.text)
                  return (
                    <li key={m.id} className="flex items-baseline gap-2.5 px-3 py-[7px]">
                      <span aria-hidden className="h-1.5 w-1.5 shrink-0 translate-y-[-1px] rounded-full"
                            title={otp ? 'one-time code' : m.knownContact ? 'known contact' : 'unknown sender'}
                            style={{ background: otp ? 'var(--danger)' : m.knownContact ? 'var(--safe)' : 'var(--text-3)' }} />
                      <span className="shrink-0 truncate text-[0.76rem] font-semibold"
                            style={{ width: '5.75rem',
                                     color: m.knownContact ? 'var(--text-1)' : 'var(--text-3)' }}>
                        {m.senderLabel}
                      </span>
                      <span className="dim min-w-0 flex-1 truncate text-[0.8rem]">{m.text}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
