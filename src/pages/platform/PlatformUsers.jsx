import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

export default function PlatformUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await base44.functions.invoke('getUsers', {});
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
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
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">{users.length} users</p>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            No users yet
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-semibold">Email</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Name</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Status</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Super Admin</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Last Login</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Signup</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/platform/users/${user.id}`} className="font-medium hover:text-primary">
                          {user.email}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{user.full_name || '—'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                          {user.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {user.super_admin && <Badge className="bg-indigo-500/20 text-indigo-600 text-[10px]">Admin</Badge>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {user.last_login_at ? formatDistanceToNow(new Date(user.last_login_at), { addSuffix: true }) : '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDistanceToNow(new Date(user.created_date), { addSuffix: true })}
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