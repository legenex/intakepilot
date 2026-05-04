import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { STATUS_LABELS, VERTICAL_LABELS, SOURCE_LABELS, KANBAN_COLUMNS, normalizePhone } from '@/lib/leadUtils';
import { logActivity } from '@/hooks/useLeads';

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

function InlineField({ label, children }) {
  return (
    <div className="grid grid-cols-5 items-center gap-2 py-1.5 border-b border-border/40 last:border-0">
      <Label className="text-[10px] uppercase tracking-wide text-muted-foreground col-span-2">{label}</Label>
      <div className="col-span-3">{children}</div>
    </div>
  );
}

export default function LeadOverviewTab({ lead, canEdit, onRefresh, orgId, userLabel }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState({});

  const save = async (field, value) => {
    if (!canEdit) return;
    const old = lead[field];
    if (old === value) return;
    setSaving(s => ({ ...s, [field]: true }));
    let finalValue = value;
    if (field === 'phone') finalValue = normalizePhone(value);
    await base44.entities.Lead.update(lead.id, { [field]: finalValue });
    await logActivity({ organization_id: orgId, lead_id: lead.id, type: 'field_updated', payload: { field, from: old, to: finalValue, summary: `Updated ${field}` }, actor_label: userLabel || 'User' });
    toast({ title: 'Saved', description: field });
    setSaving(s => ({ ...s, [field]: false }));
    onRefresh();
  };

  const Field = ({ label, field, type = 'text' }) => {
    const [val, setVal] = useState(lead[field] ?? '');
    return (
      <InlineField label={label}>
        <input
          className="w-full text-xs bg-transparent border-0 border-b border-transparent hover:border-border focus:border-primary outline-none py-0.5 transition-colors"
          type={type}
          defaultValue={lead[field] ?? ''}
          disabled={!canEdit}
          onBlur={e => save(field, e.target.value)}
        />
      </InlineField>
    );
  };

  const SelectField = ({ label, field, options }) => (
    <InlineField label={label}>
      {canEdit ? (
        <Select defaultValue={lead[field] || ''} onValueChange={v => save(field, v)}>
          <SelectTrigger className="h-6 text-xs border-0 border-b border-transparent hover:border-border rounded-none px-0">
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(options).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      ) : (
        <span className="text-xs">{options[lead[field]] || lead[field] || '—'}</span>
      )}
    </InlineField>
  );

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Contact</p>
        <Field label="First Name" field="first_name" />
        <Field label="Last Name" field="last_name" />
        <Field label="Phone" field="phone" />
        <Field label="Email" field="email" type="email" />
        <InlineField label="State">
          {canEdit ? (
            <Select defaultValue={lead.state || ''} onValueChange={v => save('state', v)}>
              <SelectTrigger className="h-6 text-xs border-0 border-b border-transparent hover:border-border rounded-none px-0">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : <span className="text-xs">{lead.state || '—'}</span>}
        </InlineField>
        <Field label="ZIP" field="zip" />
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Classification</p>
        <SelectField label="Status" field="status" options={STATUS_LABELS} />
        <SelectField label="Vertical" field="vertical" options={VERTICAL_LABELS} />
        <SelectField label="Source" field="source" options={SOURCE_LABELS} />
        <Field label="Sub-status" field="substatus" />
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Incident</p>
        <Field label="Incident Date" field="incident_date" type="date" />
        <Field label="Description" field="incident_description" />
        <Field label="Injury" field="injury_description" />
        <InlineField label="Medical Treatment">
          <Select defaultValue={String(lead.medical_treatment ?? '')} onValueChange={v => save('medical_treatment', v === 'true')}>
            <SelectTrigger className="h-6 text-xs border-0 px-0"><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </InlineField>
        <Field label="At Fault Party" field="at_fault_party" />
        <InlineField label="Has Attorney">
          <Select defaultValue={String(lead.has_attorney ?? '')} onValueChange={v => save('has_attorney', v === 'true')}>
            <SelectTrigger className="h-6 text-xs border-0 px-0"><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </InlineField>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">PVQL & Sale</p>
        <Field label="PVQL Score" field="pvql_score" type="number" />
        <Field label="Sale Price ($)" field="sale_price" type="number" />
        <Field label="Buyer Feedback" field="buyer_feedback" />
      </div>
    </div>
  );
}