import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, XCircle, PhoneMissed } from 'lucide-react';
import { getLeadName, STATUS_LABELS } from '@/lib/leadUtils';
import { formatDistanceToNow } from 'date-fns';

export default function NeedsAttentionPanel({ orgId }) {
  const [stuck, setStuck] = useState([]);
  const [failedDeliveries, setFailedDeliveries] = useState([]);
  const [noContact, setNoContact] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!orgId) return;
    const cutoff24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [leads, deliveries] = await Promise.all([
      base44.entities.Lead.filter({ organization_id: orgId, deleted_at: null }, '-updated_date', 200),
      base44.entities.LeadDelivery.filter({ organization_id: orgId, delivery_status: 'failed' }, '-created_date', 20),
    ]);

    const stuckLeads = leads.filter(l =>
      !['sold','disqualified','dnc'].includes(l.status) &&
      l.updated_date && l.updated_date < cutoff24h
    ).slice(0, 5);

    const noContactLeads = leads.filter(l =>
      l.buyer_feedback && /no.?contact|couldn.?t reach/i.test(l.buyer_feedback)
    ).slice(0, 5);

    const recentFailed = deliveries.filter(d => d.created_date >= cutoff24h).slice(0, 5);

    setStuck(stuckLeads);
    setFailedDeliveries(recentFailed);
    setNoContact(noContactLeads);
    setLoading(false);
  }, [orgId]);

  useEffect(() => { fetch(); }, [fetch]);

  const total = stuck.length + failedDeliveries.length + noContact.length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" /> Needs Attention
          {total > 0 && <Badge className="ml-auto text-[10px] bg-warning/10 text-warning border-0">{total}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        {loading ? (
          <p className="text-xs text-muted-foreground">Loading...</p>
        ) : total === 0 ? (
          <p className="text-xs text-muted-foreground py-2 text-center">All clear — nothing needs attention.</p>
        ) : (
          <div className="space-y-3">
            {stuck.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Stuck &gt;24h</p>
                <div className="space-y-1">
                  {stuck.map(l => (
                    <Link key={l.id} to={`/leads/${l.id}`} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted transition-colors">
                      <AlertTriangle className="w-3 h-3 text-warning flex-shrink-0" />
                      <span className="text-xs flex-1 truncate">{getLeadName(l)}</span>
                      <Badge variant="outline" className="text-[10px] py-0">{STATUS_LABELS[l.status]}</Badge>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">
                        {l.updated_date ? formatDistanceToNow(new Date(l.updated_date), { addSuffix: true }) : ''}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {failedDeliveries.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Failed Deliveries</p>
                <div className="space-y-1">
                  {failedDeliveries.map(d => (
                    <div key={d.id} className="flex items-center gap-2 p-1.5 rounded bg-destructive/5">
                      <XCircle className="w-3 h-3 text-destructive flex-shrink-0" />
                      <span className="text-xs flex-1 truncate">Lead delivery failed</span>
                      <span className="text-[10px] text-muted-foreground">{d.last_error?.slice(0,40) || 'Unknown error'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {noContact.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">No Contact (Buyer Feedback)</p>
                <div className="space-y-1">
                  {noContact.map(l => (
                    <Link key={l.id} to={`/leads/${l.id}`} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted transition-colors">
                      <PhoneMissed className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs flex-1 truncate">{getLeadName(l)}</span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-32">{l.buyer_feedback}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}