import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all users, sorted by created_date
    const allUsers = await base44.asServiceRole.entities.User.filter({}, 'created_date', 1000);

    if (!allUsers.length) {
      return Response.json({ error: 'No users found' }, { status: 404 });
    }

    const firstUser = allUsers[0];

    // Check if they're already a super admin
    if (firstUser.super_admin) {
      return Response.json({ 
        message: 'First user is already super admin',
        user_id: firstUser.id,
        email: firstUser.email
      });
    }

    // Grant super admin to the first user
    const now = new Date().toISOString();
    await base44.asServiceRole.entities.User.update(firstUser.id, {
      super_admin: true,
      super_admin_granted_at: now,
      super_admin_granted_by: 'system_bootstrap',
    });

    // Log the bootstrap action
    await base44.asServiceRole.entities.SuperAdminAuditLog.create({
      user_id: 'system_bootstrap',
      user_email: 'system@base44.io',
      action_type: 'grant_super_admin',
      target_type: 'user',
      target_id: firstUser.id,
      reason: 'System bootstrap - first user on platform',
      ip_address: 'system',
      user_agent: 'system_bootstrap',
      occurred_at: now,
    });

    return Response.json({
      success: true,
      message: 'Super admin granted to first user',
      user_id: firstUser.id,
      email: firstUser.email,
    });
  } catch (error) {
    console.error('Bootstrap error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});