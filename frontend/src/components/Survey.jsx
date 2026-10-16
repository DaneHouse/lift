import { useState } from 'react'
import { t } from '../lib/i18n.js'
import { sendFeedback } from '../lib/feedback.js'
import { useStore } from '../store/useStore.js'
import { useUI } from '../store/useUI.js'
import { Button } from './ui.jsx'

// LIFT tester survey: how people train today and what they want from a workout app. One sheet,
// sent into the same feedback inbox as bugs and ideas (kind 'survey', answers as JSON).
const NOW = ['Hevy', 'Strong', 'Fitbod', 'Apple Fitness', 'Notes app', 'In my head', 'A coach / PDF plan', 'Nothing yet']
const WEAR = ['Apple Watch', 'Garmin', 'WHOOP', 'Oura', 'None']
const FOOD = ['I track macros', 'Sometimes', 'No']

function Survey({ close }) {
  const update = useStore(s => s.update)
  const [a, setA] = useState({ now: [], like: '', missing: '', oneThing: '', wear: [], food: '', name: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const set = p => setA(v => ({ ...v, ...p }))
  const toggle = (k, v) => set({ [k]: a[k].includes(v) ? a[k].filter(x => x !== v) : [...a[k], v] })
  const chips = (k, list, multi = true) => <div className="chips" style={{ flexWrap: 'wrap', margin: '6px 0 14px' }}>
    {list.map(v => <button key={v} type="button" className={'chip nocap' + ((multi ? a[k].includes(v) : a[k] === v) ? ' on' : '')} onClick={() => (multi ? toggle(k, v) : set({ [k]: v }))}>{t(v)}</button>)}
  </div>
  const area = (k, ph) => <textarea className="input" rows={2} maxLength={800} value={a[k]} placeholder={ph} onChange={e => set({ [k]: e.target.value })} style={{ margin: '6px 0 14px' }} />
  const send = async () => {
    setBusy(true); setErr('')
    try {
      const summary = [a.now.join(', '), a.missing, a.oneThing].filter(Boolean).join(' | ') || 'survey'
      await sendFeedback({ kind: 'survey', answers: a, name: a.name, message: summary, screen: 'survey', appVersion: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '', device: navigator.userAgent })
      update(st => { st.surveyDone = true })
      close()
      useUI.getState().toast(t('Thanks. This shapes what gets built next.'))
    } catch { setErr(t('Couldn’t send. Check your connection and try again.')) } finally { setBusy(false) }
  }
  return <>
    <h3>{t('What do you want from a workout app?')}</h3>
    <div className="muted small">{t('Two minutes. Every answer is read.')}</div>
    <div className="sec small" style={{ marginTop: 14 }}>{t('How do you track your lifts today?')}</div>
    {chips('now', NOW)}
    <div className="sec small">{t('What do you like about it?')}</div>
    {area('like', t('e.g. fast to log, my friends are on it'))}
    <div className="sec small">{t('What’s missing or annoying?')}</div>
    {area('missing', t('e.g. never know what weight to use'))}
    <div className="sec small">{t('If an app did one thing perfectly for you at the gym, what would it be?')}</div>
    {area('oneThing', '')}
    <div className="sec small">{t('Do you wear a watch or tracker?')}</div>
    {chips('wear', WEAR)}
    <div className="sec small">{t('Do you track food?')}</div>
    {chips('food', FOOD, false)}
    <input className="input" maxLength={80} placeholder={t('Your name (optional)')} value={a.name} onChange={e => set({ name: e.target.value })} />
    {err && <div className="small" role="alert" style={{ color: 'var(--red)', marginTop: 10 }}>{err}</div>}
    <div style={{ height: 12 }} />
    <Button variant="primary" disabled={busy} onClick={send}>{busy ? t('Sending…') : t('Send')}</Button>
  </>
}

export const surveySheet = () => useUI.getState().openSheet(close => <Survey close={close} />)
