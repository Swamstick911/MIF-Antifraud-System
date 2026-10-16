import { useEffect, useState } from 'react'
import { storage } from '../platform/bridge.js'

// Accessibility and appearance settings.
const DEFAULTS = { theme: 'dark', scale: 1, contrast: false }

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULTS)

  useEffect(() => {
    storage.get('settings', DEFAULTS).then((stored) => {
      const next = { ...DEFAULTS, ...stored }
      // URL overrides let a demo or a screenshot pin an appearance without
      // depending on whatever is already in this browser's storage.
      if (typeof window !== 'undefined') {
        const q = new URLSearchParams(window.location.search)
        const theme = q.get('theme')
        const scale = Number(q.get('scale'))
        if (theme === 'light' || theme === 'dark') next.theme = theme
        if (q.get('contrast') === '1') next.contrast = true
        if (scale >= 0.9 && scale <= 1.5) next.scale = scale
      }
      setSettings(next)
    })
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('light', settings.theme === 'light')
    root.classList.toggle('contrast', settings.contrast)
    root.style.setProperty('--scale', String(settings.scale))
    storage.set('settings', settings)
  }, [settings])

  const update = (patch) => setSettings((s) => ({ ...s, ...patch }))
  return [settings, update]
}
