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
import { Loader2, Plus, Trash2, GripVertical } from 'lucide-react';
import { VERTICAL_LABELS, STATUS_LABELS } from '@/lib/leadUtils';

const TRIGGER_LABELS = {
  immediate: 'Immediately on trigger',
  scheduled: 'At scheduled time',
  status_change: 'On status change',
  no_contact: 'No contact after 24h',
};

export default function SMSCampaignModal({ campaign: existing, onClose, onSuccess }) {
  const { currentOrg } = useOrg();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: existing?.name || '',
    status: existing?.status || 'draft',
    trigger_type: existing?.trigger_type || 'immediate',
    target_statuses: existing?.target_statuses || ['new'],
    target_verticals: existing?.target_verticals || [],
    from_number: existing?.from_number || '',
    sequence: existing?.sequence || [
      { step: 1, delay_hours: 0, message: 'Hi {{first_name}}, this is the legal team reaching out about your {{vertical}} case inquiry. Do you have a minute to discuss your options? Reply YES to proceed or STOP to opt out.', stop_on_reply: true },
      { step: 2, delay_hours: 24, message: 'Hi {{first_name}}, just following up on your case. Many people in similar situations have received significant compensation. Would you like a free case review? Reply YES or call us back.', stop_on_reply: true },
      { step: 3, delay_hours: 72, message: 'Last outreach {{first_name}} — our attorneys are still available to review your {{vertical}} case at no cost. Reply CASE to connect with a specialist.', stop_on_reply: true },
    ],
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleArr = (k, v) => set(k, form[k].includes(v) ? form[k].filter(x => x !== v) : [...form[k], v]);

  const addStep = () => {
    const lastDelay = form.sequence.length > 0 ? form.sequence[form.sequence.length - 1].delay_hours : 0;
    set('sequence', [...form.sequence, {
      step: form.sequence.length + 1,
      delay_hours: lastDelay + 24,
      message: '',
      stop_on_reply: true,
    }]);
  };

  const removeStep = (idx) => {
    const updated = form.sequence.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step: i + 1 }));
    set('sequence', updated);
  };

  const updateStep = (idx, k, v) => {
    const updated = form.sequence.map((s, i) => i === idx ? { ...s, [k]: v } : s);
    set('sequence', updated);
  };

  const save = async () => {
    if (!form.name) { toast({ title: 'Name is required', variant: 'destructive' }); return; }
    if (form.sequence.length === 0) { toast({ title: 'Add at least one step', variant: 'destructive' }); return; }
    setSaving(true);
    const data = { ...form, organization_id: currentOrg.id };
    if (existing) await base44.entities.SMSCampaign.update(existing.id, data);
    else await base44.entities.SMSCampaign.create(data);
    toast({ title: existing ? 'Campaign updated' : 'Campaign created' });
    setSaving(false);
    onSuccess();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">{existing ? 'Edit Campaign' : 'New SMS Campaign'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          {/* Basic */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">Campaign Name *</Label>
              <Input value={form.name} onChange={e => set('name', e.target.value)} className="h-8 text-xs" placeholder="e.g. MVA 3-step nurture" />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Trigger Type</Label>
              <Select value={form.trigger_type} onValueChange={v => set('trigger_type', v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TRIGGER_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">From Number</Label>
              <Input value={form.from_number} onChange={e => set('from_number', e.target.value)} className="h-8 text-xs" placeholder="+15551234567" />
            </div>
          </div>

          {/* Target statuses */}
          <div>
            <Label className="text-xs mb-2 block">Target Lead Statuses</Label>
            <div className="flex flex-wrap gap-1.5">
              {['new', 'engaged_sms', 'no_contact', 'qualified_sms', 'phone_verified'].map(s => (
                <button key={s} type="button" onClick={() => toggleArr('target_statuses', s)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${form.target_statuses.includes(s) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                  {STATUS_LABELS[s] || s}
                </button>
              ))}
            </div>
          </div>

          {/* Target verticals */}
          <div>
            <Label className="text-xs mb-2 block">Target Verticals (empty = all)</Label>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(VERTICAL_LABELS).map(([k, v]) => (
                <button key={k} type="button" onClick={() => toggleArr('target_verticals', k)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${form.target_verticals.includes(k) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Sequence builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-semibold">Message Sequence</Label>
              <Button type="button" size="sm" variant="outline" className="h-6 text-xs gap-1" onClick={addStep}>
                <Plus className="w-3 h-3" /> Add Step
              </Button>
            </div>
            <div className="space-y-3">
              {form.sequence.map((step, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-semibold">Step {step.step}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {step.delay_hours === 0 ? 'Immediately' : `After ${step.delay_hours}h`}
                      </span>
                    </div>
                    <Button type="button" size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => removeStep(idx)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-[10px] text-muted-foreground w-20 flex-shrink-0">Delay (hours)</Label>
                    <Input type="number" value={step.delay_hours} onChange={e => updateStep(idx, 'delay_hours', Number(e.target.value))} className="h-7 text-xs w-20" min={0} />
                    <Label className="text-[10px] text-muted-foreground ml-2 flex-shrink-0">Stop on reply</Label>
                    <input type="checkbox" checked={step.stop_on_reply} onChange={e => updateStep(idx, 'stop_on_reply', e.target.checked)} className="ml-1" />
                  </div>
                  <Textarea
                    value={step.message}
                    onChange={e => updateStep(idx, 'message', e.target.value)}
                    className="text-xs min-h-16 resize-none"
                    placeholder="Message body... Use {{first_name}}, {{vertical}}, {{state}}"
                  />
                  <p className="text-[10px] text-muted-foreground">{step.message.length}/160 chars{step.message.length > 160 ? ' (multi-part)' : ''}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={save} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
              {existing ? 'Save Changes' : 'Create Campaign'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}