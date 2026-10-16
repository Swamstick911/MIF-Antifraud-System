// Mock message feed.

const SERVICES = [
  ['AX-AMZN', 'Amazon'], ['VM-FLPKRT', 'Flipkart'], ['AD-SWIGGY', 'Swiggy'],
  ['JD-ZOMATO', 'Zomato'], ['VK-PAYTM', 'Paytm'], ['AX-PHONPE', 'PhonePe'],
  ['TX-MYNTRA', 'Myntra'], ['BP-OLACAB', 'Ola'], ['AD-UBERIN', 'Uber'],
  ['VM-NETFLX', 'Netflix'], ['JM-SPOTFY', 'Spotify'], ['AX-DREAM11', 'Dream11'],
  ['TA-BIGBSK', 'BigBasket'], ['AD-MEESHO', 'Meesho'], ['VK-JIOFIN', 'Jio'],
]

const OTP_TEMPLATES = [
  (c, b) => `${c} is your OTP for ${b} login. Do not share with anyone.`,
  (c, b) => `Your ${b} verification code is ${c}. Valid for 10 minutes.`,
  (c, b) => `${c} is your one-time password. ${b} will never call you for this.`,
  (c, b) => `Use ${c} to verify your ${b} account. Ignore if not requested.`,
]

const NORMAL_MESSAGES = [
  ['Amma', 'Did you eat? Call me when you are free.'],
  ['Rohit Verma', 'Bro are we still on for Saturday?'],
  ['Priya', 'Sending the slides now, check and tell me'],
  ['Landlord', 'Rent received, thanks.'],
  ['Dr. Nair clinic', 'Reminder: your appointment is tomorrow at 11:00 AM.'],
]

let seq = 0
const nextId = () => `m${++seq}`

/** The one message the flood exists to hide. */
export function buriedAlertMessage(at) {
  return {
    id: nextId(),
    sender: 'VM-HDFCBK',
    senderLabel: 'HDFC Bank',
    text: 'Rs 84,500.00 debited from A/c XX4417 on 16-10-25 via UPI to PAYEE-9823. Not you? Call 18002586161.',
    timestamp: at,
    channel: 'sms',
    knownContact: true,
  }
}

/** A quiet, normal inbox. The negative case the demo also needs. */
export function calmInbox(now = Date.now()) {
  // Spread across the last ~2.5 minutes so these messages sit inside the detector's sliding windows.
  const spacing = 32 * 1000
  return NORMAL_MESSAGES.map(([who, text], i) => ({
    id: nextId(),
    sender: who,
    senderLabel: who,
    text,
    timestamp: now - (NORMAL_MESSAGES.length - i) * spacing,
    channel: 'whatsapp',
    knownContact: true,
  }))
}

// An OTP-burial attack: a flood of unrequested verification codes from many services, with one.
export function bombingBurst({ now = Date.now(), count = 140, windowMs = 180000, withBuriedAlert = true } = {}) {
  const out = []
  for (let i = 0; i < count; i++) {
    const [sender, brand] = SERVICES[i % SERVICES.length]
    const code = String(100000 + Math.floor(Math.random() * 899999))
    const template = OTP_TEMPLATES[i % OTP_TEMPLATES.length]
    // Cluster arrivals toward the end so the live view shows it accelerating.
    const offset = Math.floor(windowMs * (1 - (i / count) ** 1.6))
    out.push({
      id: nextId(),
      sender,
      senderLabel: brand,
      text: template(code, brand),
      timestamp: now - offset,
      channel: 'sms',
      knownContact: false,
    })
  }
  if (withBuriedAlert) {
    out.push(buriedAlertMessage(now - Math.floor(windowMs * 0.42)))
  }
  return out.sort((a, b) => a.timestamp - b.timestamp)
}

/** A chatty friend — high volume, but genuinely harmless. The false-positive test. */
export function chattyFriend(now = Date.now(), count = 22) {
  const lines = [
    'ok so', 'you will not believe this', 'remember that interview',
    'they called back', 'i got it 🎉', 'starting next month',
    'package is good also', 'tell no one yet', 'ok call me',
    'why are you not replying', 'helloooo', 'fine ignore me',
  ]
  return Array.from({ length: count }, (_, i) => ({
    id: nextId(),
    sender: '+91 98200 11234',
    senderLabel: 'Rohit Verma',
    text: lines[i % lines.length],
    timestamp: now - (count - i) * 2200,
    channel: 'whatsapp',
    knownContact: true,
  }))
}

export function resetIds() {
  seq = 0
}
