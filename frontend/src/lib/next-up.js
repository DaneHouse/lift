// What comes after this rest: the first unchecked set, looking from the exercise that started the
// rest onwards (then from the top, for anything skipped earlier). Pure, so the rest bar can show
// "Next: Incline Bench Press · 60 × 10" without the workout screen in view.
//
// → { idx, set: index within the entry, id: exercise id, w, r, sec } or null when every set is done.
export function nextUp(active, fromIdx = 0) {
  const entries = active?.entries
  if (!Array.isArray(entries) || !entries.length) return null
  const start = Number.isInteger(fromIdx) && fromIdx >= 0 && fromIdx < entries.length ? fromIdx : 0
  for (let k = 0; k < entries.length; k++) {
    const idx = (start + k) % entries.length
    const entry = entries[idx]
    const sets = Array.isArray(entry?.sets) ? entry.sets : []
    const i = sets.findIndex(s => s && !s.done)
    if (i >= 0) {
      const s = sets[i]
      return { idx, set: i, id: entry.id, w: s.w, r: s.r, sec: s.sec ?? s.t }
    }
  }
  return null
}
