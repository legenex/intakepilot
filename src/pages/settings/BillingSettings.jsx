import React from 'react';
import { useOrg } from '@/lib/OrgContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CreditCard, ExternalLink } from 'lucide-react';

const planLimits = {
  starter: { sms: 500, voice: 200, price: 297 },
  professional: { sms: 2500, voice: 1500, price: 797 },
  agency: { sms: 10000, voice: 7500, price: 1997 },
};

export default function BillingSettings() {
  const { currentOrg } = useOrg();

  if (!currentOrg) return null;

  const plan = currentOrg.plan || 'starter';
  const limits = planLimits[plan] || planLimits.starter;
  const status = currentOrg.subscription_status || 'trialing';

  const statusColors = {
    trialing: 'bg-primary/10 text-primary',
    active: 'bg-success/10 text-success',
    past_due: 'bg-warning/10 text-warning',
    canceled: 'bg-destructive/10 text-destructive',
    unpaid: 'bg-destructive/10 text-destructive',
  };

  return (
    <div className="space-y-6">
      {/* Current plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Current Plan</CardTitle>
            <Badge className={`text-xs ${statusColors[status] || ''}`}>
              {status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold capitalize">{plan}</h3>
              <p className="text-sm text-muted-foreground">${limits.price}/month · {currentOrg.plan_interval || 'monthly'} billing</p>
            </div>
            <Button variant="outline" size="sm">Change Plan</Button>
          </div>

          {status === 'trialing' && currentOrg.trial_ends_at && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm text-primary">
                Trial ends on {new Date(currentOrg.trial_ends_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usage This Period</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium">SMS Messages</span>
              <span className="text-xs text-muted-foreground font-mono">0 / {limits.sms.toLocaleString()}</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium">Voice Minutes</span>
              <span className="text-xs text-muted-foreground font-mono">0 / {limits.voice.toLocaleString()}</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium">Leads Processed</span>
              <span className="text-xs text-muted-foreground font-mono">0</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Payment method / portal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment & Invoices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">No payment method on file</p>
              <p className="text-xs text-muted-foreground">Add a card before your trial ends</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="w-3.5 h-3.5" /> Manage Billing Portal
            </Button>
            <Button variant="outline" size="sm">View Invoices</Button>
          </div>
        </CardContent>
      </Card>

      {/* Cancel */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Cancel Subscription</p>
              <p className="text-xs text-muted-foreground">Your data will be retained for 30 days after cancellation.</p>
            </div>
            <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
              Cancel Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}