import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Building2, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react';

const STAT_CARDS = [
  { label: 'Total Orgs', key: 'totalOrgs', icon: Building2, color: 'text-primary' },
  { label: 'Active Orgs', key: 'activeOrgs', icon: TrendingUp, color: 'text-success' },
  { label: 'Trialing', key: 'trialingOrgs', icon: Users, color: 'text-accent' },
  { label: 'Past Due', key: 'pastDueOrgs', icon: AlertTriangle, color: 'text-destructive' },
  { label: 'Canceled (30d)', key: 'canceledOrgsLastMonth', icon: Users, color: 'text-muted-foreground' },
  { label: 'Total Users', key: 'totalUsers', icon: Users, color: 'text-primary' },
  { label: 'MRR', key: 'totalMrr', icon: DollarSign, color: 'text-success', format: 'currency' },
  { label: 'ARR', key: 'totalArr', icon: DollarSign, color: 'text-success', format: 'currency' },
];

export default function PlatformDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await base44.functions.invoke('getPlatformStats', {});
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of all organizations and metrics</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STAT_CARDS.map(stat => {
          const Icon = stat.icon;
          const value = stats ? stats[stat.key] : null;
          
          let displayValue = value;
          if (stat.format === 'currency' && value !== null) {
            displayValue = `$${value.toLocaleString()}`;
          }

          return (
            <Card key={stat.key}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                {loading ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{displayValue}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">New Orgs (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center text-muted-foreground text-xs">
              Chart coming in Part B
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground space-y-2">
              <p>Activity feed coming in Part B</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}