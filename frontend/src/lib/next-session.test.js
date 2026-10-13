import { describe, it, expect } from 'vitest'
import { nextSession, todayTotals } from './next-session.js'

const S = { routines: [{ id: 'p', name: 'Push' }, { id: 'l', name: 'Pull' }], week: { 1: ['p'], 3: ['l'] } }

describe('nextSession', () => {
  it('finds the next planned day after today', () => {
    const mon = new Date(2026, 9, 12) // a Monday
    const n = nextSession(S, mon)
    expect(n.inDays).toBe(2)
    expect(n.routines[0].name).toBe('Pull')
  })
  it('wraps into next week', () => {
    const wed = new Date(2026, 9, 14)
    expect(nextSession(S, wed)).toMatchObject({ inDays: 5 })
  })
  it('is null with nothing planned', () => {
    expect(nextSession({ routines: [], week: {} })).toBeNull()
  })
})

describe('todayTotals', () => {
  it('sums today only', () => {
    const w = [
      { d: '2026-10-12', name: 'Push', start: 0, end: 45 * 60000, entries: [{ sets: [{ done: true }, { done: false }] }], prs: [1, 2] },
      { d: '2026-10-11', name: 'Old', start: 0, end: 1, entries: [], prs: [] },
    ]
    expect(todayTotals(w, '2026-10-12')).toEqual({ names: ['Push'], min: 45, sets: 1, prs: 2 })
    expect(todayTotals(w, '2026-10-10')).toBeNull()
  })
})
