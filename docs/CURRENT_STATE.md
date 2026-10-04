# IntakePilot — current state

Verified 2026-10-04 on `gx10-01` against this working copy and GitHub. Not a roadmap.

## Identity

| Field | Verified value |
|---|---|
| Product | AI legal-intake platform (voice, SMS, workflows, lead→buyer delivery) |
| Repo | `legenex/intakepilot` |
| Default branch | `main` |
| Working copy | `/home/legenex/Documents/Projects/IntakePilot` |
| HEAD at inspection | `490dd4e0ad9a246a9c28e23c0476b18d942ee5fe` |
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

- Durable `legenex/ai-context` project page records this gx10-01 path.
- Live AI OS Postgres registry still had **no working-copy location** at last admin-API check. Discovery report for this path was accepted (`POST /api/agent/discovery/report` → 200). Attaching it requires owner `AI_OS_ADMIN_TOKEN` (`POST /api/discovery/register`) plus adding `/home/legenex/Documents/Projects` to `gx10-01` `allowed_roots`.
- AgentOS `execution/registry.yaml` already maps `intakepilot` → this path, lane `gx10`. Do not clone a competing copy on Hermes.

## Known blockers

1. **Human:** valid `AI_OS_ADMIN_TOKEN` (Hermes `~/.config/ai-os/config.json` `token` is 401). Needed to register the live working copy and add the allowed root.
2. **Human:** GitHub visibility PUBLIC — do not change without Nick.
3. **Local Base44:** `base44 link` + `.env.local` if interactive Base44 auth is required on this machine.
4. Do not treat historical `docs/history/*_SUMMARY.md` as live completion proof.
