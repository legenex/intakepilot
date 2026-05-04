import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const PLAN_PRICES = {
  starter: {
    monthly: Deno.env.get('STRIPE_PRICE_STARTER_MONTHLY'),
    annual: Deno.env.get('STRIPE_PRICE_STARTER_ANNUAL'),
  },
  professional: {
    monthly: Deno.env.get('STRIPE_PRICE_PRO_MONTHLY'),
    annual: Deno.env.get('STRIPE_PRICE_PRO_ANNUAL'),
  },
  agency: {
    monthly: Deno.env.get('STRIPE_PRICE_AGENCY_MONTHLY'),
    annual: Deno.env.get('STRIPE_PRICE_AGENCY_ANNUAL'),
  },
};

const OVERAGE_PRICES = {
  sms: Deno.env.get('STRIPE_PRICE_SMS_OVERAGE'),
  voice: Deno.env.get('STRIPE_PRICE_VOICE_OVERAGE'),
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, interval, organization_id } = await req.json();

    if (!['starter', 'professional', 'agency'].includes(plan)) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    if (!['monthly', 'annual'].includes(interval)) {
      return Response.json({ error: 'Invalid interval' }, { status: 400 });
    }

    if (!PLAN_PRICES[plan][interval]) {
      return Response.json({ error: 'Stripe price not configured' }, { status: 500 });
    }

    // Fetch org
    const org = await base44.asServiceRole.entities.Organization.filter({
      id: organization_id,
    });

    if (!org.length) {
      return Response.json({ error: 'Organization not found' }, { status: 404 });
    }

    const orgData = org[0];

    // Create or fetch Stripe customer
    let customerId = orgData.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: {
          organization_id,
          owner_email: user.email,
        },
      });
      customerId = customer.id;
      await base44.asServiceRole.entities.Organization.update(organization_id, {
        stripe_customer_id: customerId,
      });
    }

    // Build line items: base plan + metered overages
    const lineItems = [
      {
        price: PLAN_PRICES[plan][interval],
        quantity: 1,
      },
      {
        price: OVERAGE_PRICES.sms,
      },
      {
        price: OVERAGE_PRICES.voice,
      },
    ];

    // Get request origin for success/cancel URLs
    const origin = new URL(req.headers.get('referer') || 'https://app.base44.io').origin;

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: lineItems,
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          organization_id,
        },
      },
      payment_method_collection: 'always',
      allow_promotion_codes: true,
      success_url: `${origin}/settings/billing?checkout=success`,
      cancel_url: `${origin}/settings/billing?checkout=canceled`,
    });

    return Response.json({ checkout_url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});