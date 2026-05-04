import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const PROVIDERS = ['retell', 'vapi', 'twilio', 'elevenlabs', 'stripe'];

export default function PlatformIntegrationsOverview() {
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState({});

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const creds = await base44.entities.ProviderCredential.list();
      const calls = await base44.entities.Call.list('-created_date', 1000);

      const intgMap = {};
      PROVIDERS.forEach(provider => {
        const providerCreds = creds.filter(c => c.provider === provider);
        const connectedCount = providerCreds.filter(c => c.status === 'connected').length;
        const providerCalls = calls.filter(c => c.provider === provider);
        const errorCount = providerCalls.filter(c => c.status === 'failed').length;
        const errorRate = providerCalls.length > 0 ? ((errorCount / providerCalls.length) * 100).toFixed(1) : 0;

        intgMap[provider] = {
          totalConnected: connectedCount,
          recentlyUsed: new Set(providerCalls.filter(c => new Date(c.created_date) > new Date(Date.now() - 7 * 86400000)).map(c => c.organization_id)).size,
          errorRate,
          volumeProcessed: providerCalls.length,
          staleOrgCount: providerCreds.filter(c => new Date(c.last_tested_at) < new Date(Date.now() - 7 * 86400000)).length,
        };
      });

      setIntegrations(intgMap);
    } catch (error) {
      console.error('Integrations load error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 space-y-4">{[1,2].map(i => <Skeleton key={i} className="h-24" />)}</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Integrations Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Per-provider health and adoption across all orgs</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PROVIDERS.map(provider => {
          const intg = integrations[provider];
          if (!intg) return null;
          return (
            <Card key={provider}>
              <CardHeader>
                <CardTitle className="text-sm font-semibold capitalize">{provider}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Connected Orgs</span>
                  <span className="font-semibold">{intg.totalConnected}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recently Used (7d)</span>
                  <span className="font-semibold">{intg.recentlyUsed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Error Rate (24h)</span>
                  <span className={intg.errorRate > 5 ? 'text-warning font-semibold' : ''}>{intg.errorRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Volume Processed</span>
                  <span className="font-mono font-semibold">{intg.volumeProcessed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stale Creds (7d+)</span>
                  <span className={intg.staleOrgCount > 0 ? 'text-warning font-semibold' : ''}>{intg.staleOrgCount}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Health summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Health Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          <p>Monitor integration health across all organizations. High error rates or stale credentials indicate platform-wide issues.</p>
        </CardContent>
      </Card>
    </div>
  );
}