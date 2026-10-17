// Copy for the awareness site, kept out of the layout so it is easy to edit.

export const LOOK_LIKE = [
  {
    title: 'Message bombing',
    body: 'Hundreds of automated messages can overwhelm you and bury important alerts.',
    note: 'Don’t share codes or tap reward links.',
    tint: 'var(--violet-tint)',
    icon: 'chat',
    meta: 'SMS · OTP FLOODS',
    lines: ['OTP. OTP. OTP.', 'Your inbox won’t stop.'],
  },
  {
    title: 'Risky image downloads',
    body: 'An unknown sender may use a picture or graphic to lure you into opening a harmful file.',
    note: 'An ordinary photo isn’t automatically malware.',
    tint: 'var(--pink-tint)',
    icon: 'file',
    meta: 'WHATSAPP · TELEGRAM',
    lines: ['“See your prize!”', 'photo.jpg.apk'],
  },
  {
    title: 'Fake official calls',
    body: 'Scammers borrow authority to frighten you into sending money or giving up details.',
    note: 'Hang up. Verify using a trusted number.',
    tint: 'var(--lime-soft)',
    icon: 'call',
    meta: 'POLICE · BANK IMPERSONATION',
    lines: ['“Your family is in trouble.', 'Pay now. Keep it secret.”'],
  },
]

export const DEFENCES = [
  {
    title: 'Notice the flood',
    proposed: 'watch SMS timing and repeated patterns, detect abnormal bursts, then block the attack.',
    steps: [
      'Pause. Don’t respond to every OTP or reward.',
      'Check important bank alerts through your official bank app.',
      'Use your phone’s spam controls and report the sender.',
    ],
  },
  {
    title: 'Check before downloading',
    proposed: 'flag suspicious downloads and warn you before you open a risky file.',
    steps: [
      'Verify the website URL. Avoid popups and fake download buttons.',
      'Check the file type. A “photo” ending in .apk or .exe is a warning.',
      'Scan with trusted security software. If suspicious, delete, block and report.',
    ],
  },
  {
    title: 'Question the caller',
    proposed: 'check incoming numbers against a spam database and block flagged callers.',
    steps: [
      'Hang up if someone demands money, secrecy or staying home.',
      'Call your bank using the number on your card or official website.',
      'Check on family directly. Block the scammer on the messaging platform too.',
    ],
  },
]

export const RED_FLAGS = [
  { n: '01', title: 'Rushing or frightening you', quote: '“Pay in 10 minutes or face arrest.”', note: 'Pressure is a reason to pause, not pay.', tint: 'var(--pink-tint)' },
  { n: '02', title: 'Asking for secret codes', quote: '“Read me the OTP you just got.”', note: 'Keep OTPs, PINs and passwords private.', tint: 'var(--violet-tint)' },
  { n: '03', title: 'A link or file in disguise', quote: '“Open your reward: prize.jpg.apk”', note: 'Look at the full URL and file extension.', tint: 'var(--lime-soft)' },
  { n: '04', title: 'A sudden flood of messages', quote: '“37 new OTPs. You requested none.”', note: 'Don’t let the flood hide real account alerts.', tint: 'var(--amber-soft)' },
  { n: '05', title: 'Big rewards. Money first.', quote: '“You won ₹50,000. Pay a release fee.”', note: 'Unexpected prizes with fees are a warning.', tint: 'var(--blue-soft)' },
  { n: '06', title: 'Authority + enforced secrecy', quote: '“This is the police. Don’t tell your family.”', note: 'Verify independently. Talk to someone you trust.', tint: 'var(--violet-tint)' },
]

export const GOLDEN_RULES = [
  { title: 'An OTP is your house key.', body: 'Never share it. Not with “bank support”, a caller claiming to be police, or a friend.', bg: 'var(--violet)', fg: '#fff', icon: 'key' },
  { title: 'Hurry? Slow down.', body: 'Fear and urgency are the trick. Pause before you pay, click or download.', bg: 'var(--lime)', fg: 'var(--ink)', icon: 'timer' },
  { title: 'Ask before you act.', body: 'Talk to a trusted friend, relative or local support person. No one has to figure it out alone.', bg: 'var(--ink)', fg: '#fff', icon: 'chat' },
]

export const PANIC_STEPS = [
  { n: '1', title: 'Stop. Save. Block.', body: 'Stop replying and don’t send more money. Save screenshots, numbers and transaction details, then block and report the sender.', bg: 'var(--ink)', fg: 'var(--lime)' },
  { n: '2', title: 'Secure your accounts.', body: 'Call your bank immediately using the number on your card or official website. Ask about securing the account. Change any password you shared.', bg: 'var(--ink)', fg: 'var(--lime)' },
  { n: '3', title: 'Report it quickly.', body: 'For financial cyber fraud in India, call 1930 as soon as possible. File a report at cybercrime.gov.in and keep your evidence.', bg: 'var(--red)', fg: '#fff' },
]

export const PRACTICE = {
  from: '+91 98XXX XXXXX',
  parts: [
    { text: '“This is ' },
    { text: 'the police', mark: 1 },
    { text: '. Your bank account is linked to a crime. ' },
    { text: 'Transfer ₹10,000 now', mark: 2 },
    { text: ' to clear it. ' },
    { text: 'Don’t tell anyone', mark: 3 },
    { text: '.”' },
  ],
  legend: ['Borrowed authority', 'Urgent money demand', 'Secrecy and isolation'],
  safer: 'Safer move: stop replying, don’t pay, and verify independently with the bank. Ask someone you trust.',
}

export const CHECKER_EXAMPLES = {
  message: [
    { label: 'OTP flood', value: '37 new OTP messages arrived in two minutes from services I never signed up for. One message says Rs 84,500 was debited from my account via UPI.' },
    { label: 'Fake bank call', value: 'The caller said he is from the bank security team. He said a suspicious transaction needs to be reversed and asked me to read him the OTP, my CVV and card number. He told me to stay on the line and not call the bank separately.' },
    { label: 'Everyday message', value: 'Hi, this is Meera from Dr. Nair’s clinic confirming your appointment tomorrow at 11 AM. Call the clinic back on the number on your appointment card if you need to reschedule.' },
  ],
  link: [
    { label: 'Prize download', value: 'https://whatsapp-image-viewer.top/view/wedding-invite-photo.jpg.apk' },
    { label: 'Fake bank page', value: 'https://sbi-kyc-update.xyz/statement/SBI_Statement_Oct2025.zip' },
    { label: 'Ordinary file', value: 'https://drive.google.com/uc?export=download/team-photo.png' },
  ],
}
