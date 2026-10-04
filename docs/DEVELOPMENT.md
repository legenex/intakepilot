# Development

## Host

Work on `gx10-01` at `/home/legenex/Documents/Projects/IntakePilot`. Do not use the Hermes VPS as the software-build filesystem.

## Setup

```bash
cd /home/legenex/Documents/Projects/IntakePilot
npm ci
cp .env.example .env.local
# set VITE_BASE44_APP_ID and VITE_BASE44_APP_BASE_URL (never commit)
npx base44 link    # writes gitignored base44/.app.jsonc
npm run dev
```

`.gitignore` ignores `.env`, `.env.*`, `*.local`, and `base44/.app.jsonc`. `.env.example` is the committed template (`!.env.example`).

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint (quiet) |
| `npm run lint:fix` | ESLint with fixes |
| `npm run typecheck` | `tsc -p ./jsconfig.json` (limited include; see below) |
| `npm test` | Node built-in tests for pure helpers |

Lockfile: `package-lock.json`. Use `npm ci`. Do not bump dependencies unless the task requires it.

## Typecheck scope

`jsconfig.json` `include` is a Base44 leftover (`src/pages/**/*.jsx`, `src/components/**/*.js`, `src/Layout.jsx`). It excludes `src/lib`, `src/api`, and `src/components/ui`. `checkJs` is off: untyped shadcn `forwardRef` components make `tsc` report hundreds of false `children` errors when it follows imports. Re-enable `checkJs` only after UI primitives have real prop types. Passing typecheck is not whole-app typing.

## Auth in local/dev

`src/lib/app-params.js` reads `app_id` / `access_token` from the URL or `localStorage`, falling back to `VITE_BASE44_*`. Base44 login uses `base44.auth.redirectToLogin`.

## Tests

There is no full UI/E2E suite. `npm test` covers pure helpers such as phone normalization. Add tests next to the module they prove. Do not invent a new framework unless needed.

## Git

- Branch: `main` unless a ticket needs an isolated branch
- Never force-push
- Never commit `.env.local`, `base44/.app.jsonc`, or tokens
- Work is not done until pushed to `legenex/intakepilot` and verified on the remote

## Agent Manager

`.kilo/worktrees/` may contain detached checkouts. Do not overwrite them. Do not use them as the canonical working copy.
