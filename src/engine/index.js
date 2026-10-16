// MIF Shield detection engine — public surface.
export { detectBombing, findBuriedAlerts, isOtp, THRESHOLDS } from './bombing.js'
export { analyseFile, escapeInvisible } from './files.js'
export { analyseTranscript } from './calls.js'
export { BANDS, bandFor, combine, verdict } from './score.js'
export { TACTICS, NAMED_SCAMS, SAFE_STEPS } from './patterns/callPatterns.js'
export { MAGIC, identifyMagic } from './patterns/fileSignatures.js'
