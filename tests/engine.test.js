import test from 'node:test'
import assert from 'node:assert/strict'
import { detectBombing, analyseFile, analyseTranscript, combine, bandFor } from '../src/engine/index.js'
import { calmInbox, bombingBurst, chattyFriend, resetIds } from '../src/mock/messages.js'
import { SAMPLE_FILES } from '../src/mock/files.js'
import { SAMPLE_TRANSCRIPTS } from '../src/mock/transcripts.js'

const NOW = Date.UTC(2025, 9, 16, 14, 0, 0) // fixed clock: no quiet-hours flakiness

test('scoring never claims certainty', () => {
  const certain = combine([{ weight: 1 }, { weight: 1 }, { weight: 1 }])
  assert.ok(certain <= 99, 'score must stay below 100')
})

test('scoring is monotonic — more evidence never lowers the score', () => {
  const base = combine([{ weight: 0.4 }])
  const more = combine([{ weight: 0.4 }, { weight: 0.3 }])
  assert.ok(more > base)
})

test('bands map to the documented thresholds', () => {
  assert.equal(bandFor(0).id, 'safe')
  assert.equal(bandFor(24).id, 'safe')
  assert.equal(bandFor(25).id, 'caution')
  assert.equal(bandFor(50).id, 'suspicious')
  assert.equal(bandFor(75).id, 'danger')
})

test('a calm inbox raises nothing', () => {
  resetIds()
  const v = detectBombing(calmInbox(NOW), { now: NOW })
  assert.equal(v.band, 'safe')
  assert.equal(v.signals.length, 0)
})

test('an OTP flood is flagged as dangerous', () => {
  resetIds()
  const v = detectBombing(bombingBurst({ now: NOW }), { now: NOW })
  assert.equal(v.band, 'danger')
  assert.ok(v.score >= 90)
})

test('the buried financial alert is recovered from the flood', () => {
  resetIds()
  const v = detectBombing(bombingBurst({ now: NOW }), { now: NOW })
  assert.equal(v.buriedAlerts.length, 1)
  assert.match(v.buriedAlerts[0].text, /84,500/)
  assert.equal(v.pattern, 'otp-burial')
})

test('many KNOWN contacts messaging at once is not sender fan-out', () => {
  // A busy afternoon: eight different friends, all in your contacts.
  const msgs = Array.from({ length: 8 }, (_, i) => ({
    id: `k${i}`,
    sender: `contact-${i}`,
    senderLabel: `Friend ${i}`,
    // Varied wording: identical bodies would (correctly) trip template detection,
    // which is a different signal from the one under test here.
    text: ['are you coming tonight?', 'call me back', 'sent the file',
           'running late', 'did you eat?', 'happy birthday!',
           'see you at 7', 'thanks for today'][i],
    timestamp: NOW - i * 9000,
    channel: 'whatsapp',
    knownContact: true,
  }))
  const v = detectBombing(msgs, { now: NOW })
  assert.ok(
    !v.signals.some((s) => s.id === 'burst.senderFanOut'),
    'fan-out must count unknown senders only',
  )
  assert.equal(v.band, 'safe')
})

test('a chatty friend is NOT treated as an attack', () => {
  resetIds()
  const v = detectBombing(chattyFriend(NOW), { now: NOW })
  assert.notEqual(v.band, 'danger')
  assert.ok(v.score < 50, `expected below 50, got ${v.score}`)
})

test('every malicious sample file is flagged, the clean one is not', () => {
  for (const sample of SAMPLE_FILES) {
    const v = analyseFile(sample.file)
    if (sample.key === 'clean') {
      assert.equal(v.band, 'safe', `${sample.key} should be safe`)
      assert.equal(v.action.id, 'proceed')
    } else if (sample.key === 'shortened') {
      assert.equal(v.band, 'caution', 'an unverifiable origin is caution, not alarm')
    } else {
      assert.equal(v.band, 'danger', `${sample.key} should be dangerous`)
    }
  }
})

test('an executable disguised as an image is caught by its header', () => {
  const v = analyseFile({
    filename: 'holiday.png',
    declaredMime: 'image/png',
    sizeBytes: 900_000,
    headerHex: '4D5A9000',
    sourceUrl: 'https://example.com/x',
  })
  assert.ok(v.signals.some((s) => s.id === 'file.magicMismatch'))
  assert.equal(v.band, 'danger')
})

test('invisible filename characters are neutralised before display', () => {
  const v = analyseFile({ filename: 'invoice‮gnp.exe', headerHex: '4D5A' })
  assert.ok(!v.subject.includes('‮'), 'the UI must never receive a raw override char')
  assert.equal(v.pattern, 'rtlo-disguise')
})

test('each sample transcript resolves to its own named scam', () => {
  const expected = {
    'digital-arrest': 'digital-arrest',
    'bank-otp': 'bank-otp',
    kyc: 'kyc-expiry',
    family: 'family-emergency',
    benign: null,
    ambiguous: null,
  }
  for (const s of SAMPLE_TRANSCRIPTS) {
    const v = analyseTranscript(s.text)
    assert.equal(v.pattern, expected[s.key], `${s.key} matched ${v.pattern}`)
  }
})

test('a benign call stays silent, an ambiguous one lands mid-range', () => {
  const benign = analyseTranscript(SAMPLE_TRANSCRIPTS.find((t) => t.key === 'benign').text)
  assert.equal(benign.band, 'safe')
  const unclear = analyseTranscript(SAMPLE_TRANSCRIPTS.find((t) => t.key === 'ambiguous').text)
  assert.ok(unclear.score > 25 && unclear.score < 75, `expected mid-range, got ${unclear.score}`)
})

test('too little detail is reported as inconclusive, not as safe', () => {
  const v = analyseTranscript('someone called me')
  assert.equal(v.inconclusive, true)
})

test('transcript highlights never overlap', () => {
  const v = analyseTranscript(SAMPLE_TRANSCRIPTS[0].text)
  const h = v.highlights
  for (let i = 1; i < h.length; i++) {
    assert.ok(h[i].start >= h[i - 1].end, 'highlights must be disjoint for rendering')
  }
})
