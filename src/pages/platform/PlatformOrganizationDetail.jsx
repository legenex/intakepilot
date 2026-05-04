import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2 } from 'lucide-react';

export default function PlatformOrganizationDetail() {
  const { id } = useParams();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrg();
  }, [id]);

  const loadOrg = async () => {
    try {
      const result = await base44.asServiceRole.entities.Organization.filter({ id });
      if (result.length) {
        setOrg(result[0]);
      }
    } catch (err) {
      console.error('Failed to load org:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6"><Skeleton className="h-64 rounded-lg" /></div>;
  }

  if (!org) {
    return <div className="p-6 text-muted-foreground">Organization not found</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{org.name}</h1>
          <p className="text-sm text-muted-foreground">{org.slug}</p>
          <div className="flex gap-2 mt-2">
            <Badge>{org.plan}</Badge>
            <Badge variant={org.subscription_status === 'active' ? 'default' : 'secondary'}>{org.subscription_status}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Impersonate Owner</Button>
          <Button variant="outline" size="sm">Edit</Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="calls">Calls</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Organization Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Plan</p>
                  <p className="font-semibold capitalize">{org.plan}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-semibold capitalize">{org.subscription_status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-semibold">{new Date(org.created_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Period End</p>
                  <p className="font-semibold">{org.current_period_end ? new Date(org.current_period_end).toLocaleDateString() : '—'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Members list coming soon
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Billing details coming soon
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Activity log coming soon
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads">
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Leads coming soon
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calls">
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Calls coming soon
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Compliance overrides coming soon
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Internal notes coming soon
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}