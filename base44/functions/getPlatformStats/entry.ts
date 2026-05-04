import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Check if user is a super admin via SuperAdminGrant
    if (!user || !user.email) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
    
    const grants = await base44.asServiceRole.entities.SuperAdminGrant.filter({
      email: user.email.toLowerCase(),
      active: true,
    });
    
    if (grants.length === 0) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    // Fetch orgs
    const orgs = await base44.asServiceRole.entities.Organization.list('-created_date', 10000);
    
    const planPrices = { starter: 297, professional: 597, agency: 997 };
    let totalMrr = 0;
    const mrrByPlan = { starter: 0, professional: 0, agency: 0 };
    const activeOrgCount = orgs.filter(o => o.subscription_status === 'active').length;
    const pastDueCount = orgs.filter(o => o.subscription_status === 'past_due').length;
    const trialingCount = orgs.filter(o => o.subscription_status === 'trialing').length;

    orgs.forEach(org => {
      if (org.subscription_status === 'active' && org.plan) {
        const mrr = planPrices[org.plan] || 0;
        mrrByPlan[org.plan] += mrr;
        totalMrr += mrr;
      }
    });

    const arr = totalMrr * 12;
    const arpaa = activeOrgCount > 0 ? Math.round(arr / activeOrgCount) : 0;

    return Response.json({
      mrr: totalMrr,
      arr,
      arpaa,
      mrrByPlan,
      activeOrgs: activeOrgCount,
      pastDueOrgs: pastDueCount,
      trialingOrgs: trialingCount,
      totalOrgs: orgs.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});