/**
 * Check if organization has active subscription
 * Respects internal_comped flag for internally supported accounts
 */
export function isSubscriptionActive(org) {
  if (!org) return false;

  // If org is internally comped, always allow access
  if (org.internal_comped) return true;

  // Otherwise check subscription status
  return org.subscription_status === 'active' || org.subscription_status === 'trialing';
}

/**
 * Check if organization is in trial period
 */
export function isTrialing(org) {
  if (!org) return false;
  if (org.subscription_status !== 'trialing') return false;

  const trialEnd = new Date(org.trial_ends_at);
  return trialEnd > new Date();
}

/**
 * Get days remaining in trial
 */
export function getDaysUntilTrialEnd(org) {
  if (!org || org.subscription_status !== 'trialing') return null;

  const trialEnd = new Date(org.trial_ends_at);
  const now = new Date();
  const daysRemaining = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));

  return daysRemaining > 0 ? daysRemaining : 0;
}

/**
 * Check if subscription is past due
 */
export function isPastDue(org) {
  if (!org || org.internal_comped) return false;
  return org.subscription_status === 'past_due';
}

/**
 * Check if subscription is canceled
 */
export function isCanceled(org) {
  if (!org) return false;
  return org.subscription_status === 'canceled';
}