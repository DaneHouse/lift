import { describe, expect, it } from 'vitest';
import {
  filterBrowsable,
  normalizeUrl,
  referenceLabel,
  regionOf,
  regionsOf,
  type Browsable,
} from './library';

const items: Browsable[] = [
  {
    id: 'a',
    name: 'Back squat',
    primaryMuscles: ['quads'],
    secondaryMuscles: ['glutes'],
    equipment: 'barbell',
  },
  {
    id: 'b',
    name: 'Pull-up',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['biceps'],
    equipment: 'body weight',
  },
  {
    id: 'c',
    name: 'Cable fly',
    primaryMuscles: ['pectorals'],
    secondaryMuscles: [],
    equipment: 'cable',
  },
];

describe('muscle regions', () => {
  it('maps library muscles onto body map regions', () => {
    expect(regionOf('Quads')).toBe('upper legs');
    expect(regionOf('lats')).toBe('back');
    expect(regionOf('cardiovascular system')).toBeUndefined();
  });
  it('collects regions from primary and secondary muscles', () =>
    expect([...regionsOf(items[0]!)].sort()).toEqual(['glutes', 'upper legs']));
});

describe('browse filters', () => {
  it('searches by name, case-insensitive', () =>
    expect(filterBrowsable(items, { query: '  PULL' }).map((item) => item.id)).toEqual(['b']));
  it('filters by body map region and equipment together', () => {
    expect(filterBrowsable(items, { region: 'back' }).map((item) => item.id)).toEqual(['b']);
    expect(filterBrowsable(items, { equipment: 'cable' }).map((item) => item.id)).toEqual(['c']);
    expect(filterBrowsable(items, { region: 'chest', equipment: 'barbell' })).toEqual([]);
  });
  it('shows only favourites when asked', () =>
    expect(
      filterBrowsable(items, { favouritesOnly: true, favourites: new Set(['c', 'a']) }).map(
        (item) => item.id,
      ),
    ).toEqual(['a', 'c']));
});

describe('reference links', () => {
  it('accepts http(s) and bare hosts, rejects other schemes and junk', () => {
    expect(normalizeUrl('https://www.youtube.com/watch?v=abc')).toBe(
      'https://www.youtube.com/watch?v=abc',
    );
    expect(normalizeUrl('instagram.com/reel/xyz')).toBe('https://instagram.com/reel/xyz');
    expect(normalizeUrl('javascript:alert(1)')).toBeNull();
    expect(normalizeUrl('not a url')).toBeNull();
    expect(normalizeUrl('   ')).toBeNull();
  });
  it('labels common sources', () => {
    expect(referenceLabel('https://www.tiktok.com/@x/video/1')).toBe('TikTok');
    expect(referenceLabel('https://youtu.be/abc')).toBe('YouTube');
    expect(referenceLabel('https://example.com/form')).toBe('example.com');
  });
});
