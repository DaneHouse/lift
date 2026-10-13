// LIFT onboarding → a training plan. Pure: answers in, routines + weekly schedule out.
//
// answers = { unit, goal, experience, days: [weekday…] (DAYN index, 1 = Monday), length (minutes),
//             gym (GYMS key), injuries: [area…], note, starts: { exerciseId: weight } }
import { uid } from './format.js'
import { planTemplate, fitRoutines } from './starter.js'

export const GOALS = ['strength', 'muscle', 'general', 'fatloss']
export const EXPERIENCE = ['new', 'returning', 'regular']
export const LENGTHS = [45, 60, 75, 90]
export const INJURY_AREAS = ['shoulder', 'elbow-wrist', 'neck', 'low-back', 'hip', 'knee', 'ankle']

const COMMERCIAL = ['body weight', 'dumbbell', 'cable', 'barbell', 'leverage machine', 'band', 'kettlebell', 'resistance band',
  'weighted', 'smith machine', 'stability ball', 'ez barbell', 'medicine ball', 'sled machine', 'weight plate', 'rope', 'assisted',
  'landmine', 'bosu ball', 'trap bar', 'olympic barbell', 'elliptical machine', 'stationary bike', 'wheel roller', 'stepmill machine',
  'roller', 'bench', 'pull-up bar']

// Where you train → what the plan may use. Chains are typical floors, not a promise for every club:
// the profile they create is editable in Settings → Equipment.
export const GYMS = {
  '24-hour-fitness': { name: '24 Hour Fitness', equipment: COMMERCIAL },
  'la-fitness': { name: 'LA Fitness', equipment: COMMERCIAL },
  'equinox': { name: 'Equinox', equipment: [...COMMERCIAL, 'sandbag', 'suspension trainer', 'skierg machine'] },
  // No free barbells or squat racks on a typical Planet Fitness floor: Smith machines instead.
  'planet-fitness': { name: 'Planet Fitness', equipment: ['body weight', 'dumbbell', 'cable', 'leverage machine', 'smith machine', 'sled machine',
    'assisted', 'stability ball', 'medicine ball', 'elliptical machine', 'stationary bike', 'stepmill machine', 'roller', 'bench', 'rope'] },
  'other-gym': { name: 'My gym', equipment: COMMERCIAL },
  'home-rack': { name: 'Home gym', equipment: ['body weight', 'barbell', 'olympic barbell', 'ez barbell', 'dumbbell', 'weight plate', 'bench',
    'pull-up bar', 'band', 'resistance band', 'landmine'] },
  'home-dumbbells': { name: 'Home (dumbbells)', equipment: ['body weight', 'dumbbell', 'bench', 'band', 'resistance band', 'pull-up bar'] },
  'hotel': { name: 'Hotel gym', equipment: ['body weight', 'dumbbell', 'bench', 'cable', 'stationary bike', 'elliptical machine', 'band'] },
}

// Which split fits the number of days.
export function splitFor(days, experience) {
  const n = days.length
  if (n <= 2) return 'full-body'
  if (n === 3) return experience === 'new' ? 'full-body' : 'ppl'
  if (n === 4) return 'upper-lower'
  return 'ppl'
}

// Template routines, cycled over the chosen days: 5 days of PPL is push, pull, legs, push, pull.
// More days than routines repeats them; fewer uses the first ones.
function scheduleOver(days, routineCount) {
  return [...days].sort((a, b) => a - b).map((day, i) => ({ day, slot: i % routineCount }))
}

// Shapes one routine's [id, sets, reps] list for goal, experience and session length.
export function shapeRoutine(list, { goal, experience, length }) {
  let out = list.map(([id, sets, reps]) => [id, sets, reps])
  // Session length: 45 min keeps the first four exercises; longer sessions add sets to the main lifts.
  if (length <= 45) out = out.slice(0, 4)
  const extra = length >= 90 ? 3 : length >= 75 ? 2 : 0
  out = out.map(([id, sets, reps], i) => [id, sets + (i < extra ? 1 : 0), reps])
  if (goal === 'strength') out = out.map(([id, sets, reps], i) => (i === 0 ? [id, sets + 1, 5] : i === 1 ? [id, sets, Math.min(reps, 6)] : [id, sets, reps]))
  if (goal === 'fatloss') out = out.map(([id, sets, reps], i) => (i < 2 ? [id, sets, reps] : [id, sets, Math.max(reps, 12)]))
  if (experience === 'new') out = out.map(([id, sets, reps]) => [id, Math.min(sets, 3), reps])
  return out
}

// The lifts worth asking a starting weight for: each routine's first exercise, once each.
export function mainLifts(plan) {
  const seen = new Set()
  return plan.routines.map(r => r.ex[0]?.id).filter(id => id && !seen.has(id) && seen.add(id))
}

/**
 * → { split, routines: [{ id, name, emoji, ex: [{ id, sets, reps, weight }] }], schedule: [{ day, routineId }], fit }
 * `equipment` overrides the gym's list (tests, an edited profile).
 */
export function buildLiftPlan(answers, equipment) {
  const days = (answers.days || []).filter(d => Number.isInteger(d) && d >= 0 && d <= 6)
  if (!days.length) return null
  const split = splitFor(days, answers.experience)
  const gymEq = equipment || GYMS[answers.gym]?.equipment
  let template = planTemplate(split)
  let fit = null
  if (gymEq) { const f = fitRoutines(template, gymEq); template = f.routines; fit = { swapped: f.swapped, dropped: f.dropped } }
  const used = Math.min(template.length, days.length)
  const routines = template.slice(0, used).map(([, name, emoji, list]) => ({
    id: uid(), name, emoji,
    // Progressive overload, two ways (lib/progression.js): the first two lifts of a session move
    // linearly (every rep hit → more weight); accessories use double progression, climbing reps
    // through a range before the weight goes up.
    ex: shapeRoutine(list, answers).map(([id, sets, reps], i) => ({
      id, sets, reps, weight: Number(answers.starts?.[id]) > 0 ? Number(answers.starts[id]) : 0,
      ...(i < 2 ? { prog: 'linear' } : { prog: 'double', repsMin: Math.max(5, reps - 4) }),
    })),
  }))
  const schedule = scheduleOver(days, routines.length).map(({ day, slot }) => ({ day, routineId: routines[slot].id }))
  return { split, routines, schedule, fit }
}
