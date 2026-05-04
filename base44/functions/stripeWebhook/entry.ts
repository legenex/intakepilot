import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    // Verify signature
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Check idempotency
    const base44 = createClientFromRequest(req);
    const existingEvent = await base44.asServiceRole.entities.StripeEvent.filter({
      stripe_event_id: event.id,
    });

    if (existingEvent.length) {
      console.log(`Event ${event.id} already processed`);
      return Response.json({ received: true });
    }

    // Parse payload
    const eventData = event.data.object;
    let organizationId = null;
    let status = null;
    let plan = null;
    let planInterval = null;
    let currentPeriodEnd = null;
    let cancelAtPeriodEnd = false;
    let subscriptionItemIdSms = null;
    let subscriptionItemIdVoice = null;

    // Handle event types
    if (event.type === 'checkout.session.completed') {
      const session = eventData;
      organizationId = session.metadata?.organization_id;

      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        status = mapStripeStatus(subscription.status);
        currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

        // Extract plan and subscription items
        for (const item of subscription.items.data) {
          const priceId = item.price.id;
          const plan_match = inferPlanFromPriceId(priceId);
          if (plan_match) {
            plan = plan_match.plan;
            planInterval = plan_match.interval;
          }

          // Store metered item IDs
          if (item.price.metadata?.metering_type === 'sms') {
            subscriptionItemIdSms = item.id;
          }
          if (item.price.metadata?.metering_type === 'voice') {
            subscriptionItemIdVoice = item.id;
          }
        }

        // Update org
        if (organizationId) {
          await base44.asServiceRole.entities.Organization.update(organizationId, {
            stripe_subscription_id: subscription.id,
            subscription_status: status,
            current_period_end: currentPeriodEnd,
            plan: plan || 'starter',
            plan_interval: planInterval || 'monthly',
            stripe_subscription_item_id_sms: subscriptionItemIdSms,
            stripe_subscription_item_id_voice: subscriptionItemIdVoice,
            trial_ends_at: new Date(subscription.trial_end * 1000).toISOString(),
          });
        }
      }
    } else if (event.type === 'customer.subscription.updated') {
      const subscription = eventData;
      organizationId = subscription.metadata?.organization_id;
      status = mapStripeStatus(subscription.status);
      currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
      cancelAtPeriodEnd = subscription.cancel_at_period_end;

      if (organizationId) {
        await base44.asServiceRole.entities.Organization.update(organizationId, {
          subscription_status: status,
          current_period_end: currentPeriodEnd,
          cancel_at_period_end: cancelAtPeriodEnd,
        });
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = eventData;
      organizationId = subscription.metadata?.organization_id;

      if (organizationId) {
        await base44.asServiceRole.entities.Organization.update(organizationId, {
          subscription_status: 'canceled',
        });
      }
    }

    // Log the event
    if (organizationId) {
      await base44.asServiceRole.entities.StripeEvent.create({
        stripe_event_id: event.id,
        type: event.type,
        organization_id: organizationId,
        payload: event,
        processed_at: new Date().toISOString(),
      });
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function mapStripeStatus(stripeStatus) {
  const map = {
    trialing: 'trialing',
    active: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'unpaid',
    paused: 'paused',
  };
  return map[stripeStatus] || 'active';
}

function inferPlanFromPriceId(priceId) {
  // Map Stripe price IDs to plan + interval
  // Assumes price ID format or metadata tagging
  const plans = {
    [Deno.env.get('STRIPE_PRICE_STARTER_MONTHLY')]: { plan: 'starter', interval: 'monthly' },
    [Deno.env.get('STRIPE_PRICE_STARTER_ANNUAL')]: { plan: 'starter', interval: 'annual' },
    [Deno.env.get('STRIPE_PRICE_PRO_MONTHLY')]: { plan: 'professional', interval: 'monthly' },
    [Deno.env.get('STRIPE_PRICE_PRO_ANNUAL')]: { plan: 'professional', interval: 'annual' },
    [Deno.env.get('STRIPE_PRICE_AGENCY_MONTHLY')]: { plan: 'agency', interval: 'monthly' },
    [Deno.env.get('STRIPE_PRICE_AGENCY_ANNUAL')]: { plan: 'agency', interval: 'annual' },
  };
  return plans[priceId];
}