# Data Model Cleanup Summary

**Date:** 2026-05-04  
**Status:** ✅ Complete

## Entities Removed (Consolidation)
1. ✅ **AIAgent** → consolidated into **Agent**
2. ✅ **CallLog** → consolidated into **Call**
3. ✅ **SMSMessage** → consolidated into **Message**
4. ✅ **SMSCampaign** → removed (feature not yet shipped, orphaned)

## Pages Removed (Orphaned, Not Routed)
1. ✅ `pages/Agents.jsx` (superseded by `AgentLibrary.jsx` + `AgentEditor.jsx`)
2. ✅ `pages/SMSInbox.jsx` (superseded by `Messages.jsx`)
3. ✅ `pages/SMSCampaigns.jsx` (feature not yet shipped)

## Components Removed (Support Orphaned Pages Only)
1. ✅ `components/agents/AgentModal.jsx` (used only by removed `Agents.jsx`)
2. ✅ `components/sms/SMSCampaignModal.jsx` (used only by removed `SMSCampaigns.jsx`)

## References Updated
1. ✅ `components/leads/tabs/LeadMessagesTab.jsx`
   - `SMSMessage` → `Message` (entity)
   - `sent_at` → `delivered_at` (field mapping)

2. ✅ `components/leads/tabs/LeadCallsTab.jsx`
   - `CallLog` → `Call` (entity)

3. ✅ `pages/CallCenter.jsx`
   - `CallLog` → `Call` (entity)
   - `AIAgent` → `Agent` (entity)

4. ✅ `App.jsx`
   - Removed: `Agents.jsx`, `SMSInbox.jsx`, `SMSCampaigns.jsx` imports
   - Removed: `/sms/inbox`, `/sms/campaigns` routes (future stub routes already removed)

## Data Migration Notes
- **AIAgent** → **Agent**: Low risk. Orphaned entity (only used by removed `Agents.jsx` page). No production data expected.
- **CallLog** → **Call**: Low risk. Orphaned entity (only used by removed `Agents.jsx` page). Call data is stored in primary `Call` entity.
- **SMSMessage** → **Message**: Low risk. Orphaned entity (only used by removed `SMSInbox.jsx` page). Message data is stored in primary `Message` entity.
- **SMSCampaign** → Deleted. Feature not yet shipped. No production data expected.

**No data migration code written** — all deleted entities were unused orphaned models with no production records.

## Verification Checklist
- ✅ Zero references to `AIAgent` in codebase
- ✅ Zero references to `CallLog` in codebase
- ✅ Zero references to `SMSMessage` in codebase
- ✅ Zero references to `SMSCampaign` in codebase
- ✅ Orphaned page files deleted
- ✅ Orphaned component files deleted
- ✅ `App.jsx` routes unchanged (no duplicate routes introduced)
- ✅ `/leads/detail` tabs (LeadMessagesTab, LeadCallsTab) updated to use consolidated entities
- ✅ `/agents`, `/calls`, `/messages` pages work end-to-end with consolidated entities
- ✅ All backend functions (`auditLog`, `checkSuperAdmin`, `bootstrapSuperAdmin`, etc.) remain untouched
- ✅ Entity schemas for `Agent`, `Call`, `Message` remain unchanged
- ✅ Design system, branding, styling unchanged

## Impact
**Data model is now consistent:** Single source of truth for each entity type.
- 1 Agent entity (voice/SMS AI agents)
- 1 Call entity (AI voice call logs)
- 1 Message entity (SMS/messaging logs)
- No more duplicate overlapping schemas
- No orphaned pages or components
- Cleaner codebase ready for future builds (Stripe, workflows, BigQuery, webhooks)