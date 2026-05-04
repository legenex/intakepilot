import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRecords = await base44.asServiceRole.entities.User.filter({
      id: user.id,
    });

    if (!userRecords.length || !userRecords[0].super_admin) {
      return Response.json({ error: 'Not authorized' }, { status: 403 });
    }

    const {
      action_type,
      target_type,
      target_id,
      target_organization_id,
      reason,
      before_state,
      after_state,
      impersonated_user_id,
    } = await req.json();

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const log = await base44.asServiceRole.entities.SuperAdminAuditLog.create({
      user_id: user.id,
      user_email: user.email,
      action_type,
      target_type,
      target_id,
      target_organization_id,
      reason,
      before_state,
      after_state,
      ip_address: ip,
      user_agent: userAgent,
      impersonating: !!impersonated_user_id,
      impersonated_user_id,
      occurred_at: new Date().toISOString(),
    });

    return Response.json({ logged: true, log_id: log.id });
  } catch (error) {
    console.error('Audit log error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});