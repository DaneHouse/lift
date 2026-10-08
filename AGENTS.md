# AGENTS.md — rules for anyone building LIFT

Read `SPEC.md` first. It is the source of truth.

## CLEAN-ROOM RULE (non-negotiable)

LIFT is proprietary and must contain **zero code, text, prompts, data files or assets derived from openGym** (AGPL). openGym was only used as product inspiration; features are described in SPEC.md in our own words.

- Do NOT open, read, search, copy from or reference: `~/Desktop/openGym`, `~/Desktop/openGym-dev`, `~/Desktop/openGym-coach-import`, `github.com/DuarteSantos8/openGym`, `kdaneshmir-gif/opengym-coach`, or any openGym docs/website/demo.
- Do NOT add openGym as a dependency, submodule or reference implementation.
- Third-party material allowed only when its license permits commercial closed-source use, with attribution recorded in `ACKNOWLEDGEMENTS.md`: exercise metadata/instructions from `hasaneyldrm/exercises-dataset` (MIT, metadata only, never its images/GIFs); body-map paths from `melihcolpan/MuscleMap` (MIT). Every other third-party asset needs Kassra's OK.
- Write all coach prompts, rehab menus, copy and algorithms fresh from SPEC.md.

## Working rules

- TypeScript strict. Pure domain logic in `src/domain/*` with tests next to it; UI never computes training logic itself.
- Pin exact dependency versions that are at least two weeks old.
- Commit after each completed item with a clear message; tests green before each commit. Do not push unless the run prompt says so.
- Never commit secrets, `.env`, Apple/RevenueCat/Supabase/Anthropic keys, or any real user's health data. Use `.env.example` with names only.
- Nothing outbound without Kassra: no App Store / TestFlight external / Garmin submissions, no purchases, no emails.
- UI copy: plain, short, no emoji, no hype.
- At the end of every run write `~/.agent-handoff/CODEX_TO_CLAUDE_LATEST.md`: done items (commit hashes), test output summary, decisions made, numbered open questions for Kassra, next run's plan.
