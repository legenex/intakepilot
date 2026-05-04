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

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Fetch all orgs
    const allOrgs = await base44.asServiceRole.entities.Organization.filter({}, '-created_date', 10000);
    
    // Fetch all users
    const allUsers = await base44.asServiceRole.entities.User.filter({}, '-created_date', 10000);

    // Compute stats
    const totalOrgs = allOrgs.length;
    const totalUsers = allUsers.length;
    
    // Active orgs (had activity in last 30d)
    const activeOrgs = allOrgs.filter(o => {
      const lastActive = o.updated_date ? new Date(o.updated_date) : new Date(o.created_date);
      return lastActive >= thirtyDaysAgo;
    }).length;

    const trialingOrgs = allOrgs.filter(o => o.subscription_status === 'trialing').length;
    const pastDueOrgs = allOrgs.filter(o => o.subscription_status === 'past_due').length;
    const canceledOrgsLastMonth = allOrgs.filter(o => {
      if (o.subscription_status !== 'canceled') return false;
      const canceledAt = o.updated_date ? new Date(o.updated_date) : null;
      return canceledAt && canceledAt >= thirtyDaysAgo;
    }).length;

    // Compute MRR
    const PLAN_PRICES = {
      starter: { monthly: 297, annual: 3564 },
      professional: { monthly: 697, annual: 8364 },
      agency: { monthly: 1497, annual: 17964 },
    };

    let totalMrr = 0;
    allOrgs.forEach(o => {
      if (o.subscription_status === 'active' || o.subscription_status === 'trialing') {
        const plan = o.plan || 'starter';
        const interval = o.plan_interval || 'monthly';
        const price = PLAN_PRICES[plan]?.[interval] || 0;
        totalMrr += interval === 'monthly' ? price : price / 12;
      }
    });

    const totalArr = totalMrr * 12;

    // Log the access
    await base44.asServiceRole.entities.SuperAdminAuditLog.create({
      user_id: user.id,
      user_email: user.email,
      action_type: 'view_audit_log',
      target_type: 'organization',
      reason: 'Platform dashboard access',
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      occurred_at: new Date().toISOString(),
    });

    return Response.json({
      totalOrgs,
      activeOrgs,
      trialingOrgs,
      pastDueOrgs,
      canceledOrgsLastMonth,
      totalUsers,
      totalMrr: Math.round(totalMrr * 100) / 100,
      totalArr: Math.round(totalArr * 100) / 100,
    });
  } catch (error) {
    console.error('Platform stats error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});