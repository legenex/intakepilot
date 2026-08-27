# IntakePilot Agent Operating Instructions

This file is the canonical IntakePilot operating contract. It applies to every
coding agent, model, and harness working in this repository. Read it
completely before doing any work.

## 1. Product and stack

IntakePilot is one of Legenex's core software products (see the Agent OS
`projects/PROJECT-MAP.md`). It is built and hosted on the Base44 low-code
platform: a React 18 + Vite frontend (`src/`) with Base44-managed backend
entities and functions (`base44/entities/`, `base44/functions/`,
`base44/config.jsonc`).

This repository is a **bidirectional GitHub mirror of a Base44 project**, not
a fully independent codebase. Per the repository's own `README.md`: changes
pushed to this repo are reflected in the Base44 Builder, and (per Base44's
GitHub integration model) changes made in the Base44 Builder can appear here
too. Treat `base44/` as platform-managed/generated content — inspect it
before editing, and do not assume it behaves like hand-written backend code.

**Unconfirmed / needs owner input, do not guess:**
- The exact deployment/publish mechanism. No GitHub Actions workflow exists
  in this repository (confirmed via API — `.github/workflows` returns 404).
  Per the README, publishing happens through the Base44.com UI ("Open
  Base44.com and click Publish"), which is outside GitHub and outside any
  tool available to a coding agent here. **Do not assume a push to `main`
  deploys anything.** Do not attempt to trigger a Base44 publish on the
  operator's behalf unless a documented, agent-safe mechanism is confirmed.
- Production URL(s) for the live IntakePilot application.
- Whether Base44 Builder edits and this repo can silently diverge, and if so,
  which side is authoritative.

## 2. Repository and environments

- GitHub repository: `legenex/intakepilot`
- Default branch: `main` (not branch-protected as of this writing — no
  GitHub branch protection rule configured; treat it as if it were protected
  anyway per section 5)
- No `.github/workflows/` — no CI, no automated tests, no automated
  deployment gate of any kind currently exists for this repository

## 3. Available local commands

From `package.json`:

```
npm run dev        # local Vite dev server
npm run build       # production build
npm run lint         # eslint . --quiet
npm run lint:fix
npm run typecheck    # tsc -p ./jsconfig.json
npm run preview
```

There is **no test suite** in this repository at the time of writing (no
`test`/`vitest`/`jest` script in `package.json`). `lint`, `typecheck`, and
`build` succeeding is the strongest automated signal currently available —
it is not equivalent to functional test coverage. Do not claim behavior is
verified beyond what these checks and manual/programmatic inspection can
actually show.

## 4. Source of truth

GitHub is the source of truth for this repo's own frontend code
(`src/`). For `base44/entities/` and `base44/functions/`, treat the last
synced state from Base44 as authoritative unless a specific task requires
otherwise — read the current file content before changing it, since it may
reflect recent Base44 Builder-side edits not yet reasoned about here.

## 5. Branch, PR, and ticket conventions

This repository has no existing bespoke workflow overriding the Agent OS
default (unlike `legenex-dashflo`, which has its own established
push-to-`main`-with-automated-gate model — do not import that model here,
since IntakePilot has no equivalent gate). Use the Agent OS default from
`github/REPOSITORIES.md`:

- Branch naming: `agent/<ticket-id>/<short-slug>`
- PR title: `[<ticket-id>] <imperative title>`
- PR body must include: Kanban ticket ID, acceptance criteria, summary,
  tests/commands/results, risks, production impact, AGENTS.md compliance
  statement.
- Do not push directly to `main`. Open a PR and let a human (or an
  explicitly authorized reviewer role) merge it, since there is no automated
  gate here to catch a bad change before it reaches the default branch.

## 6. Role scope (per `github/REPOSITORIES.md`)

- **Archie**: read-only.
- **Dexter**: read/write branches and draft PRs. No protected-branch bypass,
  no direct push to `main`.
- **Bugsy/Critic**: read-only code/PR access, evidence reporting. No merge.
- **Odin**: infrastructure access only if a task genuinely requires it. No
  product-repo write by default.

## 7. Security and secrets

- Never commit `.env`, `.env.local`, or any file containing
  `VITE_BASE44_APP_ID` / `VITE_BASE44_APP_BASE_URL` real values, API keys, or
  other credentials.
- Never print, expose, or request Base44 API keys, service credentials, or
  any other secret in chat, logs, commits, or PR descriptions.
- Do not modify Base44 production data through this codebase's tooling
  unless the operator explicitly requests it and the action is read-only or
  explicitly confirmed as safe.

## 8. Human approval gates

Stop and ask before:

- Publishing/deploying via the Base44.com UI or any other production release
  action, since no safe automated path currently exists.
- Any change to `base44/entities/` schema or `base44/functions/` that could
  affect production data shape or business logic, until the actual
  production impact is understood.
- Money movement, live lead delivery, live external communications, or any
  other live business action.
- Merging a PR into `main` — treat `main` as protected in practice even
  though no GitHub branch-protection rule currently enforces it.

## 9. Definition of done

A task is done only when:

- `npm run lint` and `npm run typecheck` pass
- `npm run build` succeeds
- the diff was reviewed for secrets, access control, and any Base44
  entity/function schema impact
- work is on a branch named per section 5, with a PR opened per section 5's
  body requirements — not merged without explicit approval
- anything genuinely unverifiable (e.g. actual production behavior, since no
  deployment path is confirmed) is labeled as such rather than assumed

## 10. Final report format

After completing a task, report: what changed, changed files, branch name,
PR link, lint/typecheck/build results, and anything still requiring manual
verification (in particular, whether/how the change reaches the live Base44
app — do not claim this without confirmed evidence).
