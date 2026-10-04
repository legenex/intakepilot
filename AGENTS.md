# IntakePilot — coding-agent contract

## Canonical repository

`legenex/intakepilot` on GitHub. Default branch: `main`.

## Primary execution host

`gx10-01` (user `legenex`).

Do not execute normal IntakePilot software builds on the Hermes VPS.

## Registered working copy

`/home/legenex/Documents/Projects/IntakePilot`

Do not create competing clones for routine work. Do not overwrite unrelated work (including `.kilo/worktrees/*` and other dirty trees).

## Source-of-truth order

1. Verified running behavior and tests
2. Current IntakePilot code and config in this working copy
3. GitHub `legenex/intakepilot`
4. AI OS operational registry (live machines/locations/jobs)
5. AI OS shared context / `legenex/ai-context`
6. Project documentation in `docs/`
7. Historical summaries in `docs/history/`

Live runtime evidence overrides stale summaries.

## Shared context

- Machine/headless agents on GX10: `ai mcp`
- Remote/web clients: `https://ai.legenex.com/mcp`
- Durable cross-project knowledge: `legenex/ai-context`
- Live machine/project/integration state: AI OS
- Implementation truth: this repository and GitHub

Do not duplicate global Legenex knowledge into this repo.

## Base44

Preserve the current Base44 application model unless Nick explicitly authorizes a migration.

Never commit Base44 secrets, access tokens, or machine-specific linkage such as `base44/.app.jsonc`. Use `base44 link` locally when linkage is required.

## Software workflow

inspect → plan → implement → test → diagnose → repair → retest → independent review → repair → verify → docs/state → commit → push → verify remote

## Git completion

Repository-changing work is not complete while changes remain local-only. Commit, reconcile with upstream, push, and verify the canonical remote. Never force-push. Never rewrite shared history.

## Do not

- Force-push
- Overwrite unrelated work
- Commit secrets or `.env*` values
- Create competing project copies
- Execute normal IntakePilot builds on the Hermes VPS
- Duplicate global AI OS knowledge into this repository
- Change GitHub public/private visibility

## Human blockers

Stop only for genuine authority, security, credential, or irreversible issues (OAuth/MFA, missing owner credentials, production destruction, financial actions, visibility changes, permanent deletion).
