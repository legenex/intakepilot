// Phone normalization to E.164
export function normalizePhone(raw) {
  if (!raw) return raw;
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits[0] === '1') return `+${digits}`;
  if (digits.length > 7) return `+${digits}`;
  return raw;
}

export const STATUS_LABELS = {
  new: 'New',
  engaged_sms: 'Engaged SMS',
  qualified_sms: 'Qualified SMS',
  phone_verified: 'Phone Verified',
  pvql: 'PVQL',
  retainer_signed: 'Retainer Signed',
  sold: 'Sold',
  disqualified: 'Disqualified',
  dnc: 'DNC',
};

export const STATUS_COLORS = {
  new: 'bg-muted text-muted-foreground',
  engaged_sms: 'bg-blue-500/10 text-blue-400',
  qualified_sms: 'bg-cyan-500/10 text-cyan-400',
  phone_verified: 'bg-primary/10 text-primary',
  pvql: 'bg-violet-500/10 text-violet-400',
  retainer_signed: 'bg-success/10 text-success',
  sold: 'bg-success/20 text-success',
  disqualified: 'bg-destructive/10 text-destructive',
  dnc: 'bg-destructive/20 text-destructive',
};

export const VERTICAL_LABELS = {
  auto_mva: 'Auto/MVA',
  slip_fall: 'Slip & Fall',
  medmal: 'Med Mal',
  workers_comp: "Workers' Comp",
  dog_bite: 'Dog Bite',
  mass_tort: 'Mass Tort',
  other: 'Other',
};

export const SOURCE_LABELS = {
  raw_form: 'Raw Form',
  dq: 'Disqualified',
  unsold: 'Unsold',
  returned: 'Returned',
  no_contact: 'No Contact',
  manual_import: 'Manual Import',
  bigquery_sync: 'BigQuery Sync',
  api: 'API',
};

export const KANBAN_COLUMNS = [
  'new', 'engaged_sms', 'qualified_sms', 'phone_verified', 'pvql', 'retainer_signed', 'sold', 'disqualified', 'dnc'
];

export const PIPELINE_STAGES = ['new', 'qualified_sms', 'phone_verified', 'pvql', 'retainer_signed', 'sold'];

export function formatCents(cents) {
  if (!cents) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export function formatDelta(delta) {
  if (delta === null || delta === undefined) return null;
  const sign = delta >= 0 ? '+' : '';
  return `${sign}${delta.toFixed(1)}%`;
}

export function getLeadName(lead) {
  if (!lead) return 'Unknown';
  return [lead.first_name, lead.last_name].filter(Boolean).join(' ') || lead.phone || 'Unknown';
}

// Fuzzy column mapping for CSV import
const FIELD_ALIASES = {
  phone: ['phone', 'phone_number', 'mobile', 'cell', 'telephone'],
  first_name: ['fname', 'first', 'first_name', 'firstname', 'given_name'],
  last_name: ['lname', 'last', 'last_name', 'lastname', 'surname', 'family_name'],
  email: ['email', 'email_address', 'e-mail', 'e_mail'],
  state: ['state', 'st', 'state_code', 'province'],
  zip: ['zip', 'postal', 'postal_code', 'zipcode', 'zip_code'],
  vertical: ['vertical', 'lead_vertical', 'case_type', 'practice_area'],
  source: ['source', 'lead_source', 'src'],
  created_date: ['date', 'created', 'created_at', 'submission_date', 'submitted_at'],
  injury_description: ['injury', 'injury_description', 'injuries'],
  incident_date: ['incident_date', 'accident_date', 'incident_dt', 'dol', 'date_of_loss'],
  medical_treatment: ['treatment', 'medical', 'medical_treatment', 'sought_treatment'],
  has_attorney: ['attorney', 'has_attorney', 'represented', 'hired_lawyer'],
  at_fault_party: ['fault', 'at_fault', 'liability', 'at_fault_party'],
  tcpa_consent_at: ['consent', 'tcpa', 'tcpa_consent', 'consent_at', 'consent_date'],
  buyer_feedback: ['buyer_feedback', 'disposition_note', 'buyer_response', 'rejection_reason'],
  'custom_fields.supplier_sid': ['supplier', 'supplier_sid', 'source_id'],
  'custom_fields.traffic_source': ['traffic_source', 'sub_source', 'utm_source'],
  'custom_fields.cpl': ['cpl', 'cost_per_lead', 'lead_cost'],
};

export function fuzzyMapColumn(col) {
  const normalized = col.toLowerCase().trim().replace(/[\s-]/g, '_');
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    if (aliases.includes(normalized)) {
      return { field, confidence: 'high' };
    }
    // partial match
    if (aliases.some(a => normalized.includes(a) || a.includes(normalized))) {
      return { field, confidence: 'medium' };
    }
  }
  return { field: `custom_fields.${normalized}`, confidence: 'low' };
}

export const ALL_LEAD_FIELDS = [
  'first_name', 'last_name', 'phone', 'email', 'state', 'zip',
  'source', 'vertical', 'status', 'incident_date', 'incident_description',
  'injury_description', 'medical_treatment', 'has_attorney', 'at_fault_party',
  'tcpa_consent_at', 'buyer_feedback', 'internal_notes', 'pvql_score',
  'custom_fields.supplier_sid', 'custom_fields.traffic_source', 'custom_fields.cpl',
  '(ignore)',
];