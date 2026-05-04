import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch full user record including super_admin flag
    const userRecords = await base44.asServiceRole.entities.User.filter({
      id: user.id,
    });

    if (!userRecords.length) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const fullUser = userRecords[0];

    if (!fullUser.super_admin) {
      // Return 404, not 403 — never reveal these routes exist
      return Response.json({ error: 'Not Found' }, { status: 404 });
    }

    // Update last active timestamp
    await base44.asServiceRole.entities.User.update(user.id, {
      super_admin_last_active_at: new Date().toISOString(),
    });

    return Response.json({ user: fullUser, authorized: true });
  } catch (error) {
    console.error('Super admin check error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});