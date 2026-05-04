import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useOrg } from '@/lib/OrgContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PROVIDER_CONFIG } from '@/lib/providerUtils';
import ProviderCard from '@/components/integrations/ProviderCard';
import { Phone, MessageSquare, Mic, Zap, AlertTriangle, CreditCard } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const PROVIDERS_ORDER = ['retell', 'vapi', 'twilio', 'elevenlabs'];

export default function Integrations() {
   const { currentOrg, membership } = useOrg();
   const { toast } = useToast();
   const [credentials, setCredentials] = useState({});
  const [loading, setLoading] = useState(true);

  const canAdmin = ['owner', 'admin'].includes(membership?.role);

  const loadCredentials = async () => {
    if (!currentOrg) return;
    const creds = await base44.entities.ProviderCredential.filter({ organization_id: currentOrg.id });
    const map = {};
    creds.forEach(c => { map[c.provider] = c; });
    setCredentials(map);
    setLoading(false);
  };

  useEffect(() => { loadCredentials(); }, [currentOrg]);

  const handleSaveCredentials = async (provider, creds) => {
    const existing = credentials[provider];
    let record;
    if (existing) {
      record = await base44.entities.ProviderCredential.update(existing.id, {
        credentials: creds,
        status: 'disconnected',
        last_error: null
      });
    } else {
      record = await base44.entities.ProviderCredential.create({
        organization_id: currentOrg.id,
        provider,
        credentials: creds,
        status: 'disconnected'
      });
    }
    setCredentials(prev => ({ ...prev, [provider]: { ...record, credentials: creds } }));
    return record;
  };

  const handleTestConnection = async (provider, creds) => {
    const { testProviderConnection } = await import('@/functions/testProviderConnection');
    const res = await testProviderConnection({ provider, credentials: creds });
    const result = res.data;

    // Update status in DB
    const existing = credentials[provider];
    if (existing) {
      const updated = await base44.entities.ProviderCredential.update(existing.id, {
        status: result.success ? 'connected' : 'error',
        last_tested_at: new Date().toISOString(),
        last_error: result.success ? null : result.message,
        metadata: result.data || {}
      });
      setCredentials(prev => ({ ...prev, [provider]: { ...prev[provider], ...updated, credentials: creds } }));
    }

    return result;
  };

  const handleDisconnect = async (provider) => {
    const existing = credentials[provider];
    if (existing) {
      await base44.entities.ProviderCredential.update(existing.id, {
        status: 'disconnected',
        credentials: {}
      });
      setCredentials(prev => ({ ...prev, [provider]: { ...prev[provider], status: 'disconnected', credentials: {} } }));
    }
  };

  const connectedCount = Object.values(credentials).filter(c => c.status === 'connected').length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold">Integrations</h1>
        <p className="text-sm text-muted-foreground">Connect providers to enable voice, SMS, and payment processing</p>
      </div>

      {/* Status banner */}
      {!loading && connectedCount === 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-warning/30 bg-warning/5">
          <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold">No providers connected</p>
            <p className="text-xs text-muted-foreground mt-0.5">Connect at least one voice provider (Retell or Vapi) and Twilio for SMS to enable AI agents. Test calls and SMS are disabled until credentials are added.</p>
          </div>
        </div>
      )}

      {/* Provider tiles */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Phone className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Voice Providers</h2>
          <p className="text-xs text-muted-foreground">(choose one or both)</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
          </div>
        ) : (
          ['retell', 'vapi'].map(p => (
            <ProviderCard
              key={p}
              provider={p}
              config={PROVIDER_CONFIG[p]}
              credential={credentials[p]}
              canEdit={canAdmin}
              onSave={(creds) => handleSaveCredentials(p, creds)}
              onTest={(creds) => handleTestConnection(p, creds)}
              onDisconnect={() => handleDisconnect(p)}
            />
          ))
        )}

        <div className="flex items-center gap-2 mt-6 mb-1">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">SMS Provider</h2>
        </div>

        {loading ? <Skeleton className="h-40 rounded-xl" /> : (
          <ProviderCard
            key="twilio"
            provider="twilio"
            config={PROVIDER_CONFIG.twilio}
            credential={credentials.twilio}
            canEdit={canAdmin}
            onSave={(creds) => handleSaveCredentials('twilio', creds)}
            onTest={(creds) => handleTestConnection('twilio', creds)}
            onDisconnect={() => handleDisconnect('twilio')}
            extraContent={
              <div className="mt-3 p-3 rounded-lg border border-warning/30 bg-warning/5">
                <p className="text-xs font-semibold text-warning mb-1">⚠️ A2P 10DLC Required for Scale</p>
                <p className="text-xs text-muted-foreground">Outbound SMS will be heavily throttled or blocked without A2P 10DLC registration. Submit registration before scaling beyond test volume.</p>
                <a href="https://www.twilio.com/en-us/a2p-10dlc" target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline mt-1 inline-block">Register A2P 10DLC →</a>
              </div>
            }
          />
        )}

        <div className="flex items-center gap-2 mt-6 mb-1">
          <Mic className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Voice Library (TTS)</h2>
          <p className="text-xs text-muted-foreground">(optional — for custom voices)</p>
        </div>

        {loading ? <Skeleton className="h-40 rounded-xl" /> : (
          <ProviderCard
            key="elevenlabs"
            provider="elevenlabs"
            config={PROVIDER_CONFIG.elevenlabs}
            credential={credentials.elevenlabs}
            canEdit={canAdmin}
            onSave={(creds) => handleSaveCredentials('elevenlabs', creds)}
            onTest={(creds) => handleTestConnection('elevenlabs', creds)}
            onDisconnect={() => handleDisconnect('elevenlabs')}
          />
        )}

        <div className="flex items-center gap-2 mt-6 mb-1">
          <CreditCard className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Payments</h2>
        </div>

        {loading ? <Skeleton className="h-40 rounded-xl" /> : (
          <Card className="border border-border">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-semibold text-sm">Stripe</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      Configured
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Payment processing for subscriptions and invoicing</p>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg border border-border bg-muted/30 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Webhook URL:</p>
                <div className="flex gap-2 items-stretch">
                  <code className="flex-1 px-2 py-1.5 rounded bg-background border border-border text-xs font-mono text-foreground overflow-x-auto">
                    https://app.base44.io/functions/stripeWebhook
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-full text-xs px-2.5"
                    onClick={async () => {
                      await navigator.clipboard.writeText('https://app.base44.io/functions/stripeWebhook');
                      toast({ title: 'Webhook URL copied to clipboard' });
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground italic">
                  Paste into Stripe Dashboard → Developers → Webhooks. Subscribe to: checkout.session.completed, customer.subscription.*, invoice.paid, invoice.payment_failed
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}