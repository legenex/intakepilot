import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Check if user is a super admin
    if (!user || !user.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const grants = await base44.asServiceRole.entities.SuperAdminGrant.filter({
      email: user.email.toLowerCase(),
      active: true,
    });
    
    if (grants.length === 0) {
      return Response.json({ error: 'Forbidden: Super admin only' }, { status: 403 });
    }

    const { email, role } = await req.json();

    if (!email || !role) {
      return Response.json({ error: 'Missing email or role' }, { status: 400 });
    }

    // Update the user
    const users = await base44.asServiceRole.entities.User.filter({ email });
    if (users.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = await base44.asServiceRole.entities.User.update(users[0].id, {
      role,
    });

    return Response.json({ success: true, user: updatedUser });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});