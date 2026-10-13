import { useState } from 'react'
import { t } from '../lib/i18n.js'
import { sendFeedback } from '../lib/feedback.js'
import { Button } from './ui.jsx'
import Icon from './Icon.jsx'
import { useUI } from '../store/useUI.js'

// LIFT: the bug / feedback sheet. Opened from Settings and from a workout's menu.
function ReportBug({ close, screen }) {
  const [msg, setMsg] = useState('')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const send = async () => {
    setBusy(true); setErr('')
    try {
      await sendFeedback({ message: msg, file, screen, appVersion: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '', device: navigator.userAgent })
      close()
      useUI.getState().toast?.(t('Sent. Thank you.'))
    } catch {
      setErr(t('Couldn’t send. Check your connection and try again.'))
    } finally { setBusy(false) }
  }
  return <>
    <h3>{t('Report a bug')}</h3>
    <div className="muted small" style={{ marginBottom: 12 }}>{t('What happened, and what you expected instead. A screenshot helps.')}</div>
    <textarea className="input" rows={5} maxLength={4000} autoFocus value={msg} onChange={e => setMsg(e.target.value)} placeholder={t('e.g. The rest timer didn’t ring with the phone locked')} />
    <label className="btn plain report-attach" style={{ marginTop: 10 }}>
      <Icon name="image" /><span>{file ? file.name || t('Screenshot attached') : t('Attach a screenshot')}</span>
      <input type="file" accept="image/*" hidden onChange={e => setFile(e.target.files?.[0] || null)} />
    </label>
    {err && <div className="small" role="alert" style={{ color: 'var(--red)', marginTop: 10 }}>{err}</div>}
    <div style={{ height: 12 }} />
    <Button variant="primary" disabled={busy || !msg.trim()} onClick={send}>{busy ? t('Sending…') : t('Send')}</Button>
  </>
}

export const reportBugSheet = screen => useUI.getState().openSheet(close => <ReportBug close={close} screen={screen || location.hash} />)
