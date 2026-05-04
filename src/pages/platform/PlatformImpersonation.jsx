import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

export default function PlatformImpersonation() {
  const [activeSessions, setActiveSessions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImpersonationData();
  }, []);

  const loadImpersonationData = async () => {
    try {
      const active = await base44.asServiceRole.entities.ImpersonationSession.filter({ ended_at: null });
      const hist = await base44.asServiceRole.entities.ImpersonationSession.filter({}, '-started_at', 100);
      
      setActiveSessions(active);
      setHistory(hist.filter(s => s.ended_at));
    } catch (err) {
      console.error('Failed to load impersonation data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6"><Skeleton className="h-64 rounded-lg" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Impersonation Sessions</h1>
        <p className="text-sm text-muted-foreground">Active and historical impersonation logs</p>
      </div>

      {/* Active sessions */}
      {activeSessions.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader>
            <CardTitle className="text-sm">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeSessions.map(session => (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border border-warning/20">
                  <div className="text-sm">
                    <p className="font-semibold">Impersonating user in session</p>
                    <p className="text-xs text-muted-foreground">{session.reason}</p>
                  </div>
                  <button className="text-destructive hover:text-destructive/80 text-sm font-medium">
                    End Session
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">History</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No impersonation history</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-semibold">Started</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Reason</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Duration</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Ended</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(session => (
                    <tr key={session.id} className="border-b border-border/50">
                      <td className="px-4 py-3">
                        {formatDistanceToNow(new Date(session.started_at), { addSuffix: true })}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{session.reason}</td>
                      <td className="px-4 py-3">{session.duration_minutes}m</td>
                      <td className="px-4 py-3 text-muted-foreground capitalize">{session.ended_reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}