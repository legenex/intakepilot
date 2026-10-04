# Build #2: Webhook Receivers & Route Fixes

**Date:** 2026-05-04  
**Status:** ✅ Complete

## Part A — Voice Webhook Receivers

### retellWebhook (functions/retellWebhook.ts)
- Public endpoint, no auth required
- Verifies Retell signature using `webhook_secret` from credentials (skips with warning if not configured)
- Handles events: `call_started`, `call_ended`, `call_analyzed`
- **call_started:** Updates Call.status='in_progress', sets started_at
- **call_ended:** Updates Call with end_timestamp, duration_s, recording_url, transcript (array), summary, status mapping (user_hangup→completed, inactivity_timeout→no_answer, voicemail→voicemail, error→failed)
- **call_analyzed:** Computes PVQL score (1-10) based on filled qualification fields (incident_date, vertical, fault, treatment, attorney, state), updates Call.structured_data, promotes lead.status to 'phone_verified' if score≥7 and lead was new/engaged_sms/qualified_sms, logs LeadActivity
- Returns 200 fast, never retries on data errors

### vapiWebhook (functions/vapiWebhook.ts)
- Same pattern for Vapi's `end-of-call-report` event
- Maps Vapi fields: recordingUrl→recording_url, endedReason→status, transcript→array format
- Same PVQL computation and lead promotion logic
- Logs LeadActivity with Vapi metadata

### Updated syncAgentToProvider (functions/syncAgentToProvider.ts)
- When syncing Retell agents, includes `webhook_url` in config pointing to `/functions/retellWebhook`
- Derives base URL from `BASE44_APP_DOMAIN` env var or defaults to `https://app.base44.io`

## Part B — SMS Webhook Receivers

### twilioStatusWebhook (functions/twilioStatusWebhook.ts)
- Receives MessageStatus callbacks from Twilio (queued/sent/delivered/failed/undelivered)
- Updates Message.status, sets delivered_at if delivered, logs error_code/error_message if failed
- Returns 200 with empty TwiML (prevents double-sends)

### twilioInboundWebhook (functions/twilioInboundWebhook.ts)
- Receives inbound SMS from Twilio
- Handles DNC keywords (stop/unsubscribe/stopall/cancel/quit/end, case insensitive):
  - Tags lead with status='dnc', clears tcpa_consent_at
  - Sends Twilio confirmation: "You have been unsubscribed and will receive no further messages."
  - Closes ConversationThread
  - Logs LeadActivity with opt_out=true
- For non-DNC messages on active, non-handed-off threads:
  - Stores inbound Message
  - Fetches last 6 messages for context
  - Calls LLM (Claude) with agent system_prompt to generate reply
  - Sends reply via Twilio, stores outbound Message with agent_handled=true
- For handed_off or no agent: stores inbound, increments thread.unread_count
- Returns 200 with empty TwiML

## Part C — Integration Page Updates (pages/Integrations.jsx + ProviderCard.jsx)

### Webhook URL Display
- When provider is connected (status='connected'), shows webhook URLs with:
  - Monospace styled URL blocks (easy to read)
  - Copy button (switches to checkmark on success)
  - Context-specific instructions (e.g., "Paste into Retell agent's webhook_url field")
- **Retell:** Shows single webhook URL + instruction
- **Vapi:** Shows single webhook URL with Vapi-specific instruction
- **Twilio:** Shows two URLs:
  - Status Callback URL (for message delivery tracking)
  - Inbound Message URL (for receiving replies)

### New ProviderCard Component
- Added `WebhookUrl` sub-component for clean copy-able URL blocks
- Integrated into ProviderCard UI, visible only when connected

## Part D — Route Fixes

### Fix 1: /login Route 404 → Redirect to /signin
- Added route: `<Route path="/login" element={<Navigate to="/signin" replace />} />`
- Imported `Navigate` from react-router-dom
- All external links to /login now work

### Fix 2: "See Live Demo" Button
- Created `components/marketing/DemoRequestModal.jsx` component
- Modal form captures email → creates SupportTicket with subject='Demo Request'
- Updated `components/marketing/HeroSection.jsx` to open modal on button click
- Button now functional, real value (not a stub)

## Verification Checklist

✅ **Webhooks exist:**
- `functions/retellWebhook.ts` — deployed
- `functions/vapiWebhook.ts` — deployed
- `functions/twilioStatusWebhook.ts` — deployed
- `functions/twilioInboundWebhook.ts` — deployed

✅ **Integrations page updated:**
- Webhook URLs shown for Retell, Vapi, Twilio (when connected)
- Copy buttons functional
- Instructions clear and provider-specific

✅ **Agent syncing updated:**
- `syncAgentToProvider` includes webhook_url in Retell config
- Webhook URL derived dynamically from env var or default

✅ **Route fixes:**
- `/login` no longer 404s — redirects to `/signin`
- "See Live Demo" button opens modal, captures email, creates support ticket

✅ **No breaking changes:**
- Existing Call, Message, ConversationThread entities unchanged
- LeadActivity logging added but non-breaking
- Lead.status promotions only happen when criteria met (PVQL≥7)
- Backend functions unmodified except syncAgentToProvider (minimal webhook_url addition)

## Data Flow End-to-End

1. **Voice calls:**
   - `startCall` initiates call via Retell/Vapi
   - `syncAgentToProvider` syncs agent with webhook_url included
   - Retell/Vapi makes POST to retellWebhook/vapiWebhook with call events
   - Webhooks update Call record with transcript, recording, structured_data, pvql_score
   - If PVQL≥7, lead promoted to phone_verified
   - LeadActivity logged for audit trail

2. **SMS:**
   - Outbound SMS created via Message entity, provider_message_id stored
   - Twilio sends status updates to twilioStatusWebhook
   - twilioStatusWebhook updates Message.status, delivered_at
   - Inbound SMS arrives at twilioInboundWebhook
   - If DNC keyword → lead DNC'd, confirmation sent, thread closed
   - If active thread → LLM auto-replies, response stored, thread updated
   - If handed_off → message stored, unread_count incremented

## Not Included (Coming in Later Builds)

- ❌ Stripe wiring (Build #3)
- ❌ Super admin panel (Builds #4 + #5)
- ❌ Workflow engine (Prompt 4)
- ❌ BigQuery sync (Prompt 5)

## What's Next

All webhook receivers are now in place. The system can:
- Close the loop on voice calls (transcript, recording, PVQL scoring)
- Auto-handle SMS replies (with LLM)
- Respect DNC and compliance
- Log everything for audit trail

Next build will add Stripe for subscription management and payment processing.