import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify super admin
    const adminGrant = await base44.asServiceRole.entities.SuperAdminGrant.filter({
      email: user.email.toLowerCase(),
      active: true,
    });

    if (adminGrant.length === 0) {
      return Response.json({ error: 'Forbidden: Super admin only' }, { status: 403 });
    }

    // Find canonical Legenex org
    const legenexOrgs = await base44.asServiceRole.entities.Organization.filter({
      name: 'Legenex',
    });

    let canonicalLegnx = null;
    for (const org of legenexOrgs) {
      const members = await base44.asServiceRole.entities.OrganizationMember.filter({
        organization_id: org.id,
      });
      const hasLegenexEmail = members.some(m => m.user_email && m.user_email.endsWith('@legenex.com'));
      if (hasLegenexEmail) {
        canonicalLegnx = org;
        break;
      }
    }

    if (!canonicalLegnx) {
      return Response.json({ error: 'Legenex organization not found or has no @legenex.com members' }, { status: 404 });
    }

    // Update canonical Legenex
    await base44.asServiceRole.entities.Organization.update(canonicalLegnx.id, {
      plan: 'agency',
      plan_interval: 'monthly',
      subscription_status: 'active',
      internal_comped: true,
      trial_ends_at: null,
    });

    // Get all orgs
    const allOrgs = await base44.asServiceRole.entities.Organization.list(null, 1000);

    // Track deletions
    const deletedOrgIds = [];
    const report = {
      kept: { id: canonicalLegnx.id, name: canonicalLegnx.name },
      deleted_orgs: [],
      deleted_records: {
        leads: 0,
        buyers: 0,
        agents: 0,
        calls: 0,
        messages: 0,
        members: 0,
        threads: 0,
        activities: 0,
        deliveries: 0,
        jobs: 0,
        sources: 0,
        documents: 0,
        requests: 0,
        appointments: 0,
        overrides: 0,
        usage: 0,
        credentials: 0,
      },
    };

    // For each org that's not the canonical one
    for (const org of allOrgs) {
      if (org.id === canonicalLegnx.id) continue;
      if (org.soft_delete_at) continue; // Skip already soft-deleted

      const orgId = org.id;
      deletedOrgIds.push(orgId);
      report.deleted_orgs.push({ id: orgId, name: org.name });

      // Reassign @legenex.com members to canonical org
      const members = await base44.asServiceRole.entities.OrganizationMember.filter({
        organization_id: orgId,
      });

      for (const member of members) {
        if (member.user_email && member.user_email.endsWith('@legenex.com')) {
          // Check if already a member of canonical org
          const existing = await base44.asServiceRole.entities.OrganizationMember.filter({
            organization_id: canonicalLegnx.id,
            user_email: member.user_email,
          });

          if (existing.length === 0) {
            await base44.asServiceRole.entities.OrganizationMember.create({
              organization_id: canonicalLegnx.id,
              user_email: member.user_email,
              user_name: member.user_name,
              role: member.role || 'admin',
              status: 'active',
              joined_at: new Date().toISOString(),
            });
          }
        }
      }

      // Delete child records
      const leads = await base44.asServiceRole.entities.Lead.filter({ organization_id: orgId });
      for (const lead of leads) {
        await base44.asServiceRole.entities.Lead.delete(lead.id);
      }
      report.deleted_records.leads += leads.length;

      const buyers = await base44.asServiceRole.entities.Buyer.filter({ organization_id: orgId });
      for (const buyer of buyers) {
        await base44.asServiceRole.entities.Buyer.delete(buyer.id);
      }
      report.deleted_records.buyers += buyers.length;

      const agents = await base44.asServiceRole.entities.Agent.filter({ organization_id: orgId });
      for (const agent of agents) {
        await base44.asServiceRole.entities.Agent.delete(agent.id);
      }
      report.deleted_records.agents += agents.length;

      const calls = await base44.asServiceRole.entities.Call.filter({ organization_id: orgId });
      for (const call of calls) {
        await base44.asServiceRole.entities.Call.delete(call.id);
      }
      report.deleted_records.calls += calls.length;

      const messages = await base44.asServiceRole.entities.Message.filter({ organization_id: orgId });
      for (const msg of messages) {
        await base44.asServiceRole.entities.Message.delete(msg.id);
      }
      report.deleted_records.messages += messages.length;

      const threads = await base44.asServiceRole.entities.ConversationThread.filter({ organization_id: orgId });
      for (const thread of threads) {
        await base44.asServiceRole.entities.ConversationThread.delete(thread.id);
      }
      report.deleted_records.threads += threads.length;

      const activities = await base44.asServiceRole.entities.LeadActivity.filter({ organization_id: orgId });
      for (const act of activities) {
        await base44.asServiceRole.entities.LeadActivity.delete(act.id);
      }
      report.deleted_records.activities += activities.length;

      const deliveries = await base44.asServiceRole.entities.LeadDelivery.filter({ organization_id: orgId });
      for (const del of deliveries) {
        await base44.asServiceRole.entities.LeadDelivery.delete(del.id);
      }
      report.deleted_records.deliveries += deliveries.length;

      const jobs = await base44.asServiceRole.entities.ImportJob.filter({ organization_id: orgId });
      for (const job of jobs) {
        await base44.asServiceRole.entities.ImportJob.delete(job.id);
      }
      report.deleted_records.jobs += jobs.length;

      const sources = await base44.asServiceRole.entities.DataSource.filter({ organization_id: orgId });
      for (const source of sources) {
        await base44.asServiceRole.entities.DataSource.delete(source.id);
      }
      report.deleted_records.sources += sources.length;

      const docs = await base44.asServiceRole.entities.Document.filter({ organization_id: orgId });
      for (const doc of docs) {
        await base44.asServiceRole.entities.Document.delete(doc.id);
      }
      report.deleted_records.documents += docs.length;

      const docReqs = await base44.asServiceRole.entities.DocumentRequest.filter({ organization_id: orgId });
      for (const req of docReqs) {
        await base44.asServiceRole.entities.DocumentRequest.delete(req.id);
      }
      report.deleted_records.requests += docReqs.length;

      const appointments = await base44.asServiceRole.entities.Appointment.filter({ organization_id: orgId });
      for (const apt of appointments) {
        await base44.asServiceRole.entities.Appointment.delete(apt.id);
      }
      report.deleted_records.appointments += appointments.length;

      const overrides = await base44.asServiceRole.entities.ComplianceOverride.filter({ organization_id: orgId });
      for (const ovr of overrides) {
        await base44.asServiceRole.entities.ComplianceOverride.delete(ovr.id);
      }
      report.deleted_records.overrides += overrides.length;

      const usage = await base44.asServiceRole.entities.BillingUsage.filter({ organization_id: orgId });
      for (const u of usage) {
        await base44.asServiceRole.entities.BillingUsage.delete(u.id);
      }
      report.deleted_records.usage += usage.length;

      const creds = await base44.asServiceRole.entities.ProviderCredential.filter({ organization_id: orgId });
      for (const cred of creds) {
        await base44.asServiceRole.entities.ProviderCredential.delete(cred.id);
      }
      report.deleted_records.credentials += creds.length;

      // Delete all members of this org
      for (const member of members) {
        await base44.asServiceRole.entities.OrganizationMember.delete(member.id);
      }
      report.deleted_records.members += members.length;

      // Finally delete the organization
      await base44.asServiceRole.entities.Organization.delete(orgId);
    }

    // Log to audit
    await base44.asServiceRole.entities.SuperAdminAuditLog.create({
      user_id: user.id,
      action_type: 'org_wipe_non_legenex',
      target_type: 'organization',
      target_id: canonicalLegnx.id,
      reason: `Wiped ${deletedOrgIds.length} non-Legenex organizations`,
    });

    return Response.json(report);
  } catch (error) {
    console.error('Wipe error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});