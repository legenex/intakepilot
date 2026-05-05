import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only super admins may run this
    const grants = await base44.asServiceRole.entities.SuperAdminGrant.filter({
      email: user.email.toLowerCase(),
      active: true,
    });
    if (grants.length === 0) {
      return Response.json({ error: 'Forbidden: Super admin access required' }, { status: 403 });
    }

    // Load all memberships and all existing org IDs
    const [allMembers, allOrgs] = await Promise.all([
      base44.asServiceRole.entities.OrganizationMember.list(),
      base44.asServiceRole.entities.Organization.list(),
    ]);

    const existingOrgIds = new Set(allOrgs.map(o => o.id));

    const stale = allMembers.filter(m => !existingOrgIds.has(m.organization_id));

    let removed = 0;
    for (const m of stale) {
      try {
        await base44.asServiceRole.entities.OrganizationMember.delete(m.id);
        removed++;
      } catch (err) {
        console.warn(`Failed to delete stale member ${m.id}:`, err?.message);
      }
    }

    return Response.json({
      checked: allMembers.length,
      removed,
      kept: allMembers.length - removed,
      stale_details: stale.map(m => ({ id: m.id, user_email: m.user_email, organization_id: m.organization_id })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});