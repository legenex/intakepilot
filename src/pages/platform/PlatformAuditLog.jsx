import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Download, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function PlatformAuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redact, setRedact] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const auditLogs = await base44.entities.SuperAdminAuditLog.list('-created_date', 100);
      setLogs(auditLogs);
    } catch (error) {
      console.error('Audit log load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = () => {
    const headers = ['Timestamp', 'Action', 'Target', 'User', 'Reason', 'Impersonating'];
    const rows = logs.map(log => [
      format(new Date(log.created_date), 'PPp'),
      log.action_type,
      `${log.target_type}:${log.target_id}`,
      log.user_id || '—',
      redact ? '***' : log.reason || '—',
      log.impersonating ? 'Yes' : 'No',
    ]);

    const csv = [headers, ...rows].map(r => r.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (loading) return <div className="p-6 space-y-4">{[1,2].map(i => <Skeleton key={i} className="h-12" />)}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Audit Log</h1>
          <p className="text-muted-foreground text-sm mt-1">All sensitive platform actions</p>
        </div>
        <Button onClick={exportCsv} size="sm" className="gap-1.5">
          <Download className="w-4 h-4" />
          Export {redact ? '(Redacted)' : '(Full)'}
        </Button>
      </div>

      {/* Redaction toggle */}
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <input
            type="checkbox"
            id="redact"
            checked={redact}
            onChange={e => setRedact(e.target.checked)}
            className="rounded border-border"
          />
          <label htmlFor="redact" className="text-sm cursor-pointer">
            Redact sensitive data (PII) in export
          </label>
        </CardContent>
      </Card>

      {/* Log table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  {['Timestamp', 'Action', 'Target', 'User', 'Reason', 'Impersonating'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="px-4 py-2.5 whitespace-nowrap">{format(new Date(log.created_date), 'PPp')}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant="outline" className="text-[10px] py-0">{log.action_type}</Badge>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[10px]">{log.target_type}:{log.target_id}</td>
                    <td className="px-4 py-2.5">{log.user_id || '—'}</td>
                    <td className="px-4 py-2.5 max-w-xs truncate text-muted-foreground">{log.reason || '—'}</td>
                    <td className="px-4 py-2.5">
                      {log.impersonating ? (
                        <Badge className="text-[10px] bg-warning/10 text-warning border-0 py-0">Impersonating</Badge>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="text-xs text-muted-foreground text-center">Logs are retained 7 years per compliance policy. Deletion not permitted.</p>
    </div>
  );
}