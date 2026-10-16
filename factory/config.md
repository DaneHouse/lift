# Factory config: LIFT

## Base branch
main

## Remote
origin  (https://github.com/kdaneshmir-gif/lift.git). PUBLIC repo. iOS TestFlight builds come from .github/workflows/ios-testflight.yml (manual dispatch).

## Verify commands
Frontend (frontend/** touched), run inside frontend/:
- `npm test`
- `npm run build`
- `node scripts/check-locales.mjs`
- `node scripts/check-source-strings.mjs`
API (api/** touched), inside api/: `npm test`
MCP (mcp/** touched), inside mcp/: `npm test`
LIFT build sanity when LIFT-flagged code changes, inside frontend/: `VITE_MOBILE=1 VITE_LIFT=1 npx vite build`

## UI paths
frontend/src/views/**, frontend/src/components/**, frontend/src/**/*.css, frontend/src/sheets.jsx, frontend/src/App.jsx, frontend/src/locales/**

## Source of truth docs
docs/LIFT_PLAN.md (what to build and in what order), CLAUDE.md (architecture + conventions), docs/dev/* for the feature area

## Hard rules
- PUBLIC AGPL repo. Never commit secrets, .env, API keys, personal data, workout exports, or anything from ~/Desktop/lift-cleanroom (DaneHouse/lift-cleanroom). Never read the cleanroom repo.
- LIFT-only behaviour goes behind the VITE_LIFT build flag. Self-hosted and local-only openGym modes must keep working.
- No exercise catalogue media in LIFT builds (licensed to openGym only); muscle map instead.
- Plain JS, no TypeScript, no new linters. Match existing style by hand. Keep dependencies lean; @supabase/supabase-js is allowed.
- User-facing strings go through the locale files; the locale checks must pass.
- No health/medical claims in copy. No cancel friction in any paywall.
- Never push to main, never dispatch the iOS workflow, never touch ASC/TestFlight.

## Models
spec-writer: opus · builder: sonnet · reviewers: sonnet
