# AI OS / AgentOS / Buzz

IntakePilot is a Legenex software project, not an AI OS component. Profiles stay Bossman → Archie → Dexter → Bugsy → Critic. Do not create a permanent “IntakePilot agent.”

## How an agent gets Legenex context

On `gx10-01` (machine/headless):

```bash
ai mcp
```

Remote/web clients:

```text
https://ai.legenex.com/mcp
```

Ask AI OS; do not copy company-wide context into this repo.

Canonical priority test (do not infer from git activity):

> What are Nick's current priorities, and which projects are actively being worked on right now?

Verified 2026-10-04 via AI OS context: NOW is AI OS + GX cluster first, then agent-os, buzz, DashFlo, pageflo, gigpilot, growth-os. **IntakePilot is not on the NOW list** (priority unconfirmed).

## How AI OS finds this repo

| Record | State at 2026-10-04 |
|---|---|
| Project name | `intakepilot` (existing; do not `ai new`) |
| GitHub | `legenex/intakepilot` |
| Durable ai-context | `gx10-01:/home/legenex/Documents/Projects/IntakePilot` |
| Live Postgres location | **not attached** until owner admin token registers discovery |
| `gx10-01` default root | `/srv/projects` |
| `gx10-01` allowed_roots | `[]` — Documents/Projects is outside scan roots |

Machine-token `POST /api/agent/discovery/report` for this path returned 200 and queued discovery. Completing registration:

1. Add `/home/legenex/Documents/Projects` to gx10-01 allowed roots (keep `/srv/projects` as default).
2. `POST /api/discovery/register` with `{ "machine": "gx10-01", "path": "/home/legenex/Documents/Projects/IntakePilot" }` (or portal Discover → Register).
3. `ai agent once` so inspect/git-state refresh runs.

`ai register` and portal machine APIs require `AI_OS_ADMIN_TOKEN`. gx10-01 has only a machine token. Hermes’ stored CLI `token` currently returns 401.

Portal UI: `https://ai.legenex.com` — project is listed; working-copy manageability needs the location row.

## How Hermes / AgentOS executes it

AgentOS `execution/registry.yaml` (do not duplicate here if that file moves):

- `repository_url`: `https://github.com/legenex/intakepilot.git`
- `execution_path`: `/home/legenex/Documents/Projects/IntakePilot`
- `execution_host`: `gx10-01`
- `lane`: `gx10`
- `kanban_board`: `intakepilot`
- Buzz channel field: `#intake-pilot` (CHANNELS.md also uses `#intakepilot` — treat as the same project, confirm live Buzz name before sending)

Hermes is control plane only. No IntakePilot software build should depend on a VPS checkout.

## Buzz

Buzz is the conversation surface. Nick → Bossman/Buzz → Hermes/AgentOS → gx10-01 this path → GitHub. Do not build a separate IntakePilot executor inside Buzz.

## Shared-context rule

Live runtime evidence overrides stale summaries. This file records ops integration, not product implementation.
