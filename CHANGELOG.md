# Changelog

## 2026-09-11

- Added a standalone TypeScript API for deterministic change-risk analysis.
- Added shared request and response contracts for the API and Next.js UI.
- Connected the UI form to the API with loading, error, and assessment states.
- Added local development instructions and updated Next.js to the patched `16.3.3` release.
- Added `TODO.md` to track completed work, open verification tasks, and optional improvements.
- Resolved the remaining `js-yaml` audit finding with a patched pnpm workspace override.
- Fixed the ESLint flat-config export so `pnpm lint` completes without warnings.
- Added unit, API integration, and UI interaction tests with Vitest.
- Added runtime API response validation, configurable CORS, graceful API shutdown, and accessibility semantics.
- Completed a targeted Windows Defender scan of the repository with no threats reported.
- Moved API and UI tests into dedicated `api/test` and `ui/test` folders.
- Updated the README assumptions to match configurable CORS and the completed test coverage.
- Refined the API router fallback after separating controllers, middleware, services, components, and types.