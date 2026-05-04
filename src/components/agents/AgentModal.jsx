import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useOrg } from '@/lib/OrgContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { VERTICAL_LABELS, STATUS_LABELS } from '@/lib/leadUtils';

const DEFAULT_SYSTEM_PROMPT = `You are a friendly intake specialist for a personal injury law firm. Your job is to qualify leads by asking about their accident, injuries, and legal situation. Be empathetic and professional. Collect: accident date, type of accident, injuries sustained, medical treatment sought, fault determination, whether they have an attorney. After qualification, determine if they are a PVQL (phone-verified, qualified lead) based on: recent accident, real injuries, received medical treatment, no prior attorney.`;

const DEFAULT_GREETING = `Hi, this is Alex calling on behalf of our legal intake team. I'm reaching out because you recently submitted information about a potential legal case. Do you have a moment to speak about your situation?`;

export default function AgentModal({ agent: existing, onClose, onSuccess }) {
  const { currentOrg } = useOrg();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: existing?.name || '',
    type: existing?.type || 'voice_outbound',
    status: existing?.status || 'draft',
    voice_provider: existing?.voice_provider || 'vapi',
    phone_number: existing?.phone_number || '',
    voice_id: existing?.voice_id || '',
    system_prompt: existing?.system_prompt || DEFAULT_SYSTEM_PROMPT,
    greeting_message: existing?.greeting_message || DEFAULT_GREETING,
    verticals: existing?.verticals || [],
    trigger_statuses: existing?.trigger_statuses || ['new'],
    max_call_attempts: existing?.max_call_attempts ?? 3,
    max_sms_attempts: existing?.max_sms_attempts ?? 5,
    retry_interval_minutes: existing?.retry_interval_minutes ?? 60,
    calling_hours_start: existing?.calling_hours_start || '09:00',
    calling_hours_end: existing?.calling_hours_end || '20:00',
    sms_template_initial: existing?.sms_template_initial || 'Hi {{first_name}}, this is the legal intake team. We received your inquiry about your {{vertical}} case. Can we take a few minutes to discuss? Reply YES to proceed.',
    sms_template_followup: existing?.sms_template_followup || 'Hi {{first_name}}, just following up on your case inquiry. Do you have a moment to chat about your legal options?',
    sms_template_qualified: existing?.sms_template_qualified || 'Great news {{first_name}}! Based on what you\'ve shared, you may have a strong case. An attorney will be in touch shortly.',
    transfer_phone_number: existing?.transfer_phone_number || '',
    qualification_questions: existing?.qualification_questions || [
      { id: 1, question: 'When did the accident occur?', field: 'incident_date', required: true },
      { id: 2, question: 'What type of accident was it?', field: 'incident_description', required: true },
      { id: 3, question: 'What injuries did you sustain?', field: 'injury_description', required: true },
      { id: 4, question: 'Have you received medical treatment?', field: 'medical_treatment', required: true },
      { id: 5, question: 'Do you currently have an attorney?', field: 'has_attorney', required: true },
    ],
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleArr = (k, v) => set(k, form[k].includes(v) ? form[k].filter(x => x !== v) : [...form[k], v]);

  const addQuestion = () => {
    const newQ = { id: Date.now(), question: '', field: 'custom_fields.q', required: false };
    set('qualification_questions', [...form.qualification_questions, newQ]);
  };
  const removeQuestion = (id) => set('qualification_questions', form.qualification_questions.filter(q => q.id !== id));
  const updateQuestion = (id, k, v) => set('qualification_questions', form.qualification_questions.map(q => q.id === id ? { ...q, [k]: v } : q));

  const save = async () => {
    if (!form.name) { toast({ title: 'Name is required', variant: 'destructive' }); return; }
    setSaving(true);
    const data = { ...form, organization_id: currentOrg.id };
    if (existing) await base44.entities.AIAgent.update(existing.id, data);
    else await base44.entities.AIAgent.create(data);
    toast({ title: existing ? 'Agent updated' : 'Agent created' });
    setSaving(false);
    onSuccess();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">{existing ? 'Edit Agent' : 'Create AI Agent'}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="general" className="mt-2">
          <TabsList className="h-8 text-xs">
            <TabsTrigger value="general" className="text-xs h-7">General</TabsTrigger>
            <TabsTrigger value="voice" className="text-xs h-7">Voice & SMS</TabsTrigger>
            <TabsTrigger value="qualification" className="text-xs h-7">Qualification</TabsTrigger>
            <TabsTrigger value="schedule" className="text-xs h-7">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Agent Name *</Label>
                <Input value={form.name} onChange={e => set('name', e.target.value)} className="h-8 text-xs" placeholder="e.g. MVA Outbound Qualifier" />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Type</Label>
                <Select value={form.type} onValueChange={v => set('type', v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="voice_outbound">Voice Outbound</SelectItem>
                    <SelectItem value="voice_inbound">Voice Inbound</SelectItem>
                    <SelectItem value="sms_outbound">SMS Outbound</SelectItem>
                    <SelectItem value="sms_inbound">SMS Inbound</SelectItem>
                    <SelectItem value="warm_transfer">Warm Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs mb-2 block">Target Verticals (empty = all)</Label>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(VERTICAL_LABELS).map(([k, v]) => (
                  <button key={k} type="button" onClick={() => toggleArr('verticals', k)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${form.verticals.includes(k) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs mb-2 block">Trigger on Lead Status</Label>
              <div className="flex flex-wrap gap-1.5">
                {['new', 'engaged_sms', 'no_contact', 'qualified_sms'].map(s => (
                  <button key={s} type="button" onClick={() => toggleArr('trigger_statuses', s)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${form.trigger_statuses.includes(s) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                    {STATUS_LABELS[s] || s}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="voice" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Voice Provider</Label>
                <Select value={form.voice_provider} onValueChange={v => set('voice_provider', v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vapi">Vapi</SelectItem>
                    <SelectItem value="bland">Bland AI</SelectItem>
                    <SelectItem value="retell">Retell AI</SelectItem>
                    <SelectItem value="twilio">Twilio (custom)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1 block">Outbound Phone Number</Label>
                <Input value={form.phone_number} onChange={e => set('phone_number', e.target.value)} className="h-8 text-xs" placeholder="+15551234567" />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Voice ID</Label>
                <Input value={form.voice_id} onChange={e => set('voice_id', e.target.value)} className="h-8 text-xs" placeholder="Provider voice ID" />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Transfer to Number</Label>
                <Input value={form.transfer_phone_number} onChange={e => set('transfer_phone_number', e.target.value)} className="h-8 text-xs" placeholder="+15559876543" />
              </div>
            </div>

            <div>
              <Label className="text-xs mb-1 block">Greeting Message</Label>
              <Textarea value={form.greeting_message} onChange={e => set('greeting_message', e.target.value)} className="text-xs min-h-16 resize-none" />
            </div>

            <div>
              <Label className="text-xs mb-1 block">System Prompt</Label>
              <Textarea value={form.system_prompt} onChange={e => set('system_prompt', e.target.value)} className="text-xs font-mono min-h-28 resize-none" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold block">SMS Templates</Label>
              {[
                { key: 'sms_template_initial', label: 'Initial Outreach' },
                { key: 'sms_template_followup', label: 'Follow-up' },
                { key: 'sms_template_qualified', label: 'Qualified' },
              ].map(t => (
                <div key={t.key}>
                  <Label className="text-[10px] text-muted-foreground mb-0.5 block">{t.label}</Label>
                  <Textarea
                    value={form[t.key]}
                    onChange={e => set(t.key, e.target.value)}
                    className="text-xs min-h-12 resize-none"
                    placeholder="Use {{first_name}}, {{vertical}}, etc."
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="qualification" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Qualification Questions</Label>
                <Button type="button" size="sm" variant="outline" className="h-6 text-xs gap-1" onClick={addQuestion}>
                  <Plus className="w-3 h-3" /> Add
                </Button>
              </div>
              {form.qualification_questions.map((q, idx) => (
                <div key={q.id} className="flex gap-2 items-start p-2.5 rounded-lg border border-border">
                  <span className="text-xs text-muted-foreground w-5 flex-shrink-0 mt-1.5">{idx + 1}.</span>
                  <div className="flex-1 space-y-1.5">
                    <Input value={q.question} onChange={e => updateQuestion(q.id, 'question', e.target.value)} className="h-7 text-xs" placeholder="Question text..." />
                    <Input value={q.field} onChange={e => updateQuestion(q.id, 'field', e.target.value)} className="h-7 text-xs font-mono" placeholder="lead field (e.g. injury_description)" />
                  </div>
                  <Button type="button" size="icon" variant="ghost" className="h-7 w-7 flex-shrink-0 text-destructive hover:text-destructive" onClick={() => removeQuestion(q.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Max Call Attempts</Label>
                <Input type="number" value={form.max_call_attempts} onChange={e => set('max_call_attempts', Number(e.target.value))} className="h-8 text-xs" min={1} max={10} />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Max SMS Attempts</Label>
                <Input type="number" value={form.max_sms_attempts} onChange={e => set('max_sms_attempts', Number(e.target.value))} className="h-8 text-xs" min={1} max={20} />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Retry Interval (minutes)</Label>
                <Input type="number" value={form.retry_interval_minutes} onChange={e => set('retry_interval_minutes', Number(e.target.value))} className="h-8 text-xs" min={15} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs mb-1 block">Call Hours Start</Label>
                  <Input type="time" value={form.calling_hours_start} onChange={e => set('calling_hours_start', e.target.value)} className="h-8 text-xs" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">End</Label>
                  <Input type="time" value={form.calling_hours_end} onChange={e => set('calling_hours_end', e.target.value)} className="h-8 text-xs" />
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">TCPA Compliance</p>
              <p>Calling hours enforce FCC TCPA regulations. Calls are only placed between {form.calling_hours_start} – {form.calling_hours_end} in the lead's local timezone. All leads must have documented TCPA consent before being called.</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-2 border-t border-border mt-4">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={save} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
            {existing ? 'Save Changes' : 'Create Agent'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}