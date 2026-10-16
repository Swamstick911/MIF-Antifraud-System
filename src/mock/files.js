// Mock download / attachment feed.

export const SAMPLE_FILES = [
  {
    key: 'rtlo',
    title: 'The reversed-name trick',
    note: 'Looks like “invoice.png” in every file manager. It is an .exe.',
    file: {
      filename: 'invoice‮gnp.exe',
      declaredMime: 'image/png',
      sizeBytes: 1_180_000,
      headerHex: '4D5A90000300000004000000',
      sourceUrl: 'https://paytrn.com/invoice/download',
      senderLabel: '+91 70xxxx4412',
      userInitiated: true,
      hostAgeDays: 6,
    },
  },
  {
    key: 'apk-as-image',
    title: 'APK wearing a photo’s name',
    note: 'Shared on WhatsApp as a wedding picture. The header says ZIP — Android packages are ZIP files.',
    file: {
      filename: 'wedding-invite-photo.jpg',
      declaredMime: 'image/jpeg',
      sizeBytes: 27_900_000,
      headerHex: '504B03040A00000008000021',
      sourceUrl: 'https://whatsapp-image-viewer.top/view',
      senderLabel: 'Unknown (+91 86xxxx9901)',
      userInitiated: true,
      hostAgeDays: 3,
    },
  },
  {
    key: 'double-ext',
    title: 'Classic double extension',
    note: 'Windows hides the final extension by default, so this displays as “family-photo.jpg”.',
    file: {
      filename: 'family-photo.jpg.exe',
      declaredMime: 'application/octet-stream',
      sizeBytes: 2_410_000,
      headerHex: '4D5A9000030000000400',
      sourceUrl: 'https://free-photo-download.tk/get?id=99',
      userInitiated: false,
      hostAgeDays: 12,
    },
  },
  {
    key: 'locked-zip',
    title: 'Password-protected archive',
    note: 'The password is in the chat message. Encryption here exists to blind antivirus, not to protect you.',
    file: {
      filename: 'SBI_Statement_Oct2025.zip',
      declaredMime: 'application/zip',
      sizeBytes: 640_000,
      headerHex: '504B0304140001006300',
      sourceUrl: 'https://sbi-kyc-update.xyz/statement',
      senderLabel: 'SBI Alerts (spoofed)',
      userInitiated: true,
      passwordProtected: true,
      hostAgeDays: 1,
    },
  },
  {
    key: 'shortened',
    title: 'Hidden behind a shortener',
    note: 'A real PDF, but nothing about its origin can be checked. Caution, not alarm.',
    file: {
      filename: 'offer-letter.pdf',
      declaredMime: 'application/pdf',
      sizeBytes: 410_000,
      headerHex: '255044462D312E37',
      sourceUrl: 'https://bit.ly/3xKqRm2',
      userInitiated: true,
    },
  },
  {
    key: 'clean',
    title: 'A genuinely ordinary file',
    note: 'Correct header, expected size, trusted origin. The engine must stay quiet here.',
    file: {
      filename: 'team-photo.png',
      declaredMime: 'image/png',
      sizeBytes: 3_200_000,
      headerHex: '89504E470D0A1A0A',
      sourceUrl: 'https://drive.google.com/uc?export=download',
      senderLabel: 'Priya (work)',
      userInitiated: true,
    },
  },
]

export function fileByKey(key) {
  return SAMPLE_FILES.find((f) => f.key === key)?.file ?? null
}
