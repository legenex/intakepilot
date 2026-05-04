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

    const { organization_id } = await req.json();

    const org = await base44.asServiceRole.entities.Organization.filter({
      id: organization_id,
    });

    if (!org.length || !org[0].stripe_customer_id) {
      return Response.json({ error: 'No Stripe customer found' }, { status: 404 });
    }

    const origin = new URL(req.headers.get('referer') || 'https://app.base44.io').origin;

    const session = await stripe.billingPortal.sessions.create({
      customer: org[0].stripe_customer_id,
      return_url: `${origin}/settings/billing`,
    });

    return Response.json({ portal_url: session.url });
  } catch (error) {
    console.error('Stripe portal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});