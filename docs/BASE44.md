# Base44

IntakePilot originated as a Base44 app and remains one. Do not migrate the backend off Base44 without Nick’s explicit authorization.

## What Base44 owns

- Hosted app, database, auth
- Entities in `base44/entities/`
- Deno functions in `base44/functions/*/entry.ts`
- Production publish from the Base44 Builder UI

## What this repo owns

- React/Vite UI
- Entity/function source that Base44 syncs from GitHub
- `base44/config.jsonc` (build/serve commands; `name` is still `"Untitled"`)

## SDK and Vite

- `@base44/sdk` via `src/api/base44Client.js`
- `@base44/vite-plugin` in `vite.config.js`
- App id / base URL / functions version from `src/lib/app-params.js` (`VITE_BASE44_APP_ID`, `VITE_BASE44_APP_BASE_URL`, `VITE_BASE44_FUNCTIONS_VERSION`)
- `requiresAuth: false` on the client so public marketing routes can render

## Local link

Machine-specific app linkage is `base44/.app.jsonc`. It is gitignored. Latest `main` commit stopped tracking it and expects `base44 link` locally.

Do not commit:

- `base44/.app.jsonc`
- Base44 access tokens
- `.env.local`

If `base44 link` requires interactive Base44 login, that is a human blocker. Other work can proceed without it.

## GitHub sync vs production publish

Expected flow:

```
gx10-01 working copy → commit → GitHub main → Base44 GitHub sync → Base44 Builder
```

Verified:

- README previously claimed “any change pushed to the repo will also be reflected in the Base44 Builder.”
- Publishing still requires the Base44 UI (“Open Base44.com and click Publish”).
- This repo has no GitHub Actions.

Do **not** assume a push to `main` deploys production. Treat GitHub as source; treat Base44 Publish as the production action. Do not click Publish unless it is already a standing workflow for the change in hand.

## Environment variable names

| Name | Role |
|---|---|
| `VITE_BASE44_APP_ID` | App id for the SDK and public-settings fetch |
| `VITE_BASE44_APP_BASE_URL` | Hosted app base URL |
| `VITE_BASE44_FUNCTIONS_VERSION` | Optional functions version pin |

Never put values in git or in agent reports.

## Frontend function wrappers

`@/functions/<name>` used to be a Base44 Vite virtual module and broke `npm run build` without `base44 link` (it resolved to `/src/functions/...` on disk). This repo now has thin wrappers in `src/functions/` that call `base44.functions.invoke`. Keep wrappers in sync when adding a function used from the UI.
