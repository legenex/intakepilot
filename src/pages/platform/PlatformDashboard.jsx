import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Users, TrendingUp, AlertTriangle } from 'lucide-react';

export default function PlatformDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const { getPlatformStats } = await import('@/functions/getPlatformStats');
      const res = await getPlatformStats({});
      if (res.data) {
        setStats(res.data);
      }
    } catch (error) {
      console.error('Stats load error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 space-y-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  if (!stats) return <div className="p-6 text-muted-foreground">Failed to load platform stats</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">IntakePilot SaaS Operations Center</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Monthly Revenue</p>
                <p className="text-2xl font-bold mt-1">${stats.mrr?.toLocaleString() || '0'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Annual: ${stats.arr?.toLocaleString() || '0'}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Active Organizations</p>
                <p className="text-2xl font-bold mt-1">{stats.activeOrgs}</p>
                <p className="text-xs text-muted-foreground mt-0.5">of {stats.totalOrgs} total</p>
              </div>
              <Users className="w-8 h-8 text-success/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Avg Revenue/Account</p>
                <p className="text-2xl font-bold mt-1">${stats.arpaa}</p>
                <p className="text-xs text-muted-foreground mt-0.5">per year</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card className={stats.pastDueOrgs > 0 ? 'border-warning/30 bg-warning/5' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Past Due</p>
                <p className={`text-2xl font-bold mt-1 ${stats.pastDueOrgs > 0 ? 'text-warning' : ''}`}>
                  {stats.pastDueOrgs}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">need attention</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-warning/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'View Billing', href: '/platform/billing' },
            { label: 'Check Health', href: '/platform/health' },
            { label: 'Support Inbox', href: '/platform/support' },
            { label: 'Audit Log', href: '/platform/audit-log' },
          ].map(link => (
            <a
              key={link.href}
              href={link.href}
              className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-center text-xs font-medium"
            >
              {link.label}
            </a>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}