# MIF Shield — the guide for everyone

No jargon. If you've never opened this folder before, start here.

---

## 1. What did we actually build?

Three things that all share one brain.

| # | Thing | Where you see it | What it's for |
|---|---|---|---|
| 1 | **The website** | `localhost:5173/` | Teaches normal people how to spot scams |
| 2 | **The dashboard** | `localhost:5173/dashboard.html` | Shows judges *how* our detection actually works |
| 3 | **The extension** | Inside your browser | Does the real thing — watches downloads and chats |

**The brain is the same in all three.** We wrote the scam-detecting code once, and all three plug into it.

---

## 2. The one idea you need

Imagine a **smoke detector**.

- A smoke detector doesn't "know" what fire is. It just measures smoke in the air.
- If there's a little smoke → quiet. A lot of smoke → it screams.
- And it can tell you *why* it went off: "I detected smoke."

Our brain works exactly the same way:

```
    Something suspicious                    What we show
    (a message, a file, a call)
              │
              ▼
    ┌─────────────────────┐
    │   THE BRAIN         │   finds clues    →   "Score: 99 / Dangerous"
    │   (src/engine/)     │   ───────────►       "Here's clue 1, clue 2, clue 3"
    └─────────────────────┘                      "Here's what to do next"
```

Each clue is called a **signal**. Example signals:

- "140 messages arrived in 10 seconds" 🚩
- "This file says `.jpg` but its insides say it's a Windows program" 🚩
- "The caller said *don't tell your family*" 🚩

More clues + stronger clues = higher score.

---

## 3. The four score levels

| Score | Colour | Means |
|---|---|---|
| 0–24 | 🟢 green | Looks safe |
| 25–49 | 🟡 yellow | Be careful |
| 50–74 | 🟠 orange | Suspicious |
| 75–99 | 🔴 red | Dangerous |

**Why does it stop at 99 and never hit 100?** Because we are never 100% sure, and it would be dishonest to pretend. This is a real rule in the code, not a decoration.

**We also never say "this is safe."** The strongest thing we say is *"no warning signs found."* Those are different! A new scam we've never seen would show no warning signs.

---

## 4. The folder map

```
hackom-26/
│
├── src/
│   ├── engine/          🧠 THE BRAIN. All the thinking happens here.
│   │   ├── bombing.js       catches message floods
│   │   ├── files.js         catches fake/disguised files
│   │   ├── calls.js         catches scam phone calls
│   │   ├── score.js         turns clues into a number
│   │   └── patterns/        the lists of "bad words" and "bad file types"
│   │
│   ├── mock/            🎭 FAKE DATA for demos (pretend messages, pretend files)
│   │
│   ├── site/            🌍 THE PUBLIC WEBSITE (the colourful one)
│   │
│   ├── ui/              📊 THE DASHBOARD (the dark technical one)
│   │
│   ├── background/      🔌 EXTENSION: the part always running in the browser
│   ├── content/         🔌 EXTENSION: the part that sits inside web pages
│   └── platform/        🔌 glue so the same code works on web AND in the extension
│
├── tests/               ✅ robots that check we didn't break anything
└── dist/                📦 the built result (created by `npm run build`)
```

**Rule of thumb:** if it *decides* something → `engine/`. If it *shows* something → `site/` or `ui/`.

---

## 5. How to run it

Open Terminal, go to the project folder, then:

```bash
npm install     # only the first time — downloads what we need
npm run dev     # starts the website
```

Now open **http://localhost:5173/** in your browser.

| URL | What opens |
|---|---|
| `localhost:5173/` | the public website |
| `localhost:5173/dashboard.html` | the technical dashboard |

To stop it: press `Ctrl + C` in the Terminal.

### To put the extension in your browser

```bash
npm run build
```

Then:
1. Open `comet://extensions` (or `chrome://extensions`)
2. Switch on **Developer mode** (top-right)
3. Click **Load unpacked** → choose the `dist` folder

Try it: download any `.exe` file and watch it get blocked.

---

## 6. The three shields, explained simply

### 🌊 Message Shield — "the flood"

**The scam:** Criminals make hundreds of OTP messages flood your phone. You get annoyed and stop reading. Hidden in the middle is the *real* message from your bank saying money just left your account.

**The flood isn't the attack. The flood is the hiding place.**

**What we do:** We spot the flood AND we dig the real bank message back out and put it at the top.

> 💡 **Our best demo moment.** Click "Chatty friend" on the dashboard — 22 messages from one friend scores only **34**. Then click "OTP bombing attack" — it scores **98**. That proves we're not just counting messages.

### 📎 File Shield — "the costume"

**The scam:** Someone sends you `photo.jpg` but it's secretly a program that takes over your phone.

**What we do:** Every file starts with a few secret bytes that say what it really is — like a label sewn inside a jacket. A real photo starts with `FF D8 FF`. A Windows program starts with `4D 5A`.

> **The name is a claim. The bytes are the truth.**

We also catch the sneaky trick where an invisible character flips the text, so `invoice[invisible]gnp.exe` *displays* as `invoice.png`. Same file. Different costume.

### 📞 Call Shield — "the pressure"

**The scam:** Someone calls pretending to be police or your bank. They scare you, rush you, and tell you not to tell anyone.

**What we do:** You paste what they said. We highlight the manipulation *in their own words* and name the scam.

We look for 7 tricks: pretending to be an authority, threatening you, rushing you, demanding secrecy, asking for money, asking for your OTP, and telling you not to check.

> ⚠️ **Important:** we do **not** block phone calls. A browser extension simply cannot touch phone calls. Saying otherwise would be lying to someone who's scared. We analyse what was said — that's it.

---

## 7. The question judges will ask

> *"Your data is fake."*

Here's the honest answer, and it's a good one:

- The **feed** is fake (the pretend messages). That's what the brief asked for.
- The **brain** is 100% real. `4D 5A` genuinely is a Windows program header. That's not simulated.
- Swapping fake data for real data changes **one line**. We designed that boundary first.
- The **extension already runs on real data** — real downloads, real chat pages.

---

## 8. How to change things

### Add a new red flag to the website
Open `src/site/data.js` → find `RED_FLAGS` → copy a block, change the words. Done.

### Change any wording on the website
It's all in `src/site/data.js`. You don't need to touch the layout.

### Teach the brain a new scam phrase
Open `src/engine/patterns/callPatterns.js` → find the tactic (like `isolation`) → add your phrase to its list.

### Add a whole new named scam
Same file → `NAMED_SCAMS` → copy a block. You need:
- `requires` — which tricks must be present
- `keywords` — words unique to *this* scam (stops it being confused with another)
- `truths` — the facts that prove it's a lie

**After any change, run this:**
```bash
npm run check
```
If it says `fail 0`, you're good. If it says `fail 1`, read the message — it tells you what broke.

---

## 9. The robots that protect us (tests)

We have **34 automated checks**. They've already caught real bugs:

| What it checks | A real bug it caught |
|---|---|
| The brain's answers | A busy family group chat was being called an "attack" |
| Every screen loads | A screen that crashed instantly on open |
| Colours exist | Every red "DANGEROUS" was secretly rendering **black** |
| The extension is valid | A permission we used but never asked for |

That colour one is sneaky: if you rename a colour, nothing errors — the text just silently turns black. The robot catches it now.

**Always run `npm run check` before you commit.** It takes 3 seconds.

---

## 10. Working together

```bash
git add .
git commit -m "feat(site): add the new red flag card"
git push origin main
```

**Commit message format:** `type(area): what you did`

| Type | Use when |
|---|---|
| `feat` | you added something new |
| `fix` | you fixed a bug |
| `docs` | you changed words/documentation |
| `test` | you added a check |
| `chore` | setup, config, tidying |

**Before you push:** run `npm run check`. Don't push red.

---

## 11. Who should work on what

| If you like... | Work in... |
|---|---|
| Logic and puzzles | `src/engine/` — add scam patterns, tune the detection |
| Design and visuals | `src/site/` — the public website |
| Charts and data | `src/ui/` — the dashboard |
| Browser plumbing | `src/background/`, `src/content/` |
| Writing and pitching | `src/site/data.js` + the demo script |

**The golden rule:** don't let two people edit the same file at the same time. Say in the group chat which file you're on.

---

## 12. Words you'll hear

| Word | Plain English |
|---|---|
| **Engine** | Our brain — the code that decides if something is a scam |
| **Signal** | One clue (e.g. "arrived at 3am") |
| **Score** | 0–99, how worried we are |
| **Verdict** | The final answer: score + clues + advice |
| **Mock data** | Fake examples we made up for demos |
| **Extension** | The add-on that lives inside your browser |
| **Magic bytes** | The first few bytes of a file that reveal what it really is |
| **OTP** | One-Time Password — the code your bank texts you |
| **MV3** | Manifest V3 — the rulebook Chrome makes extensions follow |
| **Build** | Packing the code into the `dist` folder so a browser can use it |

---

## 13. If something breaks

| Problem | Try this |
|---|---|
| `npm run dev` fails | `npm install`, then try again |
| Website shows nothing | Check the Terminal for red text |
| Extension won't load | `npm run build` first, then load the `dist` folder |
| Tests fail | Read the message — it names the file and line |
| You broke something badly | `git checkout .` undoes uncommitted changes |

---

## 14. One last thing

The most important thing about this project isn't the code. It's this:

> **Every scam here works by overwhelming someone's judgement** — with volume, with disguise, or with fear.

So everything we build does two things: **measure something real**, then **explain it in words a frightened person can act on.**

That's the whole project. The code is just how we keep that promise.

**Helpline: 1930 · cybercrime.gov.in**
