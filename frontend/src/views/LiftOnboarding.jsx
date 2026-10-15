import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore.js'
import { t } from '../lib/i18n.js'
import { DAYN, exerciseNameText } from '../lib/format.js'
import { exOr } from '../lib/exercises.js'
import { newProfile } from '../lib/equipment.js'
import { buildLiftPlan, mainLifts, GYMS, INJURY_AREAS } from '../lib/lift-plan.js'
import { APP_NAME } from '../lib/lift.js'
import { Button } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'
import '../coach.css'

// LIFT: the first-run interview, one question a screen, that ends in your plan. Shown until
// S.liftOnboarded; Settings → Redo onboarding sets it back (history is never touched).
const GOALS = [
  ['muscle', () => [t('Build muscle'), t('Volume and progression.')], 'arm'],
  ['strength', () => [t('Get stronger'), t('Heavier lifts, lower reps.')], 'barbell'],
  ['fatloss', () => [t('Lose fat'), t('Keep strength while leaning out.')], 'flame'],
  ['general', () => [t('General fitness'), t('Balanced, sustainable training.')], 'heart'],
]
const EXPERIENCE = [
  ['new', () => [t('New to lifting'), t('First months in the gym.')], 'sparkles'],
  ['returning', () => [t('Coming back after a break'), t('You know the movements; the numbers need rebuilding.')], 'reset'],
  ['regular', () => [t('Training regularly'), t('Consistent for a while now.')], 'trophy'],
]
const GYM_LIST = [
  ['24-hour-fitness', 'machine'], ['la-fitness', 'machine'], ['planet-fitness', 'machine'], ['equinox', 'machine'],
  ['other-gym', 'dumbbell'], ['home-rack', 'barbell'], ['home-dumbbells', 'dumbbell'], ['hotel', 'key'],
]
const AREA_NAME = { shoulder: 'Shoulder', 'elbow-wrist': 'Elbow / wrist', neck: 'Neck', 'low-back': 'Low back', hip: 'Hip', knee: 'Knee', ankle: 'Ankle' }
const LENGTHS = [45, 60, 75, 90]
const STEPS = ['welcome', 'units', 'goal', 'experience', 'days', 'length', 'gym', 'injuries', 'starts', 'done']

export default function LiftOnboarding() {
  const S = useStore(s => s.S)
  const update = useStore(s => s.update)
  const setUnit = useStore(s => s.setUnit)
  const redo = !!S.liftProfile
  const [step, setStep] = useState(0)
  const [a, setA] = useState(() => ({
    unit: S.unit || 'lb', goal: null, experience: null, days: [1, 3, 5], length: 60, gym: null, gyms: [],
    injuries: [], note: '', starts: {}, ...(S.liftProfile || {}),
  }))
  const set = patch => setA(v => ({ ...v, ...patch }))
  const key = STEPS[step]
  const plan = useMemo(() => (a.days.length ? buildLiftPlan(a) : null), [a])
  const lifts = plan ? mainLifts(plan) : []

  const canNext = { goal: !!a.goal, experience: !!a.experience, days: a.days.length > 0, gym: !!a.gym }[key] ?? true
  // Several places to train: the first one picked is the main gym the plan is built for; every pick
  // becomes an equipment profile, so switching gyms later (Settings → Equipment) is one tap.
  const toggleGym = v => { const gyms = (a.gyms || []).includes(v) ? a.gyms.filter(x => x !== v) : [...(a.gyms || []), v]; set({ gyms, gym: gyms[0] || null }) }
  const next = () => setStep(s => Math.min(STEPS.length - 1, s + 1))
  const back = () => setStep(s => Math.max(0, s - 1))

  const keepPlan = () => update(st => { st.liftOnboarded = true })
  const finish = () => {
    const built = buildLiftPlan(a)
    if (!built) return
    const gym = GYMS[a.gym]
    // Through the store, so weights already logged in the other unit are converted, not relabelled.
    if ((S.unit || 'kg') !== a.unit) setUnit(a.unit)
    update(st => {
      // The gym becomes an equipment profile you can edit in Settings → Equipment, and is the one in use.
      const picks = (a.gyms && a.gyms.length ? a.gyms : [a.gym]).filter(Boolean)
      const profiles = picks.map(k => ({ ...newProfile(GYMS[k].name), equipment: [...GYMS[k].equipment], lift: true }))
      st.equipProfiles = [...(st.equipProfiles || []).filter(p => !p.lift), ...profiles]
      st.activeEquipId = profiles[0].id
      st.equipFilterOn = true
      st.routines.push(...built.routines)
      for (let d = 0; d <= 6; d++) st.week[d] = []
      built.schedule.forEach(({ day, routineId }) => { st.week[day] = [routineId] })
      const limitations = [...a.injuries.map(x => AREA_NAME[x]), a.note].filter(Boolean).join('; ')
      // Same shape the Coach's own intake keeps, so the Coach starts from these answers.
      st.coach = { ...(st.coach || {}), profile: { ...(st.coach?.profile || {}), goal: a.goal, experience: a.experience,
        daysPerWeek: a.days.length, preferredDays: [...a.days], sessionMin: a.length, equipment: [...gym.equipment], limitations } }
      st.liftProfile = { ...a, at: Date.now(), split: built.split }
      st.liftOnboarded = true
    })
  }

  const choice = (on, icon, title, sub, onClick) => (
    <button key={title} className={'ob-choice' + (on ? ' on' : '')} onClick={onClick}>
      <Icon name={icon} />
      <span className="ob-choice-t">{title}{sub && <span className="ob-choice-s">{sub}</span>}</span>
      <Icon name="check" className="ob-k" />
    </button>
  )
  const toggle = (list, v) => (list.includes(v) ? list.filter(x => x !== v) : [...list, v])
  const dots = STEPS.slice(1, -1)

  return <div className="narrow ob lift-ob">
    {key !== 'welcome' && <div className="ob-top">
      <button className="iconbtn" onClick={back} aria-label={t('Back')}><Icon name="chevronLeft" /></button>
      <div className="ob-dots">{dots.map((s, i) => <span key={s} className={'ob-dot' + (s === key ? ' on' : i < dots.indexOf(key) || key === 'done' ? ' done' : '')} />)}</div>
      <span style={{ width: 36 }} />
    </div>}

    <div className="ob-body">
      {key === 'welcome' && <div className="lift-ob-hero">
        <h1 className="ob-h" style={{ fontSize: 44 }}>{APP_NAME}</h1>
        <p className="ob-p">{t('A few questions, then your plan: built for your goal, your days and the gym you actually train at.')}</p>
      </div>}

      {key === 'units' && <>
        <div className="ob-eyebrow">{t('Units')}</div>
        <h1 className="ob-h">{t('Pounds or kilos?')}</h1>
        <div className="ob-choices">
          {choice(a.unit === 'lb', 'barbell', t('Pounds (lb)'), null, () => set({ unit: 'lb' }))}
          {choice(a.unit === 'kg', 'barbell', t('Kilograms (kg)'), null, () => set({ unit: 'kg' }))}
        </div>
      </>}

      {key === 'goal' && <>
        <div className="ob-eyebrow">{t('Your goal')}</div>
        <h1 className="ob-h">{t('What are you training for?')}</h1>
        <div className="ob-choices">{GOALS.map(([v, text, icon]) => { const [ti, sub] = text(); return choice(a.goal === v, icon, ti, sub, () => set({ goal: v })) })}</div>
      </>}

      {key === 'experience' && <>
        <div className="ob-eyebrow">{t('Experience')}</div>
        <h1 className="ob-h">{t('Where are you starting from?')}</h1>
        <div className="ob-choices">{EXPERIENCE.map(([v, text, icon]) => { const [ti, sub] = text(); return choice(a.experience === v, icon, ti, sub, () => set({ experience: v })) })}</div>
      </>}

      {key === 'days' && <>
        <div className="ob-eyebrow">{t('Schedule')}</div>
        <h1 className="ob-h">{t('Which days do you train?')}</h1>
        <p className="ob-p">{t('Pick what you will actually keep. The split follows: 2–3 days full body or push/pull/legs, 4 upper/lower, 5–6 push/pull/legs.')}</p>
        <div className="ob-week">
          {[1, 2, 3, 4, 5, 6, 0].map(d => <button key={d} className={'ob-wd' + (a.days.includes(d) ? ' on' : '')} onClick={() => set({ days: toggle(a.days, d) })}>{t(DAYN[d]).slice(0, 2)}</button>)}
        </div>
        <div className="ob-sub">{a.days.length} {t('days a week')}</div>
      </>}

      {key === 'length' && <>
        <div className="ob-eyebrow">{t('Session length')}</div>
        <h1 className="ob-h">{t('How long is a session?')}</h1>
        <p className="ob-p">{t('Longer sessions get more sets on the main lifts; 45 minutes keeps the essentials.')}</p>
        <div className="ob-choices">{LENGTHS.map(m => choice(a.length === m, 'timer', t('{0} min', m), null, () => set({ length: m })))}</div>
      </>}

      {key === 'gym' && <>
        <div className="ob-eyebrow">{t('Your gym')}</div>
        <h1 className="ob-h">{t('Where do you train?')}</h1>
        <p className="ob-p">{t('Pick every place you train. Your first pick is your main gym and the plan only uses what it has; the others are saved to switch to. Edit machines later in Settings → Equipment.')}</p>
        <div className="ob-choices">{GYM_LIST.map(([v, icon]) => choice((a.gyms || []).includes(v), icon, GYMS[v].name, a.gyms?.[0] === v && a.gyms.length > 1 ? t('Main gym') : null, () => toggleGym(v)))}</div>
      </>}

      {key === 'injuries' && <>
        <div className="ob-eyebrow">{t('Injuries')}</div>
        <h1 className="ob-h">{t('Anything hurt or healing?')}</h1>
        <p className="ob-p">{t('Your coach plans around it. Skip if nothing does.')}</p>
        <div className="chips lift-ob-chips">
          {INJURY_AREAS.map(x => <button key={x} className={'chip nocap' + (a.injuries.includes(x) ? ' on' : '')} onClick={() => set({ injuries: toggle(a.injuries, x) })}>{t(AREA_NAME[x])}</button>)}
        </div>
        <textarea className="input" rows={3} maxLength={300} placeholder={t('What happened, and how it feels now (optional)')} value={a.note} onChange={e => set({ note: e.target.value })} />
      </>}

      {key === 'starts' && <>
        <div className="ob-eyebrow">{t('Starting weights')}</div>
        <h1 className="ob-h">{t('What do you lift now?')}</h1>
        <p className="ob-p">{t('A weight you can do for about 8 clean reps. Leave it empty and your first session finds it.')}</p>
        {lifts.map(id => <label key={id} className="lift-ob-start">
          <span>{exerciseNameText(exOr(id))}</span>
          <input className="input num" inputMode="decimal" placeholder="–" value={a.starts[id] ?? ''}
            onChange={e => set({ starts: { ...a.starts, [id]: e.target.value.replace(/[^0-9.]/g, '') } })} />
          <span className="dim">{a.unit}</span>
        </label>)}
      </>}

      {key === 'done' && plan && <>
        <div className="ob-eyebrow">{t('Your plan')}</div>
        <h1 className="ob-h">{t('Ready.')}</h1>
        <div className="lift-ob-plan">
          {plan.schedule.map(({ day, routineId }) => {
            const r = plan.routines.find(x => x.id === routineId)
            return <div key={day} className="lift-ob-day"><b>{t(DAYN[day]).slice(0, 3)}</b><span>{r.name}</span><span className="dim">{r.ex.length} {t('exercises')}</span></div>
          })}
        </div>
        <p className="ob-p">{t('Progressive overload is on: hit every rep and the weight goes up next time; miss and it holds; stall three times and it deloads.')}</p>
        {plan.fit?.swapped > 0 && <p className="ob-p dim">{t('{0} exercises swapped for what {1} has.', plan.fit.swapped, GYMS[a.gym].name)}</p>}
      </>}
    </div>

    <div className="ob-foot">
      {key === 'welcome'
        ? <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            <Button variant="primary" onClick={next}>{redo ? t('Redo onboarding') : t('Get started')}</Button>
            {S.routines.length > 0 && <Button onClick={keepPlan}>{t('Keep my current plan')}</Button>}
          </div>
        : <Button variant="primary" style={{ flex: 1 }} disabled={!canNext} onClick={key === 'done' ? finish : next}>
            {key === 'done' ? t('Start training') : key === 'injuries' && !a.injuries.length && !a.note ? t('Nothing hurts') : t('Next')}
          </Button>}
    </div>
  </div>
}
