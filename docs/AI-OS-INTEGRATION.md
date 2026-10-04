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
| Durable ai-context | `gx10-01:/home/legenex/Documents/Projects/IntakePilot` @ `2786188` |
| Live Postgres location | `gx10-01` working-copy, status `ok`, `VERIFIED ACTIVE` |
| `gx10-01` default root | `/srv/projects` |
| `gx10-01` allowed_roots | `/home/legenex/Documents/Projects` |

Registration used Dashflo production admin in-place (`ssh dashflo`), not a copied admin token on gx10-01. gx10-01 keeps only its machine identity. Root-policy (`allowed_roots`) remains an admin/portal change. Machine tokens report discovery/git-state; attaching a discovered path to a project is `POST /api/discovery/register`.

Portal: `https://ai.legenex.com` — project `intakepilot` has a manageable gx10-01 working copy.

Read-only project-agent (`POST /api/workspace/run` mode `plan`) executed on gx10-01 against this path (session `ec6b6819-a056-4861-9eb5-f1ee96989973`).

## How Hermes / AgentOS executes it

AgentOS `execution/registry.yaml` (do not duplicate here if that file moves):

- `repository_url`: `https://github.com/legenex/intakepilot.git`
- `execution_path`: `/home/legenex/Documents/Projects/IntakePilot`
- `execution_host`: `gx10-01`
- `lane`: `gx10`
- `kanban_board`: `intakepilot`
- Live Buzz channel slug: `intake-pilot` (UUID `4305f271-642a-4d13-83a0-60535346159b`) → project `intakepilot`. Markdown sometimes writes `#intakepilot`; key on channel id, not the display name.

Hermes is control plane only. No IntakePilot software build should depend on a VPS checkout.

## Buzz

Buzz is the conversation surface. Nick → Bossman/Buzz → Hermes/AgentOS → gx10-01 this path → GitHub. Do not build a separate IntakePilot executor inside Buzz.

## Shared-context rule

Live runtime evidence overrides stale summaries. This file records ops integration, not product implementation.
