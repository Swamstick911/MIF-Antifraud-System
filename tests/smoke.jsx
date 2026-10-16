// Render smoke test.
import React from 'react'
import { renderToString } from 'react-dom/server'
import App from '../src/ui/App.jsx'
import Popup from '../src/ui/Popup.jsx'
import Overview from '../src/ui/tabs/Overview.jsx'
import MessageShield from '../src/ui/tabs/MessageShield.jsx'
import FileShield from '../src/ui/tabs/FileShield.jsx'
import CallShield from '../src/ui/tabs/CallShield.jsx'

const cases = [
  ['App', <App />],
  ['Popup', <Popup />],
  ['Overview', <Overview onNavigate={() => {}} />],
  ['MessageShield', <MessageShield />],
  ['FileShield', <FileShield />],
  ['CallShield', <CallShield />],
]

let failed = 0
for (const [name, element] of cases) {
  try {
    const html = renderToString(element)
    if (html.length < 200) throw new Error(`rendered suspiciously little (${html.length} chars)`)
    console.log(`  ok    ${name.padEnd(15)} ${html.length} chars`)
  } catch (error) {
    failed++
    console.error(`  FAIL  ${name}: ${error.message}`)
  }
}
console.log(failed ? `\n${failed} screen(s) failed to render` : '\nAll screens render.')
process.exit(failed ? 1 : 0)
