import { describe, it, expect } from 'vitest'
import { buildLiftPlan, splitFor, shapeRoutine, mainLifts, GYMS } from './lift-plan.js'
import { EXIDX } from './exercises.js'
import { eqAvailable } from './equipment.js'

const base = { goal: 'muscle', experience: 'some', length: 60, gym: '24-hour-fitness' }

describe('splitFor', () => {
  it('picks a split from the number of days', () => {
    expect(splitFor([1, 4], 'some')).toBe('full-body')
    expect(splitFor([1, 3, 5], 'new')).toBe('full-body')
    expect(splitFor([1, 3, 5], 'some')).toBe('ppl')
    expect(splitFor([1, 2, 4, 5], 'some')).toBe('upper-lower')
    expect(splitFor([1, 2, 3, 4, 5, 6], 'some')).toBe('ppl')
  })
})

describe('buildLiftPlan', () => {
  it('puts routines on exactly the chosen days, cycling the split', () => {
    const p = buildLiftPlan({ ...base, days: [6, 1, 2, 3, 4] })
    expect(p.split).toBe('ppl')
    expect(p.schedule.map(s => s.day)).toEqual([1, 2, 3, 4, 6])
    const names = p.schedule.map(s => p.routines.find(r => r.id === s.routineId).name)
    expect(names).toEqual(['Push Day', 'Pull Day', 'Leg Day', 'Push Day', 'Pull Day'])
  })
  it('only uses what the gym has: no free barbell at Planet Fitness', () => {
    const p = buildLiftPlan({ ...base, gym: 'planet-fitness', days: [1, 3, 5] })
    for (const r of p.routines) for (const e of r.ex) expect(eqAvailable(GYMS['planet-fitness'].equipment, EXIDX[e.id])).toBe(true)
    expect(p.fit.swapped).toBeGreaterThan(0)
  })
  it('carries starting weights onto the main lifts', () => {
    const p = buildLiftPlan({ ...base, days: [1, 3, 5], starts: { '0025': 135 } })
    const bench = p.routines.flatMap(r => r.ex).find(e => e.id === '0025')
    expect(bench.weight).toBe(135)
    expect(mainLifts(p)).toContain('0025')
  })
  it('is null without days', () => {
    expect(buildLiftPlan({ ...base, days: [] })).toBeNull()
  })
})

describe('shapeRoutine', () => {
  const list = [['a', 4, 8], ['b', 3, 10], ['c', 3, 12], ['d', 3, 12], ['e', 3, 12], ['f', 3, 10]]
  it('trims a 45 minute session to four exercises', () => {
    expect(shapeRoutine(list, { length: 45 })).toHaveLength(4)
  })
  it('adds sets to the main lifts for long sessions', () => {
    expect(shapeRoutine(list, { length: 90 }).slice(0, 4).map(x => x[1])).toEqual([5, 4, 4, 3])
  })
  it('drops the top lift to fives for strength', () => {
    expect(shapeRoutine(list, { length: 60, goal: 'strength' })[0]).toEqual(['a', 5, 5])
  })
  it('caps sets at three for a new lifter', () => {
    expect(shapeRoutine(list, { length: 60, experience: 'new' }).every(x => x[1] <= 3)).toBe(true)
  })
})
