// Mock call transcripts.

export const SAMPLE_TRANSCRIPTS = [
  {
    key: 'digital-arrest',
    title: 'Digital arrest (CBI impersonation)',
    note: 'The dominant scam in India right now. Expect a maximum-severity verdict.',
    text: `Good afternoon, am I speaking with the account holder? This is Inspector Rajeev Sharma from the CBI cyber crime branch, badge number 4471. A parcel sent in your name was intercepted by the customs department at Mumbai airport and 140 grams of a banned substance was found inside, along with three passports and a laptop.

A case has been registered against you under the money laundering act and an arrest warrant has been issued. Right now you are under digital arrest. Please do not disconnect the call under any circumstances and keep your camera on.

Listen carefully. Do not tell your family about this, this is a confidential investigation and informing anyone will be treated as obstruction. Do not call the bank or visit the branch.

To prove the funds in your account are clean, you must transfer your balance to an RBI safe account for verification. The amount is fully refundable after clearance. You must do this immediately, within 2 hours, or the police will come to your residence tonight.`,
  },
  {
    key: 'bank-otp',
    title: 'Bank fraud-team OTP theft',
    note: 'Softer, friendlier and more common than the arrest scam. Still maximum severity.',
    text: `Hello sir, I am calling from the bank security team regarding your debit card ending 4417. We have detected a suspicious transaction of twenty-four thousand rupees attempted from Delhi at 2:40 PM today. Was that you? No? Alright, do not worry, I can reverse it right now from my side.

For the reversal I need to verify your identity. I am sending a code to your registered mobile number — please read me the OTP as soon as it arrives. Also confirm the CVV on the back of your card and your card number so I can match the records.

Please stay on the line while the reversal processes, and do not call the bank separately, it will create a duplicate complaint and delay the refund.`,
  },
  {
    key: 'kyc',
    title: 'KYC expiry / SIM deactivation',
    note: 'High pressure, remote-access angle. Tests the KYC and remote-access patterns.',
    text: `Namaste, I am calling from the telecom regulatory authority, TRAI. Your Aadhaar was used to register this number and the KYC verification is incomplete. Your SIM will be deactivated within 24 hours and your number will be permanently blocked.

To complete verification urgently, please install this app from the link I am sending — it is called AnyDesk, it is the official verification tool. Once installed, share your screen so I can complete the KYC from my end. There is a small processing fee of five hundred rupees, please scan this QR code to pay. Do it quickly, this is the final notice.`,
  },
  {
    key: 'family',
    title: 'Family emergency (voice cloned)',
    note: 'Threat plus urgency plus payment, with no authority claim — a different signal mix.',
    text: `Hello? Is this the father of Ankit? Your son has been detained at the police station, there was an accident and a case has been registered. He is very scared and crying, he asked us to call you.

We can settle this quietly right now before it goes to court, otherwise he will have to spend the night in jail. Send forty thousand rupees on UPI to this number immediately. Please do not tell your wife or anyone else, it will become a bigger issue. Send the amount now and I will release him.`,
  },
  {
    key: 'benign',
    title: 'An ordinary real call',
    note: 'The control case. A good detector must stay silent here.',
    text: `Hi, this is Meera from Dr. Nair's clinic. I'm calling to confirm your appointment tomorrow at 11 AM with Dr. Nair. If you need to reschedule you can call the clinic back on the number listed on our website or on your appointment card. Nothing else needed from your side, see you tomorrow.`,
  },
  {
    key: 'ambiguous',
    title: 'Genuinely unclear',
    note: 'A real delivery call that shares surface features with a scam. Should land mid-range, not red.',
    text: `Hello, this is from the courier department. We tried to deliver a parcel to your address but the address was incomplete. Please confirm your address urgently or the parcel will be returned today. There is a redelivery fee of fifty rupees.`,
  },
]

export function transcriptByKey(key) {
  return SAMPLE_TRANSCRIPTS.find((t) => t.key === key)?.text ?? ''
}
