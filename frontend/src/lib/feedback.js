// LIFT: "Report a bug" — a message, the screen it came from and an optional screenshot, sent
// straight to the LIFT Supabase project (supabase/migrations/*_feedback.sql: insert-only).
import { SUPABASE_URL, SUPABASE_KEY } from './lift.js'

const headers = extra => ({ apikey: SUPABASE_KEY, ...extra })

export async function sendFeedback({ message, screen = '', file = null, appVersion = '', device = '' }) {
  const text = String(message || '').trim()
  if (!text) throw new Error('empty')
  let screenshot = null
  if (file) {
    const ext = (file.type || 'image/png').split('/')[1] || 'png'
    const name = `${new Date().toISOString().slice(0, 10)}/${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}.${ext}`
    const up = await fetch(`${SUPABASE_URL}/storage/v1/object/feedback/${name}`, {
      method: 'POST', headers: headers({ 'Content-Type': file.type || 'image/png' }), body: file,
    })
    if (up.ok) screenshot = name
  }
  const r = await fetch(`${SUPABASE_URL}/rest/v1/feedback`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
    body: JSON.stringify({ message: text.slice(0, 4000), screen: String(screen).slice(0, 200), app_version: String(appVersion).slice(0, 40), device: String(device).slice(0, 200), screenshot }),
  })
  if (!r.ok) throw new Error('send failed: ' + r.status)
  return true
}
