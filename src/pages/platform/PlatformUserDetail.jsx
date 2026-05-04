import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export default function PlatformUserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      const result = await base44.asServiceRole.entities.User.filter({ id });
      if (result.length) {
        setUser(result[0]);
      }
    } catch (err) {
      console.error('Failed to load user:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6"><Skeleton className="h-64 rounded-lg" /></div>;
  }

  if (!user) {
    return <div className="p-6 text-muted-foreground">User not found</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-semibold">{user.full_name?.charAt(0) || '?'}</span>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{user.full_name || user.email}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {user.super_admin && <Badge className="mt-2 bg-indigo-500/20 text-indigo-600">Super Admin</Badge>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Impersonate</Button>
          <Button variant="outline" size="sm" className="text-destructive">Force Logout</Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="memberships" className="space-y-4">
        <TabsList>
          <TabsTrigger value="memberships">Org Memberships</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          {user.super_admin && <TabsTrigger value="admin">Super Admin</TabsTrigger>}
        </TabsList>

        <TabsContent value="memberships">
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Org memberships coming soon
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Session history coming soon
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

        <TabsContent value="security">
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Security settings coming soon
            </CardContent>
          </Card>
        </TabsContent>

        {user.super_admin && (
          <TabsContent value="admin">
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Super admin details coming soon
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}