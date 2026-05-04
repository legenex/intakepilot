import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useOrg } from '@/lib/OrgContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Database, Upload, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TYPE_ICONS = { csv_upload: Upload, bigquery: Database, postgres: Database, google_sheets: Database, api: Database };
const TYPE_LABELS = { csv_upload: 'CSV Upload', bigquery: 'BigQuery', postgres: 'Postgres', google_sheets: 'Google Sheets', api: 'API/Webhook' };

export default function DataSources() {
  const { currentOrg } = useOrg();
  const navigate = useNavigate();
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentOrg) return;
    base44.entities.DataSource.filter({ organization_id: currentOrg.id }, '-created_date')
      .then(setSources).finally(() => setLoading(false));
  }, [currentOrg]);

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Data Sources</h1>
          <p className="text-sm text-muted-foreground">Connect external data to import leads</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => navigate('/leads/import')}>
            <Upload className="w-3.5 h-3.5" /> CSV Upload
          </Button>
          <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs">
            <Plus className="w-3.5 h-3.5" /> Add Source
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({length:3}).map((_,i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : sources.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Database className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium">No data sources configured</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Connect BigQuery, Postgres, or use CSV uploads to import leads</p>
          <div className="flex gap-2 justify-center">
            <Button size="sm" variant="outline" onClick={() => navigate('/leads/import')} className="gap-1.5">
              <Upload className="w-4 h-4" /> Upload CSV
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sources.map(s => {
            const Icon = TYPE_ICONS[s.type] || Database;
            return (
              <Card key={s.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{s.name}</p>
                      <Badge variant="outline" className="text-[10px] py-0">{TYPE_LABELS[s.type]}</Badge>
                      <Badge className={`text-[10px] border-0 ${s.active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {s.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s.last_sync_at ? `Last sync: ${formatDistanceToNow(new Date(s.last_sync_at), {addSuffix:true})} · ${s.last_sync_row_count || 0} rows` : 'Never synced'}
                      {s.last_sync_error && <span className="text-destructive/80 ml-2">· Error: {s.last_sync_error.slice(0,40)}</span>}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 gap-1 text-xs">
                    <RefreshCw className="w-3 h-3" /> Sync
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}