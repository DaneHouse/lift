// LIFT build (VITE_LIFT=1): the App Store fork's switches. Off in every openGym build.
//
// - No catalogue media: the exercise stills and animations are licensed to openGym only
//   (catalogue/media/NOTICE.md), so a LIFT build shows the muscles an exercise works instead.
// `import.meta.env` is undefined in plain Node; the guard keeps this module loadable without Vite.
const ENV = import.meta.env || {}
export const LIFT = ENV.VITE_LIFT === '1'
