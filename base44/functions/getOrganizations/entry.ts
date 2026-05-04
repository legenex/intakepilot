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
      return Response.json({ error: 'Not authorized' }, { status: 404 });
    }

    // Fetch all orgs with computed fields
    const allOrgs = await base44.asServiceRole.entities.Organization.filter({}, '-created_date', 10000);
    
    const enriched = allOrgs.map(org => {
      const PLAN_PRICES = {
        starter: { monthly: 297, annual: 3564 },
        professional: { monthly: 697, annual: 8364 },
        agency: { monthly: 1497, annual: 17964 },
      };

      const plan = org.plan || 'starter';
      const interval = org.plan_interval || 'monthly';
      const price = PLAN_PRICES[plan]?.[interval] || 0;
      const mrr = interval === 'monthly' ? price : price / 12;

      const healthScore = computeHealthScore(org);

      return {
        ...org,
        mrr: Math.round(mrr * 100) / 100,
        healthScore,
      };
    });

    // Log access
    await base44.asServiceRole.entities.SuperAdminAuditLog.create({
      user_id: user.id,
      user_email: user.email,
      action_type: 'view_audit_log',
      target_type: 'organization',
      reason: 'Organizations list access',
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      occurred_at: new Date().toISOString(),
    });

    return Response.json({ organizations: enriched });
  } catch (error) {
    console.error('Get organizations error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function computeHealthScore(org) {
  let score = 100;
  
  if (org.subscription_status === 'past_due') score -= 30;
  
  const lastActive = org.updated_date ? new Date(org.updated_date) : new Date(org.created_date);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  if (lastActive < thirtyDaysAgo) score -= 20;
  
  // TODO: check for open tickets, usage near cap
  
  return Math.max(0, score);
}