import React from 'react'
import Checker from './Checker.jsx'
import { LOOK_LIKE, DEFENCES, RED_FLAGS, GOLDEN_RULES, PANIC_STEPS, PRACTICE } from './data.js'

export default function Site() {
  return (
    <>
      <Nav />
      <Hero />
      <LookLike />
      <CheckSection />
      <Defences />
      <RedFlags />
      <SpotTheFlag />
      <GoldenRules />
      <DontPanic />
      <Footer />
    </>
  )
}

function Logo({ dark = false }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: 'var(--lime)' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 2.5 20.5 5.8v6.6c0 5-3.9 8.6-8.5 9.9-4.6-1.3-8.5-4.9-8.5-9.9V5.8z"
                stroke="#15141D" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M8.6 12.2l2.6 2.6 4.6-5" stroke="#15141D" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span>
        <span className="block text-[1.3rem] font-extrabold leading-none"
              style={{ color: dark ? '#fff' : 'var(--ink)' }}>MIF</span>
        <span className="block text-[0.62rem] font-bold uppercase tracking-[0.14em]"
              style={{ color: dark ? '#9A98A8' : 'var(--muted)' }}>anti-fraud system</span>
      </span>
    </span>
  )
}

function Nav() {
  const links = [
    ['Check something', '#check'],
    ['How MIF helps', '#defences'],
    ['Red flags', '#flags'],
    ['I need help', '#help'],
  ]
  return (
    <header className="sticky top-0 z-40 border-b backdrop-blur"
            style={{ borderColor: 'rgba(255,255,255,.12)', background: 'rgba(32,30,42,.82)' }}>
      <div className="wrap flex items-center gap-6 py-3.5">
        <a href="#top" className="shrink-0"><Logo dark /></a>
        <nav className="mx-auto hidden items-center gap-7 md:flex">
          {links.map(([label, href]) => (
            <a key={href} href={href} className="text-[0.92rem] font-semibold"
               style={{ color: '#C9C7D4' }}>{label}</a>
          ))}
        </nav>
        <a href="#practice" className="pill pill-lime ml-auto md:ml-0">Play the game</a>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden"
             style={{ background: 'linear-gradient(160deg,#2B2936 0%,#45414F 55%,#565263 100%)' }}>
      <div className="wrap grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_minmax(0,22rem)] lg:py-24">
        <div>
          <span className="inline-block rounded-full px-4 py-2 text-[0.82rem] font-bold"
                style={{ background: 'var(--ink)', color: 'var(--lime)' }}>
            A little pause. A lot more protection.
          </span>

          <h1 className="mt-6 font-extrabold tracking-[-0.035em] text-white"
              style={{ fontSize: 'clamp(2.6rem,7vw,4.6rem)', lineHeight: 1.03 }}>
            Strange message?<br />Scary call?<br />
            <span className="mt-2 inline-block px-3 py-0.5"
                  style={{ background: 'var(--lime)', color: 'var(--ink)' }}>
              Not today.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed" style={{ color: '#D7D5E0' }}>
            Meet MIF. Learn the signs of message floods, risky downloads and fake calls —
            before you act.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#check" className="pill pill-lime">Check something suspicious ↗</a>
            <a href="#practice" className="pill pill-ghost" style={{ color: '#fff' }}>Spot the scam</a>
          </div>

          <p className="mt-6 text-[0.82rem]" style={{ color: '#A8A5B6' }}>
            No login · Learning and advice · Not a live security service
          </p>
        </div>

        <PhoneMock />
      </div>
    </section>
  )
}

function PhoneMock() {
  const flags = [
    { text: 'A sudden message flood', top: '14%', side: { right: '92%' } },
    { text: 'A file in disguise', top: '44%', side: { left: '88%' } },
    { text: 'Fear + secrecy = red flag', top: '70%', side: { right: '92%' } },
  ]
  return (
    <div className="relative mx-auto w-full max-w-[20rem]">
      <div className="rounded-[2.4rem] border-[7px] p-3 shadow-2xl"
           style={{ borderColor: '#211F2B', background: '#fff' }}>
        <div className="mb-3 flex items-center justify-between px-1 text-[0.7rem] font-bold">
          <span>9:41</span>
          <span className="h-1.5 w-14 rounded-full" style={{ background: '#211F2B' }} />
          <span>▮</span>
        </div>

        <div className="flex items-center gap-2 pb-3">
          <span className="grid h-8 w-8 place-items-center rounded-full text-[0.8rem] font-bold"
                style={{ background: 'var(--violet-soft)', color: 'var(--violet)' }}>?</span>
          <span>
            <span className="block text-[0.85rem] font-bold leading-tight">Unknown senders</span>
            <span className="block text-[0.72rem]" style={{ color: 'var(--muted)' }}>Not in your contacts</span>
          </span>
        </div>

        <p className="rounded-lg px-2.5 py-1.5 text-[0.72rem] font-bold"
           style={{ background: 'var(--pink-tint)', color: 'var(--red)' }}>
          18 messages in 1 minute
        </p>

        {[
          { meta: 'SMS · JUST NOW', body: 'Your OTP is ••••••. Another OTP. And another…' },
          { meta: 'UNKNOWN CONTACT', body: 'Your reward is ready! Open prize.jpg.apk to claim.' },
          { meta: 'INCOMING CALL', body: '“This is the police. Transfer money now. Tell no one.”' },
        ].map((m) => (
          <div key={m.meta} className="mt-2 rounded-xl p-2.5" style={{ background: '#F5F5F9' }}>
            <span className="block text-[0.6rem] font-bold tracking-wide" style={{ color: 'var(--muted)' }}>
              {m.meta}
            </span>
            <span className="mt-0.5 block text-[0.82rem] leading-snug">{m.body}</span>
          </div>
        ))}

        <div className="mt-3 flex justify-end">
          <span className="rounded-full px-3.5 py-2 text-[0.8rem] font-bold text-white"
                style={{ background: 'var(--violet)' }}>Pause. Let me check.</span>
        </div>
      </div>

      {flags.map((f) => (
        <span key={f.text}
              className="absolute hidden whitespace-nowrap rounded-lg bg-white px-3 py-2 text-[0.75rem] font-bold shadow-lg lg:flex lg:items-center lg:gap-1.5"
              style={{ top: f.top, ...f.side, transform: 'rotate(-2.5deg)' }}>
          <Flag /> {f.text}
        </span>
      ))}
    </div>
  )
}

function ThreatIcon({ name }) {
  const p = { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', stroke: 'var(--violet)', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  if (name === 'file') return <svg {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M12 11v4m0 3h.01" /></svg>
  if (name === 'call') return <svg {...p}><path d="M15.5 10.5 21 5M21 10.5 15.5 5" /><path d="M3 5.5c0 8 6.5 14.5 14.5 14.5a2 2 0 0 0 2-2v-2l-4-1.5-2 2a14 14 0 0 1-6-6l2-2L8 4.5H6a2 2 0 0 0-2 2z" /></svg>
  return <svg {...p}><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4L3 21l1.1-3.4A8.4 8.4 0 1 1 21 11.5z" /></svg>
}

function Flag() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 21V4m0 0h11l-2 4 2 4H5" stroke="var(--red)" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Section({ id, eyebrow, title, sub, children, className = '' }) {
  return (
    <section id={id} className={`py-16 sm:py-20 ${className}`}>
      <div className="wrap">
        {eyebrow ? <p className="text-center"><span className="eyebrow">{eyebrow}</span></p> : null}
        <h2 className="h2 mt-4">{title}</h2>
        {sub ? (
          <p className="mx-auto mt-4 max-w-2xl text-center text-[1.02rem]" style={{ color: 'var(--muted)' }}>
            {sub}
          </p>
        ) : null}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  )
}

function LookLike() {
  return (
    <Section eyebrow="Know the trick"
             title={<>Scams don’t always look scary.<br />They can look like this.</>}>
      <div className="grid gap-5 md:grid-cols-3">
        {LOOK_LIKE.map((c) => (
          <article key={c.title} className="card overflow-hidden p-4">
            <div className="rounded-2xl p-4" style={{ background: c.tint }}>
              <div className="flex items-start gap-3 rounded-xl bg-white p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                      style={{ background: 'var(--violet-soft)' }}>
                  <ThreatIcon name={c.icon} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.62rem] font-bold tracking-wide" style={{ color: 'var(--muted)' }}>
                    {c.meta}
                  </span>
                  {c.lines.map((l) => (
                    <span key={l} className="block text-[0.88rem] font-bold leading-snug">{l}</span>
                  ))}
                </span>
              </div>
            </div>

            <div className="px-2 pb-2 pt-5">
              <h3 className="text-[1.15rem] font-extrabold">{c.title}</h3>
              <p className="mt-2 text-[0.93rem] leading-relaxed" style={{ color: 'var(--muted)' }}>{c.body}</p>
              <p className="mt-3 text-[0.88rem] font-semibold" style={{ color: 'var(--violet)' }}>{c.note}</p>
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}

function CheckSection() {
  return (
    <Section id="check" eyebrow="Pause before you act" title="Check something suspicious."
             sub="A place to pause, look for warning signs and find a safer next step.">
      <Checker />
    </Section>
  )
}

function Defences() {
  return (
    <Section id="defences" eyebrow="The MIF system concept"
             title="Three threats. Three lines of defence."
             sub="Here’s how the proposed system would help — and what you can do today."
             className="bg-white">
      <div className="grid gap-5 md:grid-cols-3">
        {DEFENCES.map((d) => (
          <article key={d.title} className="rounded-3xl p-5" style={{ background: '#F5F5FA' }}>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                    style={{ background: '#E7E4FB' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 3l8 3.2v6c0 4.6-3.4 8-8 9.3-4.6-1.3-8-4.7-8-9.3v-6z"
                        stroke="var(--violet)" strokeWidth="1.9" strokeLinejoin="round" />
                </svg>
              </span>
              <h3 className="text-[1.12rem] font-extrabold leading-tight">{d.title}</h3>
            </div>

            <p className="mt-4 text-[0.93rem] leading-relaxed" style={{ color: 'var(--muted)' }}>
              <span className="font-semibold" style={{ color: 'var(--ink)' }}>Proposed protection: </span>
              {d.proposed}
            </p>

            <p className="mt-5 text-[0.7rem] font-extrabold uppercase tracking-[0.1em]"
               style={{ color: 'var(--violet)' }}>Your safer next steps</p>
            <ol className="mt-3 space-y-2.5">
              {d.steps.map((s, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[0.7rem] font-bold"
                        style={{ background: '#E7E4FB', color: 'var(--violet)' }}>{i + 1}</span>
                  <span className="text-[0.9rem] leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>

      <p className="mt-8 text-center text-[0.82rem]" style={{ color: 'var(--muted)' }}>
        Concept, not a running service: this website does not read your SMS, intercept calls or
        scan files. No tool can guarantee safety.
      </p>
    </Section>
  )
}

function RedFlags() {
  return (
    <Section id="flags" eyebrow="Red flags"
             title={<>6 red flags. Learn them once,<br />spot them everywhere.</>}>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {RED_FLAGS.map((f) => (
          <article key={f.n} className="rounded-3xl p-5" style={{ background: f.tint }}>
            <div className="flex items-start justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white"><Flag /></span>
              <span className="text-[1.9rem] font-extrabold" style={{ color: 'rgba(21,20,29,.22)' }}>{f.n}</span>
            </div>
            <h3 className="mt-4 text-[1.1rem] font-extrabold leading-snug">{f.title}</h3>
            <p className="mt-3 inline-block rounded-lg bg-white px-3 py-2 text-[0.85rem] font-semibold">
              {f.quote}
            </p>
            <p className="mt-3 text-[0.86rem]" style={{ color: 'var(--muted)' }}>{f.note}</p>
          </article>
        ))}
      </div>
    </Section>
  )
}

function SpotTheFlag() {
  return (
    <Section id="practice" eyebrow="A little practice" title="Spot the flag."
             sub="Read the message. Can you find the three tricks before checking the answer?">
      <div className="rounded-3xl p-5 sm:p-7" style={{ background: 'var(--ink)' }}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.12em]" style={{ color: '#9A98A8' }}>
            Practice round · The fake official
          </span>
          <span className="ml-auto rounded-full px-3 py-1.5 text-[0.75rem] font-bold"
                style={{ background: 'rgba(212,249,60,.16)', color: 'var(--lime)' }}>
            Answer revealed
          </span>
        </div>

        <div className="mt-5 flex gap-3">
          <span className="hidden h-10 w-10 shrink-0 place-items-center rounded-full sm:grid"
                style={{ background: '#2C2A37' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="8" r="3.4" stroke="#9A98A8" strokeWidth="1.8" />
              <path d="M4.8 20c.9-3.4 3.8-5.2 7.2-5.2S18.3 16.6 19.2 20" stroke="#9A98A8" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>

          <div className="flex-1 rounded-2xl bg-white p-4">
            <p className="text-[0.75rem] font-semibold" style={{ color: 'var(--muted)' }}>
              {PRACTICE.from} · Not in your contacts
            </p>
            <p className="mt-2 text-[1.02rem] leading-[1.9]">
              {PRACTICE.parts.map((p, i) =>
                p.mark ? (
                  <strong key={i} className="font-extrabold underline decoration-2 underline-offset-4"
                          style={{ color: 'var(--red)' }}>
                    {p.text}
                    <sup className="ml-1 rounded-full border px-1 text-[0.6em] no-underline"
                         style={{ borderColor: 'var(--red)' }}>{p.mark}</sup>
                  </strong>
                ) : (
                  <span key={i}>{p.text}</span>
                ),
              )}
            </p>
          </div>
        </div>

        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {PRACTICE.legend.map((l, i) => (
            <li key={l} className="flex items-center gap-2.5 rounded-xl px-3.5 py-3"
                style={{ background: '#2C2A37' }}>
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[0.72rem] font-bold"
                    style={{ borderColor: 'var(--lime)', color: 'var(--lime)' }}>{i + 1}</span>
              <span className="text-[0.88rem] font-semibold text-white">{l}</span>
            </li>
          ))}
        </ul>

        <p className="mt-4 flex gap-2.5 text-[0.88rem]" style={{ color: '#C9C7D4' }}>
          <span style={{ color: 'var(--lime)' }} aria-hidden>⬢</span>{PRACTICE.safer}
        </p>
      </div>

      <p className="mt-6 text-center text-[0.82rem]" style={{ color: 'var(--muted)' }}>
        Illustrative practice screen · Answers are shown for learning; no interactive scoring.
      </p>
    </Section>
  )
}

function GoldenRules() {
  return (
    <Section eyebrow="3 golden rules" title="If you remember nothing else.">
      <div className="grid gap-5 md:grid-cols-3">
        {GOLDEN_RULES.map((r) => (
          <article key={r.title} className="flex flex-col rounded-3xl p-6"
                   style={{ background: r.bg, color: r.fg, minHeight: '17rem' }}>
            <span className="grid h-12 w-12 place-items-center rounded-xl"
                  style={{ background: 'rgba(255,255,255,.16)' }}>
              <RuleIcon name={r.icon} fg={r.fg} />
            </span>
            <h3 className="mt-auto text-[1.45rem] font-extrabold leading-tight">{r.title}</h3>
            <p className="mt-3 text-[0.93rem] leading-relaxed" style={{ opacity: 0.86 }}>{r.body}</p>
          </article>
        ))}
      </div>
    </Section>
  )
}

function RuleIcon({ name, fg }) {
  const p = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: fg, strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  if (name === 'key') return <svg {...p}><circle cx="8" cy="8" r="4" /><path d="M11 11l8 8m-3-3l2 2m-4-4l1.5 1.5" /></svg>
  if (name === 'timer') return <svg {...p}><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2M9 2h6" /></svg>
  return <svg {...p}><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4L3 21l1.1-3.4A8.4 8.4 0 1 1 21 11.5z" /></svg>
}

function DontPanic() {
  return (
    <section id="help" className="py-16 sm:py-20">
      <div className="wrap">
        <div className="card stack-red border-2 border-[color:var(--ink)] p-6 sm:p-9">
          <span className="inline-block rounded-full px-3.5 py-2 text-[0.78rem] font-bold"
                style={{ background: 'var(--red-soft)', color: 'var(--red)' }}>
            Already clicked, shared or paid?
          </span>

          <h2 className="mt-5 font-extrabold tracking-[-0.03em]"
              style={{ fontSize: 'clamp(1.7rem,4vw,2.6rem)' }}>
            Don’t panic. Do these 3 things.
          </h2>
          <p className="mt-3 text-[1rem]" style={{ color: 'var(--muted)' }}>
            It can happen to anyone. You’re not to blame — acting quickly matters more than
            feeling embarrassed.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {PANIC_STEPS.map((s) => (
              <div key={s.n}>
                <span className="grid h-10 w-10 place-items-center rounded-xl text-[1.05rem] font-extrabold"
                      style={{ background: s.bg, color: s.fg }}>{s.n}</span>
                <h3 className="mt-3.5 text-[1.1rem] font-extrabold">{s.title}</h3>
                <p className="mt-2 text-[0.92rem] leading-relaxed" style={{ color: 'var(--muted)' }}>{s.body}</p>
                {s.n === '3' ? (
                  <a href="tel:1930" className="pill pill-violet mt-4">Call 1930 ✆</a>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4 border-t pt-6"
               style={{ borderColor: 'var(--line)' }}>
            <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer"
               className="font-bold underline underline-offset-4" style={{ color: 'var(--violet)' }}>
              cybercrime.gov.in ↗
            </a>
            <p className="ml-auto text-[0.86rem]" style={{ color: 'var(--muted)' }}>
              Need a hand? Ask someone you trust to help you call or report.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer style={{ background: 'var(--ink)' }}>
      <div className="wrap py-12">
        <div className="flex flex-wrap items-center gap-6">
          <Logo dark />
          <p className="ml-auto text-[1.35rem] font-extrabold tracking-[-0.02em] text-white">
            Less panic. <span style={{ color: 'var(--lime)' }}>More pause.</span>
          </p>
        </div>

        <div className="mt-8 grid gap-8 border-t pt-8 md:grid-cols-[1.6fr_1fr]"
             style={{ borderColor: 'rgba(255,255,255,.14)' }}>
          <div>
            <p className="font-bold text-white">An anti-fraud system concept. Not a live security service.</p>
            <p className="mt-3 max-w-2xl text-[0.88rem] leading-relaxed" style={{ color: '#9A98A8' }}>
              This website is a design prototype. The checker runs locally in your browser to
              teach warning signs — it does not verify callers, scan downloads or monitor
              messages. Monitoring and blocking are proposed features, not active protection.
              Examples teach warning signs and cannot establish that something is safe.
            </p>
          </div>

          <div>
            <p className="font-bold text-white">Official help in India</p>
            <p className="mt-3 text-[0.95rem] font-semibold" style={{ color: 'var(--lime)' }}>
              1930 · Financial cyber fraud
            </p>
            <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer"
               className="mt-1 block text-[0.9rem]" style={{ color: '#C9C7D4' }}>
              cybercrime.gov.in ↗
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
