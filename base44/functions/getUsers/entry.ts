import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super admin
    const adminGrant = await base44.asServiceRole.entities.SuperAdminGrant.filter({
      email: user.email.toLowerCase(),
      active: true,
    });

    if (adminGrant.length === 0) {
      return Response.json({ error: 'Forbidden: Super admin access required' }, { status: 403 });
    }

    const users = await base44.asServiceRole.entities.User.list('-created_date', 1000);
    
    const grants = await base44.asServiceRole.entities.SuperAdminGrant.list('-created_date', 1000);
    const adminEmails = new Set(grants.filter(g => g.active).map(g => g.email.toLowerCase()));

    const enriched = users.map(u => ({
      ...u,
      super_admin: adminEmails.has((u.email || '').toLowerCase()),
    }));

    return Response.json({ users: enriched });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});