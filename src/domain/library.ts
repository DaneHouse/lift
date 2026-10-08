export type BodyRegion =
  | 'shoulders'
  | 'chest'
  | 'back'
  | 'arms'
  | 'core'
  | 'glutes'
  | 'upper legs'
  | 'lower legs';

/** Library muscle names mapped to the body map regions. Unknown names (e.g. cardio system) map to nothing. */
const regionByMuscle: Record<string, BodyRegion> = {
  shoulders: 'shoulders',
  delts: 'shoulders',
  deltoids: 'shoulders',
  'rear deltoids': 'shoulders',
  'rotator cuff': 'shoulders',
  chest: 'chest',
  pectorals: 'chest',
  'upper chest': 'chest',
  'serratus anterior': 'chest',
  back: 'back',
  lats: 'back',
  'latissimus dorsi': 'back',
  'upper back': 'back',
  rhomboids: 'back',
  traps: 'back',
  trapezius: 'back',
  spine: 'back',
  'lower back': 'back',
  'levator scapulae': 'back',
  arms: 'arms',
  biceps: 'arms',
  triceps: 'arms',
  forearms: 'arms',
  brachialis: 'arms',
  'wrist flexors': 'arms',
  'wrist extensors': 'arms',
  'grip muscles': 'arms',
  wrists: 'arms',
  hands: 'arms',
  core: 'core',
  abs: 'core',
  abdominals: 'core',
  'lower abs': 'core',
  obliques: 'core',
  'hip flexors': 'core',
  glutes: 'glutes',
  abductors: 'glutes',
  'upper legs': 'upper legs',
  quads: 'upper legs',
  quadriceps: 'upper legs',
  hamstrings: 'upper legs',
  adductors: 'upper legs',
  'inner thighs': 'upper legs',
  groin: 'upper legs',
  calves: 'lower legs',
  soleus: 'lower legs',
  shins: 'lower legs',
  ankles: 'lower legs',
  'ankle stabilizers': 'lower legs',
  feet: 'lower legs',
};

export function regionOf(muscle: string): BodyRegion | undefined {
  return regionByMuscle[muscle.toLowerCase()];
}

/** Everything a list row and a filter need. Works for library and custom exercises alike. */
export type Browsable = {
  id: string;
  name: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string;
};

export function regionsOf(item: Browsable): Set<BodyRegion> {
  const regions = new Set<BodyRegion>();
  for (const muscle of [...item.primaryMuscles, ...item.secondaryMuscles]) {
    const region = regionOf(muscle);
    if (region) regions.add(region);
  }
  return regions;
}

export type BrowseFilter = {
  query?: string | undefined;
  region?: BodyRegion | undefined;
  equipment?: string | undefined;
  favouritesOnly?: boolean | undefined;
  favourites?: ReadonlySet<string> | undefined;
};

export function filterBrowsable<T extends Browsable>(items: T[], filter: BrowseFilter): T[] {
  const query = (filter.query ?? '').trim().toLowerCase();
  return items.filter(
    (item) =>
      (!query || item.name.toLowerCase().includes(query)) &&
      (!filter.region || regionsOf(item).has(filter.region)) &&
      (!filter.equipment || item.equipment === filter.equipment) &&
      (!filter.favouritesOnly || !!filter.favourites?.has(item.id)),
  );
}

export function equipmentOptions(items: Browsable[]): string[] {
  return [...new Set(items.map((item) => item.equipment).filter(Boolean))].sort();
}

/** Primary muscle names offered when editing a custom exercise. */
export function primaryMuscleOptions(items: Browsable[]): string[] {
  return [...new Set(items.flatMap((item) => item.primaryMuscles))].sort();
}

/**
 * Accepts a pasted link and returns a clean http(s) URL, or null. A bare host such as
 * "youtube.com/watch?v=x" is treated as https.
 */
export function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (!url.hostname.includes('.')) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Short source name for a reference row: Instagram, TikTok, YouTube, or the host. */
export function referenceLabel(url: string): string {
  const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  if (host.includes('instagram')) return 'Instagram';
  if (host.includes('tiktok')) return 'TikTok';
  if (host.includes('youtube') || host === 'youtu.be') return 'YouTube';
  return host;
}
