import { useOrg } from '@/lib/OrgContext';
import { useMemo } from 'react';

export function useSubscriptionStatus() {
  const { currentOrg } = useOrg();

  return useMemo(() => {
    if (!currentOrg) {
      return {
        status: null,
        isPastDue: false,
        isCanceled: false,
        isTrialing: false,
        daysUntilTrialEnd: null,
        periodEndDate: null,
      };
    }

    const status = currentOrg.subscription_status || 'trialing';
    const now = new Date();
    const periodEnd = currentOrg.current_period_end ? new Date(currentOrg.current_period_end) : null;
    const trialEnd = currentOrg.trial_ends_at ? new Date(currentOrg.trial_ends_at) : null;

    const daysUntilTrialEnd = trialEnd ? Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)) : null;
    const isPastDue = status === 'past_due';
    const isCanceled = status === 'canceled' && periodEnd && periodEnd < now;
    const isTrialing = status === 'trialing';

    return {
      status,
      isPastDue,
      isCanceled,
      isTrialing,
      daysUntilTrialEnd: isTrialing ? daysUntilTrialEnd : null,
      periodEndDate: periodEnd,
    };
  }, [currentOrg]);
}