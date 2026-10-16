import { useState } from 'react'
import { t } from '../lib/i18n.js'
import { sendFeedback } from '../lib/feedback.js'
import { Button } from './ui.jsx'
import Icon from './Icon.jsx'
import { useUI } from '../store/useUI.js'

// LIFT: the bug / feedback sheet. Opened from Settings and from a workout's menu.
function ReportBug({ close, screen, shot }) {
  const [msg, setMsg] = useState('')
  const [file, setFile] = useState(shot || null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [kind, setKind] = useState('bug')
  const send = async () => {
    setBusy(true); setErr('')
    try {
      await sendFeedback({ kind, message: msg, file, screen, appVersion: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '', device: navigator.userAgent })
      close()
      useUI.getState().toast?.(t('Sent. Thank you.'))
    } catch {
      setErr(t('Couldn’t send. Check your connection and try again.'))
    } finally { setBusy(false) }
  }
  return <>
    <h3>{kind === 'bug' ? t('Report a bug') : t('Share an idea')}</h3>
    <div className="chips" style={{ margin: '0 0 10px' }}>
      <button type="button" className={'chip nocap' + (kind === 'bug' ? ' on' : '')} onClick={() => setKind('bug')}>{t('Bug')}</button>
      <button type="button" className={'chip nocap' + (kind === 'idea' ? ' on' : '')} onClick={() => setKind('idea')}>{t('Idea')}</button>
    </div>
    <div className="muted small" style={{ marginBottom: 12 }}>{t('What happened, and what you expected instead. A screenshot helps.')}</div>
    <textarea className="input" rows={5} maxLength={4000} autoFocus value={msg} onChange={e => setMsg(e.target.value)} placeholder={t('e.g. The rest timer didn’t ring with the phone locked')} />
    {file && file.type?.startsWith('image/') && <img className="report-shot" alt="" src={URL.createObjectURL(file)} />}
    <label className="btn plain report-attach" style={{ marginTop: 10 }}>
      <Icon name="image" /><span>{file ? file.name || t('Screenshot attached') : t('Attach a screenshot')}</span>
      <input type="file" accept="image/*" hidden onChange={e => setFile(e.target.files?.[0] || null)} />
    </label>
    {err && <div className="small" role="alert" style={{ color: 'var(--red)', marginTop: 10 }}>{err}</div>}
    <div style={{ height: 12 }} />
    <Button variant="primary" disabled={busy || !msg.trim()} onClick={send}>{busy ? t('Sending…') : t('Send')}</Button>
  </>
}

export const reportBugSheet = (screen, shot) => useUI.getState().openSheet(close => <ReportBug close={close} screen={screen || location.hash} shot={shot} />)

// A screenshot taken in the app (lib/rest-alert.js, iOS) → this sheet with the shot attached.
export function reportFromScreenshot(ev) {
  let shot = null
  if (ev?.jpeg) {
    const bin = atob(ev.jpeg)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    shot = new File([bytes], 'screenshot.jpg', { type: 'image/jpeg' })
  }
  reportBugSheet(location.hash, shot)
}
