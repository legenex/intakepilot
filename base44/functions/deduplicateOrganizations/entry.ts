import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check super admin
    const adminGrant = await base44.asServiceRole.entities.SuperAdminGrant.filter({
      email: user.email.toLowerCase(),
      active: true,
    });

    if (adminGrant.length === 0) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all orgs
    const allOrgs = await base44.asServiceRole.entities.Organization.list('-created_date', 10000);

    // Group by (name, owner_email)
    const groups = new Map();
    allOrgs.forEach(org => {
      const ownerEmail = (org.created_by || '').toLowerCase();
      const key = `${org.name}|${ownerEmail}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(org);
    });

    let duplicatesRemoved = 0;
    let recordsReassigned = { members: 0, leads: 0, buyers: 0, agents: 0, calls: 0, messages: 0, documents: 0 };

    // Process each group
    for (const [key, orgs] of groups) {
      if (orgs.length <= 1) continue;

      // Keep the oldest (first in list since sorted by -created_date desc, so reverse)
      const sorted = [...orgs].reverse(); // Oldest first
      const keepOrg = sorted[0];
      const dupeOrgs = sorted.slice(1);

      for (const dupe of dupeOrgs) {
        // Soft delete the duplicate
        await base44.asServiceRole.entities.Organization.update(dupe.id, {
          soft_delete_at: new Date().toISOString(),
        });

        duplicatesRemoved++;

        // Reassign members
        const members = await base44.asServiceRole.entities.OrganizationMember.filter(
          { organization_id: dupe.id },
          '-created_date',
          1000
        );
        for (const m of members) {
          await base44.asServiceRole.entities.OrganizationMember.update(m.id, {
            organization_id: keepOrg.id,
          });
          recordsReassigned.members++;
        }

        // Reassign leads
        const leads = await base44.asServiceRole.entities.Lead.filter(
          { organization_id: dupe.id },
          '-created_date',
          1000
        );
        for (const l of leads) {
          await base44.asServiceRole.entities.Lead.update(l.id, {
            organization_id: keepOrg.id,
          });
          recordsReassigned.leads++;
        }

        // Reassign buyers
        const buyers = await base44.asServiceRole.entities.Buyer.filter(
          { organization_id: dupe.id },
          '-created_date',
          1000
        );
        for (const b of buyers) {
          await base44.asServiceRole.entities.Buyer.update(b.id, {
            organization_id: keepOrg.id,
          });
          recordsReassigned.buyers++;
        }

        // Reassign agents
        const agents = await base44.asServiceRole.entities.Agent.filter(
          { organization_id: dupe.id },
          '-created_date',
          1000
        );
        for (const a of agents) {
          await base44.asServiceRole.entities.Agent.update(a.id, {
            organization_id: keepOrg.id,
          });
          recordsReassigned.agents++;
        }

        // Reassign calls
        const calls = await base44.asServiceRole.entities.Call.filter(
          { organization_id: dupe.id },
          '-created_date',
          1000
        );
        for (const c of calls) {
          await base44.asServiceRole.entities.Call.update(c.id, {
            organization_id: keepOrg.id,
          });
          recordsReassigned.calls++;
        }

        // Reassign messages
        const messages = await base44.asServiceRole.entities.Message.filter(
          { organization_id: dupe.id },
          '-created_date',
          1000
        );
        for (const m of messages) {
          await base44.asServiceRole.entities.Message.update(m.id, {
            organization_id: keepOrg.id,
          });
          recordsReassigned.messages++;
        }

        // Reassign documents
        const docs = await base44.asServiceRole.entities.Document.filter(
          { organization_id: dupe.id },
          '-created_date',
          1000
        );
        for (const d of docs) {
          await base44.asServiceRole.entities.Document.update(d.id, {
            organization_id: keepOrg.id,
          });
          recordsReassigned.documents++;
        }

        // Log audit
        await base44.asServiceRole.entities.SuperAdminAuditLog.create({
          user_id: user.id,
          action_type: 'org_deleted',
          target_type: 'organization',
          target_id: dupe.id,
          target_organization_id: dupe.id,
          reason: `Merged duplicate org into ${keepOrg.id}`,
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        });
      }
    }

    return Response.json({
      groups_found: groups.size,
      duplicates_removed: duplicatesRemoved,
      records_reassigned: recordsReassigned,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});