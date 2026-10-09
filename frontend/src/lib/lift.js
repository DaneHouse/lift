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
