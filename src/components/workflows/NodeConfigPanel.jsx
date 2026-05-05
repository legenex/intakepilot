import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { getNodeSchema, LEAD_FIELDS, LEAD_STATUSES, US_STATES_LIST, TIMEZONES } from '@/lib/workflowNodeSchemas';
import { getNodeIcon } from '@/components/workflows/NodeIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// ── Field renderers ──────────────────────────────────────────────

function TextField({ field, value, onChange }) {
  return (
    <Input
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={field.label}
      className="h-8 text-xs"
    />
  );
}

function TextareaField({ field, value, onChange }) {
  return (
    <textarea
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={field.label}
      rows={3}
      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
    />
  );
}

function NumberField({ field, value, onChange }) {
  return (
    <Input
      type="number"
      value={value ?? ''}
      onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      placeholder="0"
      className="h-8 text-xs"
    />
  );
}

function SelectField({ field, value, onChange, options }) {
  return (
    <select
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      className="w-full h-8 rounded-md border border-input bg-transparent px-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
    >
      <option value="">— Select —</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function MultiSelectField({ field, value = [], onChange, options }) {
  const toggle = (opt) => {
    const cur = value || [];
    onChange(cur.includes(opt) ? cur.filter(v => v !== opt) : [...cur, opt]);
  };
  return (
    <div className="flex flex-wrap gap-1">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={cn(
            'px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors',
            (value || []).includes(opt)
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'bg-muted border-transparent text-muted-foreground hover:border-border'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function BooleanField({ field, value, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div
        className={cn(
          'w-8 h-4 rounded-full transition-colors relative',
          value ? 'bg-primary' : 'bg-muted'
        )}
        onClick={() => onChange(!value)}
      >
        <div
          className={cn(
            'absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all',
            value ? 'left-[18px]' : 'left-0.5'
          )}
        />
      </div>
      <span className="text-xs text-muted-foreground">{value ? 'Enabled' : 'Disabled'}</span>
    </label>
  );
}

function KeyValuePairsField({ value = [], onChange }) {
  const pairs = Array.isArray(value) ? value : [];
  const update = (idx, k, v) => {
    const next = [...pairs];
    next[idx] = { key: k, value: v };
    onChange(next);
  };
  const remove = (idx) => onChange(pairs.filter((_, i) => i !== idx));
  const add = () => onChange([...pairs, { key: '', value: '' }]);
  return (
    <div className="space-y-1.5">
      {pairs.map((p, i) => (
        <div key={i} className="flex gap-1.5 items-center">
          <Input value={p.key} onChange={e => update(i, e.target.value, p.value)} placeholder="Key" className="h-7 text-xs flex-1" />
          <Input value={p.value} onChange={e => update(i, p.key, e.target.value)} placeholder="Value" className="h-7 text-xs flex-1" />
          <button onClick={() => remove(i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
        </div>
      ))}
      <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 px-2" onClick={add}>
        <Plus className="w-3 h-3" /> Add
      </Button>
    </div>
  );
}

function BranchListField({ value = [], onChange }) {
  const branches = Array.isArray(value) ? value : [];
  const update = (idx, field, v) => {
    const next = [...branches];
    next[idx] = { ...next[idx], [field]: v };
    onChange(next);
  };
  const remove = (idx) => onChange(branches.filter((_, i) => i !== idx));
  const add = () => onChange([...branches, { name: '', condition: '' }]);
  return (
    <div className="space-y-2">
      {branches.map((b, i) => (
        <div key={i} className="p-2 rounded-md border border-border space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-muted-foreground">Branch {i + 1}</span>
            <button onClick={() => remove(i)}><Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" /></button>
          </div>
          <Input value={b.name} onChange={e => update(i, 'name', e.target.value)} placeholder="Branch name" className="h-7 text-xs" />
          <Input value={b.condition} onChange={e => update(i, 'condition', e.target.value)} placeholder="Condition expression" className="h-7 text-xs" />
        </div>
      ))}
      <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 px-2" onClick={add}>
        <Plus className="w-3 h-3" /> Add Branch
      </Button>
    </div>
  );
}

function renderField(field, value, onChange) {
  switch (field.type) {
    case 'text':
    case 'template_text':
    case 'cron':
      return <TextField field={field} value={value} onChange={onChange} />;
    case 'textarea':
    case 'json':
      return <TextareaField field={field} value={value} onChange={onChange} />;
    case 'number':
    case 'duration':
      return <NumberField field={field} value={value} onChange={onChange} />;
    case 'select':
      return <SelectField field={field} value={value} onChange={onChange} options={field.options || []} />;
    case 'dropdown_lead_field':
      return <SelectField field={field} value={value} onChange={onChange} options={LEAD_FIELDS} />;
    case 'dropdown_status':
      return <SelectField field={field} value={value} onChange={onChange} options={LEAD_STATUSES} />;
    case 'dropdown_agent':
      return <TextField field={field} value={value} onChange={onChange} />;
    case 'dropdown_buyer':
      return <TextField field={field} value={value} onChange={onChange} />;
    case 'multiselect':
      return <MultiSelectField field={field} value={value} onChange={onChange} options={field.options || []} />;
    case 'multiselect_states':
      return <MultiSelectField field={field} value={value} onChange={onChange} options={US_STATES_LIST} />;
    case 'boolean':
      return <BooleanField field={field} value={value} onChange={onChange} />;
    case 'key_value_pairs':
      return <KeyValuePairsField value={value} onChange={onChange} />;
    case 'branch_list':
      return <BranchListField value={value} onChange={onChange} />;
    default:
      return <TextField field={field} value={value} onChange={onChange} />;
  }
}

// ── Main panel ───────────────────────────────────────────────────

export default function NodeConfigPanel({ node, onClose, onUpdate }) {
  const schema = getNodeSchema(node.type);
  const [data, setData] = useState(node.data || {});

  useEffect(() => {
    setData(node.data || {});
  }, [node.id]);

  if (!schema) return null;

  const Icon = getNodeIcon(schema.icon);

  const handleChange = (key, value) => {
    const next = { ...data, [key]: value };
    setData(next);
    onUpdate(node.id, next);
  };

  return (
    <div className="w-[360px] shrink-0 border-l border-border bg-card flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: schema.color + '22', color: schema.color }}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{schema.label}</p>
          <p className="text-[10px] text-muted-foreground">{schema.description}</p>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {schema.fields.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">No configuration required for this node.</p>
        )}
        {schema.fields.map(field => (
          <div key={field.key} className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1">
              {field.label}
              {field.required && <span className="text-destructive">*</span>}
            </Label>
            {renderField(field, data[field.key], (val) => handleChange(field.key, val))}
          </div>
        ))}
      </div>

      {/* Output handles info */}
      {schema.outputs && schema.outputs.length > 1 && (
        <div className="px-4 py-3 border-t border-border">
          <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">Output Handles</p>
          <div className="flex flex-wrap gap-1">
            {schema.outputs.map(out => (
              <span key={out} className="px-2 py-0.5 rounded-full text-[10px] bg-muted text-muted-foreground">{out}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}