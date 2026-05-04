import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organization_id, type, quantity } = await req.json();

    if (!['sms', 'voice'].includes(type)) {
      return Response.json({ error: 'Invalid type' }, { status: 400 });
    }

    if (!quantity || quantity <= 0) {
      return Response.json({ error: 'Invalid quantity' }, { status: 400 });
    }

    // Fetch org
    const org = await base44.asServiceRole.entities.Organization.filter({
      id: organization_id,
    });

    if (!org.length) {
      return Response.json({ error: 'Organization not found' }, { status: 404 });
    }

    const orgData = org[0];
    const itemId = type === 'sms' ? orgData.stripe_subscription_item_id_sms : orgData.stripe_subscription_item_id_voice;

    if (!itemId) {
      console.warn(`No subscription item ID for ${type} on org ${organization_id}`);
      return Response.json({ success: false, message: 'No metered subscription item' });
    }

    // Record usage with Stripe
    await stripe.subscriptionItems.createUsageRecord(itemId, {
      quantity: Math.ceil(quantity),
      timestamp: Math.floor(Date.now() / 1000),
      action: 'increment',
    });

    // Also update local BillingUsage
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

    const usage = await base44.asServiceRole.entities.BillingUsage.filter({
      organization_id,
      period_start: { $gte: periodStart },
      period_end: { $lte: periodEnd },
    });

    if (usage.length) {
      const update = type === 'sms'
        ? { sms_count: (usage[0].sms_count || 0) + quantity }
        : { voice_minutes: (usage[0].voice_minutes || 0) + quantity };
      await base44.asServiceRole.entities.BillingUsage.update(usage[0].id, update);
    } else {
      const data = {
        organization_id,
        period_start: periodStart,
        period_end: periodEnd,
      };
      data[type === 'sms' ? 'sms_count' : 'voice_minutes'] = quantity;
      await base44.asServiceRole.entities.BillingUsage.create(data);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Usage recording error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});