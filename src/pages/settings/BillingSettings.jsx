import React, { useState, useEffect } from 'react';
import { useOrg } from '@/lib/OrgContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { PLAN_LIMITS, PLAN_PRICING } from '@/lib/planLimits';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangle, CreditCard, ExternalLink, ArrowUpRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function BillingSettings() {
  const { currentOrg } = useOrg();
  const { toast } = useToast();
  const subStatus = useSubscriptionStatus();
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    if (!currentOrg) return;
    loadUsage();
  }, [currentOrg]);

  const loadUsage = async () => {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

    const data = await base44.entities.BillingUsage.filter({
      organization_id: currentOrg.id,
      period_start: { $gte: periodStart },
      period_end: { $lte: periodEnd },
    });

    setUsage(data[0] || { sms_count: 0, voice_minutes: 0 });
  };

  const openPortal = async () => {
    if (!currentOrg?.stripe_customer_id) {
      toast({ title: 'No active subscription', variant: 'destructive' });
      return;
    }

    setPortalLoading(true);
    try {
      const { stripePortal } = await import('@/functions/stripePortal');
      const res = await stripePortal({ organization_id: currentOrg.id });
      if (res.data?.portal_url) {
        window.open(res.data.portal_url, '_blank');
      }
    } catch (error) {
      toast({ title: 'Error opening portal', variant: 'destructive' });
    } finally {
      setPortalLoading(false);
    }
  };

  const initCheckout = async (plan, interval) => {
    setLoading(true);
    try {
      const { stripeCheckout } = await import('@/functions/stripeCheckout');
      const res = await stripeCheckout({
        plan,
        interval,
        organization_id: currentOrg.id,
      });
      if (res.data?.checkout_url) {
        window.location.href = res.data.checkout_url;
      }
    } catch (error) {
      toast({ title: 'Error initiating checkout', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!currentOrg) {
    return <div className="p-6 text-muted-foreground">Loading organization...</div>;
  }

  const planLimits = PLAN_LIMITS[currentOrg.plan] || PLAN_LIMITS.starter;
  const smsPercent = usage ? Math.round((usage.sms_count / planLimits.sms) * 100) : 0;
  const voicePercent = usage ? Math.round((usage.voice_minutes / planLimits.voice) * 100) : 0;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Past due banner */}
      {subStatus.isPastDue && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-sm text-destructive">Payment Failed</p>
            <p className="text-xs text-muted-foreground mt-1">Your subscription is past due. Update your payment method to keep your account active.</p>
            <Button size="sm" onClick={openPortal} disabled={portalLoading} className="mt-3 gap-1.5">
              {portalLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
              Update Payment Method
            </Button>
          </div>
        </div>
      )}

      {/* Current subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Plan</p>
              <p className="text-sm font-bold capitalize mt-1">{currentOrg.plan}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Billing</p>
              <p className="text-sm font-bold capitalize mt-1">{currentOrg.plan_interval}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Status</p>
              <Badge
                variant="outline"
                className={`mt-1 text-[10px] ${
                  subStatus.isTrialing
                    ? 'bg-info/10 text-info border-info/30'
                    : subStatus.status === 'active'
                    ? 'bg-success/10 text-success border-success/30'
                    : 'bg-warning/10 text-warning border-warning/30'
                }`}
              >
                {subStatus.isTrialing ? 'Trialing' : subStatus.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Renews</p>
              <p className="text-sm font-bold mt-1">
                {subStatus.periodEndDate ? format(subStatus.periodEndDate, 'MMM d, yyyy') : '—'}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={openPortal}
              disabled={portalLoading || !currentOrg.stripe_customer_id}
              className="gap-1.5"
            >
              {portalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
              Manage Subscription
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => initCheckout(currentOrg.plan, currentOrg.plan_interval)}
              disabled={loading}
              className="gap-1.5"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Change Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Period Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* SMS Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold">SMS Messages</label>
              <span className="text-xs text-muted-foreground">
                {usage?.sms_count || 0} / {planLimits.sms}
              </span>
            </div>
            <Progress value={Math.min(smsPercent, 100)} className="h-2" />
            {smsPercent > 100 && (
              <p className="text-xs text-warning mt-1.5">
                <ArrowUpRight className="w-3 h-3 inline mr-1" />
                {Math.round(usage.sms_count - planLimits.sms)} overage messages at ${planLimits.overage_sms}/msg
              </p>
            )}
          </div>

          {/* Voice Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold">Voice Minutes</label>
              <span className="text-xs text-muted-foreground">
                {usage?.voice_minutes || 0} / {planLimits.voice}
              </span>
            </div>
            <Progress value={Math.min(voicePercent, 100)} className="h-2" />
            {voicePercent > 100 && (
              <p className="text-xs text-warning mt-1.5">
                <ArrowUpRight className="w-3 h-3 inline mr-1" />
                {Math.round(usage.voice_minutes - planLimits.voice)} overage minutes at ${planLimits.overage_voice}/min
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upgrade Your Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(PLAN_LIMITS).map(([plan, limits]) => {
              const isCurrent = currentOrg.plan === plan;
              return (
                <div
                  key={plan}
                  className={`p-4 rounded-lg border ${
                    isCurrent ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <p className="text-sm font-bold capitalize mb-1">{plan}</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    ${PLAN_PRICING[plan].monthly}/mo
                  </p>
                  <ul className="space-y-1.5 mb-3">
                    <li className="text-xs text-muted-foreground">
                      <span className="font-semibold">{limits.sms.toLocaleString()}</span> SMS/mo
                    </li>
                    <li className="text-xs text-muted-foreground">
                      <span className="font-semibold">{limits.voice}</span> voice mins/mo
                    </li>
                  </ul>
                  {isCurrent ? (
                    <Badge variant="outline" className="w-full justify-center text-xs">
                      Current Plan
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => initCheckout(plan, 'monthly')}
                      disabled={loading}
                      className="w-full text-xs h-7"
                    >
                      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Upgrade'}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}