import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

const STATUS_COLORS = {
  active: 'bg-success/10 text-success',
  trialing: 'bg-accent/10 text-accent',
  past_due: 'bg-destructive/10 text-destructive',
  canceled: 'bg-muted text-muted-foreground',
  paused: 'bg-muted text-muted-foreground',
};

export default function PlatformOrganizations() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrgs();
  }, []);

  const loadOrgs = async () => {
    try {
      const response = await base44.functions.invoke('getOrganizations', {});
      setOrgs(response.data.organizations || []);
    } catch (err) {
      console.error('Failed to load orgs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-32 bg-muted rounded" />
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Organizations</h1>
        <p className="text-sm text-muted-foreground">{orgs.length} organizations</p>
      </div>

      {orgs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            No organizations yet
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-semibold">Name</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Plan</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Status</th>
                    <th className="px-4 py-2.5 text-left font-semibold">MRR</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Health</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {orgs.map(org => (
                    <tr key={org.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/platform/organizations/${org.id}`} className="font-medium hover:text-primary">
                          {org.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground capitalize">{org.plan}</td>
                      <td className="px-4 py-3">
                        <Badge className={`text-[10px] px-2 py-0 ${STATUS_COLORS[org.subscription_status] || ''}`}>
                          {org.subscription_status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-mono">${org.mrr || 0}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold ${org.healthScore >= 70 ? 'text-success' : org.healthScore >= 40 ? 'text-warning' : 'text-destructive'}`}>
                          {org.healthScore}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDistanceToNow(new Date(org.created_date), { addSuffix: true })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}