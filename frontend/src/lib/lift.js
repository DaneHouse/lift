// LIFT build (VITE_LIFT=1): the App Store fork's switches. Off in every openGym build.
//
// - No catalogue media: the exercise stills and animations are licensed to openGym only
//   (catalogue/media/NOTICE.md), so a LIFT build shows the muscles an exercise works instead.
// `import.meta.env` is undefined in plain Node; the guard keeps this module loadable without Vite.
const ENV = import.meta.env || {}
export const LIFT = ENV.VITE_LIFT === '1'

// The app's name as people see it. Translations and copy say "openGym"; a LIFT build shows its own
// name instead. Only the capitalised product name is swapped — URLs and file formats keep theirs.
export const APP_NAME = LIFT ? 'LIFT' : 'openGym'
export const brand = s => (LIFT && typeof s === 'string' ? s.replaceAll('openGym', APP_NAME) : s)

// LIFT has no exercise animations of its own yet (see above), so "how do I do this" opens a
// YouTube search for the exercise's form. A link, not a copy: nothing is hosted or bundled.
export const howToUrl = name => 'https://www.youtube.com/results?search_query=' + encodeURIComponent((name || '') + ' proper form')
export const openHowTo = name => window.open(howToUrl(name), '_blank', 'noopener,noreferrer')

// LIFT's Supabase project. The publishable key is meant to ship inside the app: row-level security
// decides what it can do (today: send feedback, nothing else). Never put a secret/service key here.
export const SUPABASE_URL = 'https://yrmlukevtgbjtfwkdiox.supabase.co'
export const SUPABASE_KEY = 'sb_publishable_vVApJBYIZZhpK4d3MnTAUg_J7I2J7j9'
