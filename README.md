# IntakePilot

AI-powered legal intake platform: qualify leads by voice and SMS, route PVQLs to buyers, and run TCPA-aware workflows.

Canonical repository: [`legenex/intakepilot`](https://github.com/legenex/intakepilot)  
Primary execution host: `gx10-01`  
Working copy: `/home/legenex/Documents/Projects/IntakePilot`

This is a Base44 application (React + Vite frontend, Base44-hosted backend). Do not replace the Base44 data model unless Nick explicitly authorizes a migration.

## Local development

```bash
npm ci
cp .env.example .env.local   # then fill values locally; never commit them
npx base44 link              # machine-specific; writes base44/.app.jsonc (gitignored)
npm run dev
```

Required environment variable **names** (values stay local):

- `VITE_BASE44_APP_ID`
- `VITE_BASE44_APP_BASE_URL`
- `VITE_BASE44_FUNCTIONS_VERSION` (optional)

## Quality checks

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Publish

GitHub `main` is canonical source. Base44 Builder syncs from GitHub. Publishing the live Base44 app is a Base44 UI action and is **not** automatic just because `main` moved. See `docs/BASE44.md`.

## Docs

- `docs/CURRENT_STATE.md` — verified product and ops state
- `docs/ARCHITECTURE.md` — structure and ownership boundaries
- `docs/DEVELOPMENT.md` — how to run and change the app
- `docs/BASE44.md` — Base44 integration
- `docs/AI-OS-INTEGRATION.md` — AI OS / AgentOS / Buzz
- `docs/DECISIONS.md` — durable project decisions
- `AGENTS.md` — coding-agent contract
