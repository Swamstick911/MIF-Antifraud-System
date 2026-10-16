// File-type ground truth.

/** Magic numbers, as uppercase hex prefixes of the first bytes of a file. */
export const MAGIC = [
  { hex: 'FFD8FF', type: 'image/jpeg', family: 'image', label: 'JPEG image' },
  { hex: '89504E47', type: 'image/png', family: 'image', label: 'PNG image' },
  { hex: '47494638', type: 'image/gif', family: 'image', label: 'GIF image' },
  { hex: '424D', type: 'image/bmp', family: 'image', label: 'BMP image' },
  { hex: '52494646', type: 'image/webp', family: 'image', label: 'WebP/RIFF container' },
  { hex: '25504446', type: 'application/pdf', family: 'document', label: 'PDF document' },
  { hex: '504B0304', type: 'application/zip', family: 'archive', label: 'ZIP container (also APK, DOCX, XLSX)' },
  { hex: '52617221', type: 'application/x-rar', family: 'archive', label: 'RAR archive' },
  { hex: '377ABCAF', type: 'application/x-7z', family: 'archive', label: '7-Zip archive' },
  { hex: '1F8B', type: 'application/gzip', family: 'archive', label: 'GZIP archive' },
  { hex: '4D5A', type: 'application/x-msdownload', family: 'executable', label: 'Windows executable (MZ header)' },
  { hex: '7F454C46', type: 'application/x-elf', family: 'executable', label: 'Linux ELF executable' },
  { hex: 'CAFEBABE', type: 'application/java-vm', family: 'executable', label: 'Java class / Mach-O fat binary' },
  { hex: 'D0CF11E0', type: 'application/vnd.ms-office', family: 'document', label: 'Legacy Office document (macro capable)' },
]

/** Extensions that can execute code on a normal consumer machine. */
export const EXECUTABLE_EXTENSIONS = new Set([
  'exe', 'scr', 'com', 'pif', 'bat', 'cmd', 'msi', 'msix', 'cpl', 'hta', 'jar',
  'vbs', 'vbe', 'js', 'jse', 'wsf', 'wsh', 'ps1', 'psm1', 'reg', 'lnk', 'dll',
  'apk', 'apkm', 'xapk', 'app', 'dmg', 'pkg', 'deb', 'run', 'sh', 'bin', 'iso', 'img',
])

/** Extensions a user plausibly *means* to download when they wanted a picture. */
export const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'heic', 'heif', 'tiff', 'svg', 'avif'])

export const DOCUMENT_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'csv'])

export const ARCHIVE_EXTENSIONS = new Set(['zip', 'rar', '7z', 'gz', 'tar', 'bz2', 'xz'])

/** Which families each extension group legitimately maps to. */
export function expectedFamily(ext) {
  if (IMAGE_EXTENSIONS.has(ext)) return 'image'
  if (DOCUMENT_EXTENSIONS.has(ext)) return 'document'
  if (ARCHIVE_EXTENSIONS.has(ext)) return 'archive'
  if (EXECUTABLE_EXTENSIONS.has(ext)) return 'executable'
  return 'unknown'
}

/** Identify a file from its leading bytes, given as a hex string. */
export function identifyMagic(headerHex = '') {
  const hex = headerHex.replace(/[^0-9a-fA-F]/g, '').toUpperCase()
  if (!hex) return null
  // Longest prefix wins, so ZIP (504B0304) is not shadowed by a 2-byte entry.
  const sorted = [...MAGIC].sort((a, b) => b.hex.length - a.hex.length)
  return sorted.find((m) => hex.startsWith(m.hex)) ?? null
}

// Invisible and direction-changing characters used to disguise filenames.
export const DECEPTIVE_CHARS = [
  { code: '‮', name: 'right-to-left override' },
  { code: '‭', name: 'left-to-right override' },
  { code: '‫', name: 'right-to-left embedding' },
  { code: '​', name: 'zero-width space' },
  { code: '‌', name: 'zero-width non-joiner' },
  { code: '‎', name: 'left-to-right mark' },
  { code: '‏', name: 'right-to-left mark' },
  { code: '﻿', name: 'zero-width no-break space' },
]
