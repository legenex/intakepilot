import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

async function isSuperAdmin(base44, user) {
  if (!user || !user.email) return false;
  const grants = await base44.asServiceRole.entities.SuperAdminGrant.filter({
    email: user.email.toLowerCase(),
    active: true,
  });
  return grants.length > 0;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await isSuperAdmin(base44, user)) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    const allUsers = await base44.asServiceRole.entities.User.filter({}, '-created_date', 10000);

    const enriched = allUsers.map(u => ({
      ...u,
      status: u.is_locked ? 'locked' : (u.last_login_at ? 'active' : 'dormant'),
    }));

    // Log access
    await base44.asServiceRole.entities.SuperAdminAuditLog.create({
      user_id: user.id,
      user_email: user.email,
      action_type: 'view_audit_log',
      target_type: 'user',
      reason: 'Users list access',
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      occurred_at: new Date().toISOString(),
    });

    return Response.json({ users: enriched });
  } catch (error) {
    console.error('Get users error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});