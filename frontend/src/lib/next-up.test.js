import { describe, it, expect } from 'vitest'
import { nextUp } from './next-up.js'

const active = {
  entries: [
    { id: 'a', sets: [{ w: 60, r: 8, done: true }, { w: 60, r: 8, done: true }] },
    { id: 'b', sets: [{ w: 40, r: 10, done: true }, { w: 40, r: 10 }] },
    { id: 'c', sets: [{ w: 20, r: 12 }] },
  ],
}

describe('nextUp', () => {
  it('finds the next unchecked set in the exercise that started the rest', () => {
    expect(nextUp(active, 1)).toEqual({ idx: 1, set: 1, id: 'b', w: 40, r: 10, sec: undefined })
  })
  it('moves on to the next exercise when this one is finished', () => {
    expect(nextUp(active, 0)).toMatchObject({ idx: 1, id: 'b', set: 1 })
  })
  it('wraps to an earlier exercise that was skipped', () => {
    const a = { entries: [{ id: 'x', sets: [{ w: 1, r: 1 }] }, { id: 'y', sets: [{ w: 2, r: 2, done: true }] }] }
    expect(nextUp(a, 1)).toMatchObject({ idx: 0, id: 'x' })
  })
  it('is null when everything is done or there is no workout', () => {
    expect(nextUp({ entries: [{ id: 'a', sets: [{ done: true }] }] }, 0)).toBeNull()
    expect(nextUp(null)).toBeNull()
    expect(nextUp({ entries: [] })).toBeNull()
  })
  it('treats an unknown start as the top', () => {
    expect(nextUp(active, undefined)).toMatchObject({ idx: 1, set: 1 })
    expect(nextUp(active, 99)).toMatchObject({ idx: 1, set: 1 })
  })
})
