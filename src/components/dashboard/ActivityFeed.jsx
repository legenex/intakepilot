import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

const TYPE_COLORS = {
  status_changed: 'text-primary',
  delivery_sent: 'text-success',
  delivery_response: 'text-blue-400',
  note_added: 'text-muted-foreground',
  import: 'text-violet-400',
  field_updated: 'text-muted-foreground',
  document_uploaded: 'text-warning',
  default: 'text-muted-foreground',
};

const TYPE_LABELS = {
  status_changed: 'Status',
  delivery_sent: 'Delivered',
  delivery_response: 'Response',
  note_added: 'Note',
  import: 'Import',
  field_updated: 'Updated',
  document_uploaded: 'Document',
};

export default function ActivityFeed({ orgId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!orgId) return;
    const results = await base44.entities.LeadActivity.filter(
      { organization_id: orgId }, '-created_date', 20
    );
    setActivities(results);
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 15000);
    return () => clearInterval(interval);
  }, [fetch]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> Live Activity
          <span className="ml-auto w-2 h-2 rounded-full bg-success animate-pulse" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pb-4 max-h-72 overflow-y-auto">
        {loading ? Array.from({length:5}).map((_,i) => (
          <div key={i} className="flex gap-2 py-1.5">
            <Skeleton className="w-14 h-4" /><Skeleton className="flex-1 h-4" />
          </div>
        )) : activities.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">No activity yet</p>
        ) : (
          <AnimatePresence initial={false}>
            {activities.map(a => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2 py-1.5 border-b border-border/40 last:border-0"
              >
                <Badge variant="outline" className={`text-[10px] px-1 py-0 flex-shrink-0 ${TYPE_COLORS[a.type] || TYPE_COLORS.default}`}>
                  {TYPE_LABELS[a.type] || a.type}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground/80 truncate">
                    {a.actor_label || 'System'}
                    {a.payload?.summary ? ` — ${a.payload.summary}` : ''}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {a.created_date ? formatDistanceToNow(new Date(a.created_date), { addSuffix: true }) : ''}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}