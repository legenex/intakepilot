import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super admin
    const adminGrant = await base44.asServiceRole.entities.SuperAdminGrant.filter({
      email: user.email.toLowerCase(),
      active: true,
    });

    if (adminGrant.length === 0) {
      return Response.json({ error: 'Forbidden: Super admin access required' }, { status: 403 });
    }

    const orgs = await base44.asServiceRole.entities.Organization.list('-created_date', 1000);
    
    const enriched = orgs.map(org => {
      const planPrices = { starter: 297, professional: 597, agency: 997 };
      const mrr = org.subscription_status === 'active' ? (planPrices[org.plan] || 0) : 0;
      const healthScore = org.subscription_status === 'active' ? 85 : org.subscription_status === 'trialing' ? 70 : 40;
      
      return {
        ...org,
        mrr,
        healthScore,
      };
    });

    return Response.json({ organizations: enriched });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});