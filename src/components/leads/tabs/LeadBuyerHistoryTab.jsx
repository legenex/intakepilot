import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCents } from '@/lib/leadUtils';
import { formatDistanceToNow } from 'date-fns';

const STATUS_COLORS = {
  pending: 'text-muted-foreground',
  sent: 'text-blue-400',
  accepted: 'text-success',
  rejected: 'text-destructive',
  refunded: 'text-warning',
  failed: 'text-destructive',
};

export default function LeadBuyerHistoryTab({ leadId, orgId }) {
  const [deliveries, setDeliveries] = useState([]);
  const [buyers, setBuyers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.LeadDelivery.filter({ lead_id: leadId, organization_id: orgId }, '-created_date'),
      base44.entities.Buyer.filter({ organization_id: orgId }),
    ]).then(([dels, bys]) => {
      setDeliveries(dels);
      const map = {};
      bys.forEach(b => { map[b.id] = b; });
      setBuyers(map);
      setLoading(false);
    });
  }, [leadId, orgId]);

  if (loading) return <Skeleton className="h-24 w-full" />;

  if (deliveries.length === 0) return (
    <p className="text-sm text-muted-foreground text-center py-8">No delivery history</p>
  );

  return (
    <div className="space-y-2">
      {deliveries.map(d => (
        <div key={d.id} className="p-3 rounded-lg border border-border space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold">{buyers[d.buyer_id]?.name || 'Unknown Buyer'}</p>
            <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[d.delivery_status]}`}>
              {d.delivery_status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
            {d.payout ? <span className="text-success font-mono">{formatCents(d.payout)}</span> : null}
            {d.reject_reason && <span className="text-destructive/80">{d.reject_reason}</span>}
            <span className="ml-auto">
              {d.created_date ? formatDistanceToNow(new Date(d.created_date), { addSuffix: true }) : ''}
            </span>
          </div>
          {d.last_error && <p className="text-[10px] text-destructive/80 bg-destructive/5 px-2 py-1 rounded">{d.last_error}</p>}
        </div>
      ))}
    </div>
  );
}