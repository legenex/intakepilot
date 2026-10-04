# IntakePilot — current state

Verified 2026-10-04 on `gx10-01` against this working copy and GitHub. Not a roadmap.

## Identity

| Field | Verified value |
|---|---|
| Product | AI legal-intake platform (voice, SMS, workflows, lead→buyer delivery) |
| Repo | `legenex/intakepilot` |
| Default branch | `main` |
| Working copy | `/home/legenex/Documents/Projects/IntakePilot` |
| HEAD at inspection | `2786188a7b692eaf5962ae470131268179b2f144` |
| GitHub visibility | **PUBLIC** (owner-review item; not changed) |
| Priority | unconfirmed — absent from `company/CURRENT_PRIORITIES.md` NOW list |
| Lifecycle | unconfirmed |

## What works in code

- Public marketing site (`/`, `/features`, `/how-it-works`, `/pricing`, `/signup`, legal pages).
- Base44 auth redirect for `/signin` and `/signup`.
- Authenticated app shell: dashboard, leads (list/import/drawer), buyers, analytics, data sources, agent library/editor, messages, call center, integrations, compliance audit, workflows.
- Multi-org membership via `Organization` + `OrganizationMember` (`src/lib/OrgContext.jsx`).
- Super-admin `/platform/*` routes gated by `SuperAdminGate` + `SuperAdminGrant` (`src/lib/superAdmin.js`). Non-admins get 404.
- Base44 entities and Deno functions for Stripe, Retell, Vapi, Twilio, org admin, and super-admin ops.

## What is partial or not enforced

- `SubscriptionGate` is a pass-through: any authenticated user reaches the app. Billing enforcement is documented in code as future work.
- Several platform pages still say “coming soon” (BigQuery, parts of user/org detail, webhook metrics).
- `DeliverLeadModal` live transfer is not implemented.
- `src/pages/ComingSoon.jsx` exists but is not routed.
- Older unrouted pages remain under `src/pages/` (`Home.jsx`, `About.jsx`, `Contact.jsx`, `Features.jsx`, `Pricing.jsx`, `UseCases.jsx`) beside the live `src/pages/marketing/` copies.
- No `.env.local` on this host at inspection. Local `npm run dev` still needs Base44 env for API calls. `npm run build` no longer requires `base44 link` (UI function wrappers live in `src/functions/`).
- `jsconfig.json` `include` is stale (`src/Layout.jsx`, limited globs). `npm run typecheck` does not cover the whole tree.

## Integrations (code present)

Retell, Vapi, Twilio, Stripe, webhook delivery to buyers, BigQuery UI stub. Secrets live in Base44 provider credentials / env, not in git.

## Git / GitHub

- Origin: `https://github.com/legenex/intakepilot`
- `main` tracked `origin/main`; inspection working tree was clean and not ahead/behind.
- Open PR #1 (`agent/t_0db45449/add-agents-md`) is an outdated AGENTS.md. Superseded by root `AGENTS.md` on `main`.
- Last Base44-related commit on `main` at inspection: `chore: stop committing base44/.app.jsonc; use base44 link`.

## AI OS / AgentOS

- Live AI OS location: `gx10-01:/home/legenex/Documents/Projects/IntakePilot`, status `ok`, classification `VERIFIED ACTIVE`, commit `2786188`, branch `main`, dirty false.
- `gx10-01` `default_root` remains `/srv/projects`. `allowed_roots` includes `/home/legenex/Documents/Projects`.
- Durable `legenex/ai-context` records the same path and HEAD.
- AgentOS `execution/registry.yaml` maps `intakepilot` → this path, lane `gx10`. Do not clone a competing copy on Hermes.
- Buzz live channel slug: `intake-pilot` (id `4305f271-642a-4d13-83a0-60535346159b`) → project `intakepilot`.

## Known blockers

1. **Human:** GitHub visibility PUBLIC — do not change without Nick.
2. **Local Base44:** `base44 link` + `.env.local` if interactive Base44 auth is required on this machine.
3. Do not treat historical `docs/history/*_SUMMARY.md` as live completion proof.
