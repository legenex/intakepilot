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

    const body = await req.json();
    const { organization_id, reason } = body;

    // Get org
    const orgs = await base44.asServiceRole.entities.Organization.filter({ id: organization_id });
    if (orgs.length === 0) {
      return Response.json({ error: 'Organization not found' }, { status: 404 });
    }

    const org = orgs[0];

    // Protect canonical Legenex
    if (org.name === 'Legenex') {
      const members = await base44.asServiceRole.entities.OrganizationMember.filter({
        organization_id: organization_id,
      });
      const hasLegenexEmail = members.some(m => m.user_email && m.user_email.endsWith('@legenex.com'));
      if (hasLegenexEmail) {
        return Response.json(
          { error: 'Cannot delete canonical Legenex organization (protected)' },
          { status: 403 }
        );
      }
    }

    let deletedCount = 0;

    // Delete child records
    const leads = await base44.asServiceRole.entities.Lead.filter({ organization_id });
    for (const lead of leads) {
      await base44.asServiceRole.entities.Lead.delete(lead.id);
    }
    deletedCount += leads.length;

    const buyers = await base44.asServiceRole.entities.Buyer.filter({ organization_id });
    for (const buyer of buyers) {
      await base44.asServiceRole.entities.Buyer.delete(buyer.id);
    }
    deletedCount += buyers.length;

    const agents = await base44.asServiceRole.entities.Agent.filter({ organization_id });
    for (const agent of agents) {
      await base44.asServiceRole.entities.Agent.delete(agent.id);
    }
    deletedCount += agents.length;

    const calls = await base44.asServiceRole.entities.Call.filter({ organization_id });
    for (const call of calls) {
      await base44.asServiceRole.entities.Call.delete(call.id);
    }
    deletedCount += calls.length;

    const messages = await base44.asServiceRole.entities.Message.filter({ organization_id });
    for (const msg of messages) {
      await base44.asServiceRole.entities.Message.delete(msg.id);
    }
    deletedCount += messages.length;

    const threads = await base44.asServiceRole.entities.ConversationThread.filter({ organization_id });
    for (const thread of threads) {
      await base44.asServiceRole.entities.ConversationThread.delete(thread.id);
    }
    deletedCount += threads.length;

    const activities = await base44.asServiceRole.entities.LeadActivity.filter({ organization_id });
    for (const act of activities) {
      await base44.asServiceRole.entities.LeadActivity.delete(act.id);
    }
    deletedCount += activities.length;

    const deliveries = await base44.asServiceRole.entities.LeadDelivery.filter({ organization_id });
    for (const del of deliveries) {
      await base44.asServiceRole.entities.LeadDelivery.delete(del.id);
    }
    deletedCount += deliveries.length;

    const jobs = await base44.asServiceRole.entities.ImportJob.filter({ organization_id });
    for (const job of jobs) {
      await base44.asServiceRole.entities.ImportJob.delete(job.id);
    }
    deletedCount += jobs.length;

    const sources = await base44.asServiceRole.entities.DataSource.filter({ organization_id });
    for (const source of sources) {
      await base44.asServiceRole.entities.DataSource.delete(source.id);
    }
    deletedCount += sources.length;

    const docs = await base44.asServiceRole.entities.Document.filter({ organization_id });
    for (const doc of docs) {
      await base44.asServiceRole.entities.Document.delete(doc.id);
    }
    deletedCount += docs.length;

    const docReqs = await base44.asServiceRole.entities.DocumentRequest.filter({ organization_id });
    for (const req of docReqs) {
      await base44.asServiceRole.entities.DocumentRequest.delete(req.id);
    }
    deletedCount += docReqs.length;

    const appointments = await base44.asServiceRole.entities.Appointment.filter({ organization_id });
    for (const apt of appointments) {
      await base44.asServiceRole.entities.Appointment.delete(apt.id);
    }
    deletedCount += appointments.length;

    const overrides = await base44.asServiceRole.entities.ComplianceOverride.filter({ organization_id });
    for (const ovr of overrides) {
      await base44.asServiceRole.entities.ComplianceOverride.delete(ovr.id);
    }
    deletedCount += overrides.length;

    const usage = await base44.asServiceRole.entities.BillingUsage.filter({ organization_id });
    for (const u of usage) {
      await base44.asServiceRole.entities.BillingUsage.delete(u.id);
    }
    deletedCount += usage.length;

    const creds = await base44.asServiceRole.entities.ProviderCredential.filter({ organization_id });
    for (const cred of creds) {
      await base44.asServiceRole.entities.ProviderCredential.delete(cred.id);
    }
    deletedCount += creds.length;

    // Delete members
    const members = await base44.asServiceRole.entities.OrganizationMember.filter({ organization_id });
    for (const member of members) {
      await base44.asServiceRole.entities.OrganizationMember.delete(member.id);
    }
    deletedCount += members.length;

    // Delete the org
    await base44.asServiceRole.entities.Organization.delete(organization_id);
    deletedCount += 1;

    // Log audit
    await base44.asServiceRole.entities.SuperAdminAuditLog.create({
      user_id: user.id,
      action_type: 'org_deleted',
      target_type: 'organization',
      target_id: organization_id,
      reason,
    });

    return Response.json({ success: true, deleted_records_count: deletedCount });
  } catch (error) {
    console.error('Delete error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});