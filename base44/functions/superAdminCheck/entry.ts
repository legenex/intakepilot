import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !user.email) {
      return Response.json({ is_super_admin: false }, { status: 200 });
    }

    const emailLower = user.email.toLowerCase();

    const grants = await base44.asServiceRole.entities.SuperAdminGrant.filter({
      email: emailLower,
      active: true,
    });

    const isSuperAdmin = grants.length > 0;

    return Response.json({
      is_super_admin: isSuperAdmin,
      authorized: isSuperAdmin,
      user: isSuperAdmin ? user : null,
    }, { status: 200 });
  } catch (error) {
    console.error('Super admin check error:', error.message);
    return Response.json({ is_super_admin: false, error: error.message }, { status: 200 });
  }
});