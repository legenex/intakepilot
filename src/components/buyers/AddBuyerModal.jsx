import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useOrg } from '@/lib/OrgContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { VERTICAL_LABELS } from '@/lib/leadUtils';
import { Loader2 } from 'lucide-react';

const DEFAULT_TEMPLATE = `{
  "first_name": "{{lead.first_name}}",
  "last_name": "{{lead.last_name}}",
  "phone": "{{lead.phone}}",
  "email": "{{lead.email}}",
  "state": "{{lead.state}}",
  "vertical": "{{lead.vertical}}",
  "pvql_score": "{{lead.pvql_score}}",
  "incident_date": "{{lead.incident_date}}",
  "injury": "{{lead.injury_description}}",
  "tcpa_consent_at": "{{lead.tcpa_consent_at}}"
}`;

export default function AddBuyerModal({ onClose, onSuccess, buyer: existing }) {
  const { currentOrg } = useOrg();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: existing?.name || '',
    contact_name: existing?.contact_name || '',
    contact_email: existing?.contact_email || '',
    contact_phone: existing?.contact_phone || '',
    verticals: existing?.verticals || [],
    states: existing?.states || [],
    daily_cap: existing?.daily_cap || 10,
    price_per_pvql: existing?.price_per_pvql || 0,
    price_per_retainer: existing?.price_per_retainer || 0,
    delivery_method: existing?.delivery_method || 'webhook',
    payment_terms: existing?.payment_terms || 'net_30',
    exclusivity: existing?.exclusivity || 'shared',
    active: existing?.active ?? true,
    delivery_config: existing?.delivery_config || { url: '', headers: {}, payload_template: DEFAULT_TEMPLATE },
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleVertical = (v) => {
    set('verticals', form.verticals.includes(v) ? form.verticals.filter(x => x !== v) : [...form.verticals, v]);
  };

  const testWebhook = async () => {
    if (!form.delivery_config.url) return;
    setTesting(true); setTestResult(null);
    try {
      const resp = await fetch(form.delivery_config.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...form.delivery_config.headers },
        body: JSON.stringify({ test: true, source: 'IntakePilot webhook test' }),
      });
      setTestResult({ ok: resp.ok, status: resp.status });
    } catch (e) {
      setTestResult({ ok: false, error: e.message });
    }
    setTesting(false);
  };

  const save = async () => {
    if (!form.name) { toast({ title: 'Name is required', variant: 'destructive' }); return; }
    setSaving(true);
    const data = { ...form, organization_id: currentOrg.id };
    if (existing) await base44.entities.Buyer.update(existing.id, data);
    else await base44.entities.Buyer.create(data);
    toast({ title: existing ? 'Buyer updated' : 'Buyer added' });
    setSaving(false);
    onSuccess();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">{existing ? 'Edit Buyer' : 'Add Buyer'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs mb-1 block">Buyer Name *</Label>
              <Input value={form.name} onChange={e => set('name', e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs mb-1 block">Contact Name</Label>
              <Input value={form.contact_name} onChange={e => set('contact_name', e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs mb-1 block">Contact Email</Label>
              <Input value={form.contact_email} onChange={e => set('contact_email', e.target.value)} className="h-8 text-xs" /></div>
            <div><Label className="text-xs mb-1 block">Contact Phone</Label>
              <Input value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} className="h-8 text-xs" /></div>
          </div>

          {/* Verticals */}
          <div>
            <Label className="text-xs mb-2 block">Verticals (leave empty = all)</Label>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(VERTICAL_LABELS).map(([k, v]) => (
                <button key={k} onClick={() => toggleVertical(k)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${form.verticals.includes(k) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-border/80'}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Cap & pricing */}
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-xs mb-1 block">Daily Cap</Label>
              <Input type="number" value={form.daily_cap} onChange={e => set('daily_cap', Number(e.target.value))} className="h-8 text-xs" /></div>
            <div><Label className="text-xs mb-1 block">Price/PVQL (cents)</Label>
              <Input type="number" value={form.price_per_pvql} onChange={e => set('price_per_pvql', Number(e.target.value))} className="h-8 text-xs" /></div>
            <div><Label className="text-xs mb-1 block">Price/Retainer (cents)</Label>
              <Input type="number" value={form.price_per_retainer} onChange={e => set('price_per_retainer', Number(e.target.value))} className="h-8 text-xs" /></div>
          </div>

          {/* Delivery */}
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs mb-1 block">Delivery Method</Label>
              <Select value={form.delivery_method} onValueChange={v => set('delivery_method', v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="live_transfer">Live Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs mb-1 block">Payment Terms</Label>
              <Select value={form.payment_terms} onValueChange={v => set('payment_terms', v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="prepaid">Prepaid</SelectItem>
                  <SelectItem value="net_7">Net 7</SelectItem>
                  <SelectItem value="net_15">Net 15</SelectItem>
                  <SelectItem value="net_30">Net 30</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.delivery_method === 'webhook' && (
            <div className="space-y-3 p-3 rounded-lg border border-border">
              <Label className="text-xs font-semibold">Webhook Config</Label>
              <div>
                <Label className="text-[10px] text-muted-foreground mb-1 block">Endpoint URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={form.delivery_config.url || ''}
                    onChange={e => set('delivery_config', { ...form.delivery_config, url: e.target.value })}
                    placeholder="https://..."
                    className="h-8 text-xs flex-1"
                  />
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={testWebhook} disabled={testing || !form.delivery_config.url}>
                    {testing ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Test'}
                  </Button>
                </div>
                {testResult && (
                  <p className={`text-[10px] mt-1 ${testResult.ok ? 'text-success' : 'text-destructive'}`}>
                    {testResult.ok ? `✓ HTTP ${testResult.status}` : `✗ ${testResult.error || `HTTP ${testResult.status}`}`}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground mb-1 block">Payload Template (Handlebars-style)</Label>
                <Textarea
                  value={form.delivery_config.payload_template || DEFAULT_TEMPLATE}
                  onChange={e => set('delivery_config', { ...form.delivery_config, payload_template: e.target.value })}
                  className="text-xs font-mono min-h-32 resize-none"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={save} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
              {existing ? 'Save Changes' : 'Add Buyer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}