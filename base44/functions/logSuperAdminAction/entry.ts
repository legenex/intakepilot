import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      action_type,
      target_type = 'organization',
      target_id,
      target_organization_id,
      before_state,
      after_state,
      reason,
    } = body;

    // Check super admin
    const adminGrant = await base44.asServiceRole.entities.SuperAdminGrant.filter({
      email: user.email.toLowerCase(),
      active: true,
    });

    if (adminGrant.length === 0) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create audit log entry
    const log = await base44.asServiceRole.entities.SuperAdminAuditLog.create({
      user_id: user.id,
      action_type,
      target_type,
      target_id,
      target_organization_id,
      before_state,
      after_state,
      reason,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent'),
    });

    return Response.json({ logged: true, id: log.id });
  } catch (error) {
    console.error('Audit log error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});