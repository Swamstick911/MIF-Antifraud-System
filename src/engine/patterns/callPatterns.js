// Impersonation-call indicators.

export const TACTICS = [
  {
    id: 'impersonation',
    label: 'Claims to be an authority',
    weight: 0.5,
    explain:
      'Real officials identify themselves and are happy to be verified. An unverifiable claim of authority is the foundation every one of these scams is built on.',
    phrases: [
      'cbi', 'central bureau', 'cyber crime branch', 'cyber cell', 'narcotics',
      'enforcement directorate', 'income tax department', 'customs department',
      'trai', 'telecom regulatory', 'rbi official', 'reserve bank',
      'police station', 'inspector', 'sub-inspector', 'crime branch',
      'bank security team', 'fraud department', 'microsoft support',
      'technical support', 'aadhaar office', 'uidai', 'passport office',
      'courier department', 'fedex', 'dhl', 'blue dart',
    ],
  },
  {
    id: 'threat',
    label: 'Threatens you with consequences',
    weight: 0.65,
    explain:
      'Fear stops people from checking facts. No agency announces an arrest or a case by phone — summons arrive in writing, through the courts.',
    phrases: [
      'arrest warrant', 'warrant', 'non-bailable', 'digital arrest',
      'house arrest', 'case has been registered', 'case registered against',
      'fir', 'money laundering', 'illegal activity', 'drugs were found',
      'your aadhaar was used', 'your sim will be', 'will be deactivated',
      'will be blocked', 'legal action', 'court', 'jail', 'imprisonment',
      'you will be arrested', 'police will come', 'passport will be',
    ],
  },
  {
    id: 'urgency',
    label: 'Creates artificial time pressure',
    weight: 0.45,
    explain:
      'Deadlines exist to stop you from thinking or asking someone. Any genuine process gives you time, and nothing legitimate expires in the next two hours.',
    phrases: [
      'immediately', 'right now', 'within 2 hours', 'within two hours',
      'within 24 hours', 'last warning', 'final notice', 'final warning',
      'act now', 'before it is too late', 'expires today', 'only 10 minutes',
      'urgent', 'emergency', 'do it quickly', 'no time',
    ],
  },
  {
    id: 'isolation',
    label: 'Tells you to keep it secret',
    weight: 0.85,
    explain:
      'This is the single most reliable sign of a scam. The request exists only because anyone you tell — family, your bank, the police — would immediately recognise it. No real investigation ever forbids you from speaking to people.',
    phrases: [
      'do not tell anyone', 'don\'t tell anyone', 'do not tell your family',
      'don\'t tell your family', 'do not inform', 'keep this confidential',
      'confidential investigation', 'do not disconnect', 'don\'t disconnect',
      'stay on the line', 'stay on the call', 'do not cut the call',
      'cannot discuss with anyone', 'under surveillance', 'do not leave the room',
      'keep the camera on', 'nobody should know',
    ],
  },
  {
    id: 'payment',
    label: 'Asks you to move money',
    weight: 0.8,
    explain:
      'No government body, bank or court ever collects money over a phone call, and no legitimate process requires you to move your savings to prove they are clean. The destination account is the scammer.',
    phrases: [
      'gift card', 'amazon voucher', 'bitcoin', 'usdt',
      'transfer the money', 'transfer your balance', 'transfer rs', 'transfer the amount',
      'verification fee', 'processing fee', 'clearance fee', 'security deposit',
      'refundable deposit', 'safe account', 'secure account', 'rbi account',
      'escrow', 'pay the fine', 'pay the penalty', 'send the amount',
      'send the money', 'scan this qr', 'scan the qr code', 'release the prize',
      'registration fee', 'pay to avoid', 'pay now',
    ],
    // Catches "send forty thousand rupees", "transfer Rs 10,000", "pay 500".
    patterns: [
      /\b(?:send|transfer|pay|deposit|remit)\s+(?:me\s+)?(?:rs\.?|inr|₹)?\s*[\d,]+/i,
      /\b(?:send|transfer|pay|deposit)\s+(?:\w+\s+){0,2}(?:thousand|lakh|crore|rupees)/i,
    ],
  },
  {
    // A payment rail named on its own is not a warning sign - genuine bank
    // alerts mention UPI constantly. It only matters alongside an actual ask,
    // which the tactic above detects, so this carries a small weight.
    id: 'paymentRail',
    label: 'Mentions a payment method',
    weight: 0.2,
    explain:
      'Naming a payment app is normal in genuine bank messages too. It matters here only because it appears next to the other pressure tactics.',
    phrases: ['upi', 'google pay', 'phonepe', 'paytm', 'crypto', 'net banking'],
  },
  {
    id: 'credentials',
    label: 'Asks for codes or remote access',
    weight: 0.88,
    explain:
      'An OTP is the last thing standing between a stranger and your account, and no genuine employee will ever ask for one. Remote-access apps hand over complete control of your device.',
    phrases: [
      'share the otp', 'tell me the otp', 'read me the code', 'what is the otp',
      'share the code', 'send me the otp', 'one time password', 'cvv',
      'card number', 'pin number', 'your password', 'net banking password',
      'anydesk', 'teamviewer', 'quick support', 'screen share', 'share your screen',
      'install this app', 'download this apk', 'download the app from the link',
    ],
  },
  {
    id: 'deflection',
    label: 'Discourages you from verifying',
    weight: 0.75,
    explain:
      'A real caller wants you to confirm who they are. Being told not to check is, by itself, proof that checking would end the scam.',
    phrases: [
      'do not call the bank', 'don\'t call the bank', 'do not call back',
      'our number will not show', 'this number is not traceable',
      'do not visit the branch', 'the website is down', 'do not google',
      'i will stay on the line while you', 'no need to verify',
    ],
  },
]

// Named scams.
export const NAMED_SCAMS = [
  {
    id: 'digital-arrest',
    name: 'the "Digital Arrest" scam',
    requires: ['impersonation', 'threat', 'isolation'],
    keywords: ['digital arrest', 'arrest warrant', 'parcel', 'customs', 'under surveillance', 'money laundering'],
    summary:
      'Callers posing as police, CBI or customs claim a parcel or bank account in your name is linked to a crime, then keep you on a video call — sometimes for hours — while you are told not to contact anyone, until you transfer money to a "safe account" for verification.',
    truths: [
      'There is no such thing as a "digital arrest". No Indian law enforcement agency conducts arrests, interrogations or custody over a video call.',
      'The police cannot demand money over the phone. Fines are paid to courts, never to an individual account.',
      'No investigation ever requires you to stay on a call or to hide it from your family.',
    ],
  },
  {
    id: 'bank-otp',
    name: 'a bank-impersonation OTP theft',
    requires: ['impersonation', 'credentials'],
    keywords: ['otp', 'cvv', 'card number', 'reverse', 'suspicious transaction', 'debit card'],
    summary:
      'The caller claims to be from your bank\'s fraud team, says a suspicious transaction needs to be reversed, and asks you to read back the code sent to your phone. The code authorises the transfer they are making.',
    truths: [
      'Bank staff never ask for an OTP, PIN, CVV or password — they already have access to everything they legitimately need.',
      'If a transaction is genuinely fraudulent, the bank blocks it from their side. Nothing is required from you by phone.',
    ],
  },
  {
    id: 'kyc-expiry',
    name: 'a KYC / account-expiry scam',
    requires: ['impersonation', 'urgency', 'credentials'],
    keywords: ['kyc', 'deactivated', 'sim will be', 'verification is incomplete', 'blocked'],
    summary:
      'You are told your KYC is incomplete and the account or SIM will be blocked within hours unless you verify immediately, usually by installing an app or entering details on a link.',
    truths: [
      'KYC updates are done in the branch or in the bank\'s own app, never through a link sent by a caller.',
      'Banks give written notice weeks in advance. A deadline of hours is manufactured.',
    ],
  },
  {
    id: 'remote-access',
    name: 'a remote-access takeover',
    requires: ['credentials', 'urgency'],
    keywords: ['anydesk', 'teamviewer', 'screen share', 'share your screen', 'install this app'],
    summary:
      'A "support engineer" asks you to install AnyDesk, TeamViewer or a similar app so they can "fix" a problem or process a refund. Once connected they can see your screen, read your OTPs and operate your banking app as you.',
    truths: [
      'No bank, telecom operator or government office needs remote control of your phone or computer.',
      'Anyone watching your screen can read every OTP that arrives, so the usual protections stop working.',
    ],
  },
  {
    id: 'family-emergency',
    name: 'a family-emergency scam',
    requires: ['threat', 'urgency', 'payment'],
    keywords: ['son', 'daughter', 'detained', 'accident', 'hospital', 'released'],
    summary:
      'A caller says your son, daughter or relative has been detained, hurt or caught in a scandal, and money must be sent at once to resolve it quietly. Voice cloning is increasingly used to make a few seconds of audio sound like the relative.',
    truths: [
      'Hang up and call the relative directly on their own number. The scam only survives while you have not checked.',
      'Hospitals and police stations do not ask for money transfers to release someone.',
    ],
  },
]

/** Verification steps that apply regardless of which scam it is. */
export const SAFE_STEPS = [
  {
    title: 'Hang up first',
    body: 'Ending the call costs you nothing and defeats every version of this scam. If the matter is real, it will still be real in ten minutes.',
  },
  {
    title: 'Call back on a number you looked up yourself',
    body: 'Use the number printed on the back of your debit card, or the one on the organisation\'s official website. Never the number that called you, and never a number the caller gives you.',
  },
  {
    title: 'Tell one other person',
    body: 'Say out loud to a family member or colleague what you were just asked to do. Scams rely on isolation and rarely survive being described to someone else.',
  },
  {
    title: 'Report it',
    body: 'Call the national cybercrime helpline 1930, or file at cybercrime.gov.in. Reporting within the first few hours ("golden hour") gives the best chance of freezing a transfer.',
  },
]
