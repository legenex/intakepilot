import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeadActivity } from '@/hooks/useLeads';
import { formatDistanceToNow } from 'date-fns';

const TYPE_ICONS = {
  status_changed: '🔄',
  field_updated: '✏️',
  delivery_sent: '📤',
  delivery_response: '📩',
  note_added: '📝',
  import: '📥',
  document_uploaded: '📎',
  webhook_fired: '🔗',
};

export default function LeadActivityTab({ leadId, orgId }) {
  const { activities, loading } = useLeadActivity(leadId, orgId);

  if (loading) return (
    <div className="space-y-3">
      {Array.from({length:5}).map((_,i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
    </div>
  );

  if (activities.length === 0) return (
    <p className="text-sm text-muted-foreground text-center py-8">No activity recorded yet</p>
  );

  return (
    <div className="space-y-2">
      {activities.map(a => (
        <div key={a.id} className="flex gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors">
          <span className="text-base flex-shrink-0">{TYPE_ICONS[a.type] || '•'}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] py-0 px-1">{a.type.replace(/_/g, ' ')}</Badge>
              <span className="text-xs text-muted-foreground">{a.actor_label || 'System'}</span>
            </div>
            {a.payload?.summary && <p className="text-xs mt-0.5">{a.payload.summary}</p>}
            {a.payload?.from !== undefined && a.payload?.to !== undefined && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                <span className="text-destructive/80">{String(a.payload.from)}</span>
                {' → '}
                <span className="text-success/80">{String(a.payload.to)}</span>
              </p>
            )}
            <p className="text-[10px] text-muted-foreground mt-1">
              {a.created_date ? formatDistanceToNow(new Date(a.created_date), { addSuffix: true }) : ''}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}