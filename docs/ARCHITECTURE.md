# Architecture

IntakePilot is a Base44 app. The React/Vite frontend in this repo talks to Base44-hosted entities and functions. Legenex platform systems (AI OS, AgentOS, Buzz, GX cluster) are **not** part of this codebase.

## Runtime split

| Layer | Owner | Lives in |
|---|---|---|
| UI | this repo | `src/` |
| Data model | Base44 | `base44/entities/*.jsonc` |
| Backend functions | Base44 (Deno) | `base44/functions/*/entry.ts` |
| Auth / hosting / DB | Base44 | Base44 cloud |
| Canonical git | GitHub | `legenex/intakepilot` |
| Software execution | AgentOS | `gx10-01` this working copy |
| Operational registry | AI OS | `https://ai.legenex.com` |
| Durable cross-project facts | ai-context | `legenex/ai-context` |

## Frontend

- Entry: `src/main.jsx` → `src/App.jsx`
- Public marketing: `src/pages/marketing/*` + `src/layouts/MarketingLayout.jsx` (no auth providers)
- Auth: `src/lib/AuthContext.jsx` + Base44 `redirectToLogin`
- App: `src/components/app/AppLayout.jsx` inside `OrgProvider`
- Platform: `src/pages/platform/*` behind `SuperAdminGate`
- Client: `src/api/base44Client.js` via `@base44/sdk` and `src/lib/app-params.js`
- Vite plugin: `@base44/vite-plugin` in `vite.config.js` (legacy SDK import aliases, HMR, analytics)

`createClient({ requiresAuth: false })` is intentional so marketing pages can load without a session. Authenticated routes still redirect unauthenticated users to `/signin`.

## User types

- Anonymous visitors (marketing)
- Org members (intake operators / admins) scoped by `OrganizationMember`
- Super admins (`SuperAdminGrant` for founder emails; UI 404 otherwise)

## Domain model (entities)

Leads and pipeline: `Lead`, `LeadActivity`, `LeadDelivery`, `Buyer`, `ImportJob`  
Comms: `Agent`, `Call`, `Message`, `ConversationThread`, `Appointment`, `Document`, `DocumentRequest`  
Workflows: `Workflow`, `WorkflowVersion`, `WorkflowRun`, `WorkflowTemplate`, `AgentTemplate`  
Tenancy: `Organization`, `OrganizationMember`, `User`  
Billing: `BillingUsage`, `StripeEvent`  
Platform: `SuperAdminGrant`, `SuperAdminAuditLog`, `PlatformSettings`, `PlatformApiKey`, `FeatureFlag`, `Announcement`, `SupportTicket`, `ImpersonationSession`, `ComplianceOverride`, `DataSource`, `ProviderCredential`

## Backend functions

Voice/SMS: `retellWebhook`, `vapiWebhook`, `twilioInboundWebhook`, `twilioStatusWebhook`, `startCall`, `syncAgentToProvider`, `listProviderVoices`, `testProviderConnection`, `generateAgentWithAI`, `enhancePromptWithAI`  
Stripe: `stripeCheckout`, `stripePortal`, `stripeWebhook`, `recordUsage`  
Admin: `seedSuperAdmins`, `initializeSuperAdmin`, `superAdminCheck`, `logSuperAdminAction`, `getUsers`, `getOrganizations`, `getPlatformStats`, `updateUserRole`, `deleteOrganization`, `cleanupStaleMembers`, `deduplicateOrganizations`, `wipeNonLegenexOrgs`, `featureFlagEnabled`

Webhooks are public Base44 function URLs. Signature verification is implemented in the function bodies where credentials exist.

## Legenex boundaries

Do not merge AI OS, AgentOS, Buzz, or gx-server into this repo. IntakePilot is a work context; Bossman / Archie / Dexter / Bugsy / Critic are the profiles.
