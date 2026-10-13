// LIFT: the next planned session after today, for "done for today" screens. Pure.
// S.week maps a weekday (0 = Sunday) to routine ids; routines resolve by id.
// → { inDays, date, routines: [routine…] } or null when nothing is planned in the next 7 days.
export function nextSession(S, today = new Date()) {
  const byId = new Map((S?.routines || []).map(r => [r.id, r]))
  for (let k = 1; k <= 7; k++) {
    const d = new Date(today); d.setDate(today.getDate() + k)
    const ids = [].concat(S?.week?.[d.getDay()] || [])
    const routines = ids.map(id => byId.get(id)).filter(Boolean)
    if (routines.length) return { inDays: k, date: d, routines }
  }
  return null
}

// Today's finished sessions summed: minutes, sets done, PRs.
export function todayTotals(workouts, iso) {
  const list = (workouts || []).filter(w => w.d === iso)
  if (!list.length) return null
  const min = Math.round(list.reduce((n, w) => n + Math.max(0, (w.end || 0) - (w.start || 0)), 0) / 60000)
  const sets = list.reduce((n, w) => n + (w.entries || []).reduce((m, e) => m + (e.sets || []).filter(s => s.done).length, 0), 0)
  const prs = list.reduce((n, w) => n + (Array.isArray(w.prs) ? w.prs.length : 0), 0)
  return { names: list.map(w => w.name).filter(Boolean), min, sets, prs }
}
