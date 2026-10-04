# Decisions

## D-01 — Base44 remains the application platform

Preserve the current Base44 model, entities, and functions unless Nick explicitly authorizes a migration.

## D-02 — GitHub is canonical source; Base44 Publish is production

`legenex/intakepilot` `main` is source control. Pushing does not by itself prove a production publish. Do not trigger Base44 production publish without standing authority.

## D-03 — gx10-01 is the software execution host

Path: `/home/legenex/Documents/Projects/IntakePilot`. Hermes VPS is orchestration only. Do not clone a competing copy for normal builds.

## D-04 — Do not change GitHub visibility

Repo is PUBLIC. Flagged for owner review. Changing public/private requires Nick.

## D-05 — No duplicate global context in this repo

Use AI OS MCP / `ai mcp` and `legenex/ai-context`. Keep `AGENTS.md` project-specific.

## D-06 — Super-admin bootstrap emails stay in function source

`seedSuperAdmins` grants `nick@legenex.com`, `nic@legenex.com`, `morne@legenex.com`. Do not remove without owner instruction. Client login currently invokes this seed once per browser (`intakepilot-super-admins-seeded`).

## D-07 — Historical build notes live under docs/history/

`src/*SUMMARY.md` files are historical, not live proof of completion.

## D-08 — Open PR #1 is superseded

`agent/t_0db45449/add-agents-md` added an older AGENTS.md. Root `AGENTS.md` on `main` is the contract.

## D-09 — IntakePilot priority is unconfirmed

Do not invent NOW/next ranking. Owner source is `company/CURRENT_PRIORITIES.md`.
