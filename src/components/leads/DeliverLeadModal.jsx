import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useEligibleBuyers } from '@/hooks/useBuyers';
import { logActivity } from '@/hooks/useLeads';
import { formatCents, VERTICAL_LABELS } from '@/lib/leadUtils';
import { Star, Send, AlertTriangle } from 'lucide-react';

function renderTemplate(template, lead) {
  if (!template) return JSON.stringify(lead, null, 2);
  return template.replace(/\{\{lead\.([^}]+)\}\}/g, (_, path) => {
    const parts = path.split('.');
    let val = lead;
    for (const p of parts) val = val?.[p];
    return val ?? '';
  });
}

export default function DeliverLeadModal({ lead, orgId, onClose, onSuccess, userLabel }) {
  const { toast } = useToast();
  const eligibleBuyers = useEligibleBuyers(lead);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [delivering, setDelivering] = useState(false);

  const deliver = async () => {
    if (!selectedBuyer) return;
    setDelivering(true);

    const buyer = selectedBuyer;
    let deliveryStatus = 'sent';
    let deliveryResponse = null;
    let lastError = null;
    let payout = buyer.price_per_pvql || 0;

    const payload = buyer.delivery_config?.payload_template
      ? renderTemplate(buyer.delivery_config.payload_template, lead)
      : JSON.stringify({
          first_name: lead.first_name, last_name: lead.last_name, phone: lead.phone,
          email: lead.email, state: lead.state, vertical: lead.vertical,
          pvql_score: lead.pvql_score, source: lead.source,
          incident_date: lead.incident_date, injury_description: lead.injury_description,
          tcpa_consent_at: lead.tcpa_consent_at,
        });

    if (buyer.delivery_method === 'webhook' && buyer.delivery_config?.url) {
      try {
        const headers = { 'Content-Type': 'application/json', ...(buyer.delivery_config.headers || {}) };
        const resp = await fetch(buyer.delivery_config.url, {
          method: 'POST', headers, body: payload,
        });
        deliveryResponse = { status: resp.status, ok: resp.ok };
        deliveryStatus = resp.ok ? 'accepted' : 'rejected';
      } catch (e) {
        deliveryStatus = 'failed';
        lastError = e.message;
      }
    } else if (buyer.delivery_method === 'email') {
      await base44.integrations.Core.SendEmail({
        to: buyer.contact_email,
        subject: `New Lead: ${lead.first_name} ${lead.last_name}`,
        body: payload,
      });
      deliveryStatus = 'sent';
    } else if (buyer.delivery_method === 'sms') {
      toast({ title: 'SMS delivery not yet active', variant: 'destructive' });
      setDelivering(false);
      return;
    } else if (buyer.delivery_method === 'live_transfer') {
      toast({ title: 'Live transfer requires voice agent — coming soon', variant: 'destructive' });
      setDelivering(false);
      return;
    }

    await base44.entities.LeadDelivery.create({
      organization_id: orgId, lead_id: lead.id, buyer_id: buyer.id,
      delivered_at: new Date().toISOString(), delivery_status: deliveryStatus,
      payout, delivery_payload: JSON.parse(payload || '{}'),
      delivery_response: deliveryResponse, last_error: lastError,
    });

    await base44.entities.Lead.update(lead.id, {
      assigned_buyer_id: buyer.id,
      status: deliveryStatus === 'accepted' ? 'sold' : lead.status,
      sold_at: deliveryStatus === 'accepted' ? new Date().toISOString() : undefined,
    });

    await base44.entities.Buyer.update(buyer.id, {
      current_day_count: (buyer.current_day_count || 0) + 1,
      total_delivered: (buyer.total_delivered || 0) + 1,
      last_delivery_at: new Date().toISOString(),
    });

    await logActivity({
      organization_id: orgId, lead_id: lead.id, type: 'delivery_sent',
      payload: { buyer: buyer.name, method: buyer.delivery_method, status: deliveryStatus, summary: `Delivered to ${buyer.name} via ${buyer.delivery_method}` },
      actor_label: userLabel || 'User',
    });

    toast({ title: deliveryStatus === 'accepted' ? `✓ Accepted by ${buyer.name}` : `Sent to ${buyer.name} (${deliveryStatus})` });
    setDelivering(false);
    onSuccess();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Send to Buyer</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-muted/40 text-xs">
            <span className="text-muted-foreground">Lead: </span>
            <span className="font-medium">{lead.first_name} {lead.last_name} · {VERTICAL_LABELS[lead.vertical] || lead.vertical}</span>
          </div>

          {eligibleBuyers.length === 0 ? (
            <div className="flex items-center gap-2 p-3 rounded-lg border border-warning/30 bg-warning/5">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <p className="text-xs text-muted-foreground">No eligible buyers match this lead's vertical, state, and cap availability.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">{eligibleBuyers.length} eligible buyer(s)</p>
              {eligibleBuyers.map((b, i) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBuyer(b)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${selectedBuyer?.id === b.id ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <p className="text-xs font-semibold flex items-center gap-1">
                        {b.name}
                        {i === 0 && <Badge className="text-[10px] bg-primary/10 text-primary border-0 px-1 py-0">Best match</Badge>}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {b.delivery_method} · {b.current_day_count}/{b.daily_cap} today
                      </p>
                    </div>
                    <span className="text-xs font-mono font-semibold text-success">{formatCents(b.price_per_pvql)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedBuyer && (
            <Button
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={deliver}
              disabled={delivering}
            >
              <Send className="w-4 h-4" />
              {delivering ? 'Delivering...' : `Send to ${selectedBuyer.name}`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}