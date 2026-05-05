export const CATEGORIES = {
  trigger: { label: 'Triggers', color: '#3B82F6', section: 'TRIGGERS' },
  condition: { label: 'Conditions', color: '#F59E0B', section: 'CONDITIONS' },
  action_lead: { label: 'Actions — Lead', color: '#A855F7', section: 'ACTIONS — LEAD' },
  action_comm: { label: 'Actions — Communication', color: '#22D3EE', section: 'ACTIONS — COMMUNICATION' },
  action_routing: { label: 'Actions — Routing', color: '#10B981', section: 'ACTIONS — ROUTING' },
  action_data: { label: 'Actions — Data', color: '#64748B', section: 'ACTIONS — DATA' },
  utility: { label: 'Utilities', color: '#475569', section: 'UTILITIES' },
};

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
];

export const TIMEZONES = [
  'America/New_York','America/Chicago','America/Denver','America/Los_Angeles',
  'America/Phoenix','America/Anchorage','Pacific/Honolulu','UTC',
];

export const US_STATES_LIST = US_STATES;

export const NODE_SCHEMAS = {
  // ── TRIGGERS ───────────────────────────────────────────────────
  new_lead_created: {
    label: 'New Lead Created',
    description: 'Fires when a new lead enters the system',
    category: 'trigger',
    icon: 'Sparkles',
    color: '#3B82F6',
    inputs: 0,
    outputs: ['next'],
    fields: [
      { key: 'sources', label: 'Lead Sources', type: 'multiselect', options: ['raw_form','dq','unsold','returned','no_contact','manual_import'], required: false },
      { key: 'verticals', label: 'Verticals', type: 'multiselect', options: ['auto_mva','slip_fall','medmal','workers_comp','dog_bite','mass_tort','other'], required: false },
      { key: 'states', label: 'States', type: 'multiselect_states', required: false },
    ],
  },
  lead_status_changed: {
    label: 'Lead Status Changed',
    description: 'Fires when a lead status transitions',
    category: 'trigger',
    icon: 'RefreshCw',
    color: '#3B82F6',
    inputs: 0,
    outputs: ['next'],
    fields: [
      { key: 'from_status', label: 'From Status', type: 'dropdown_status', required: false },
      { key: 'to_status', label: 'To Status', type: 'dropdown_status', required: true },
    ],
  },
  lead_field_updated: {
    label: 'Lead Field Updated',
    description: 'Fires when a specific lead field changes',
    category: 'trigger',
    icon: 'PenLine',
    color: '#3B82F6',
    inputs: 0,
    outputs: ['next'],
    fields: [
      { key: 'field', label: 'Field', type: 'dropdown_lead_field', required: true },
      { key: 'new_value', label: 'New Value (optional)', type: 'text', required: false },
    ],
  },
  time_elapsed: {
    label: 'Time Elapsed Since Lead Created',
    description: 'Fires after a delay from lead creation',
    category: 'trigger',
    icon: 'Timer',
    color: '#3B82F6',
    inputs: 0,
    outputs: ['next'],
    fields: [
      { key: 'duration_value', label: 'Duration', type: 'number', required: true },
      { key: 'duration_unit', label: 'Unit', type: 'select', options: ['minutes','hours','days'], required: true },
    ],
  },
  inbound_sms: {
    label: 'Inbound SMS Received',
    description: 'Fires when a lead replies via SMS',
    category: 'trigger',
    icon: 'MessageSquare',
    color: '#3B82F6',
    inputs: 0,
    outputs: ['next'],
    fields: [
      { key: 'keyword_match', label: 'Keyword Match (optional)', type: 'text', required: false },
    ],
  },
  inbound_call: {
    label: 'Inbound Call Received',
    description: 'Fires when a lead calls inbound',
    category: 'trigger',
    icon: 'PhoneIncoming',
    color: '#3B82F6',
    inputs: 0,
    outputs: ['next'],
    fields: [
      { key: 'to_number', label: 'To Number (optional)', type: 'text', required: false },
    ],
  },
  webhook_received: {
    label: 'Webhook Received',
    description: 'Fires on an incoming webhook POST',
    category: 'trigger',
    icon: 'Webhook',
    color: '#3B82F6',
    inputs: 0,
    outputs: ['next'],
    fields: [
      { key: 'secret_token', label: 'Secret Token', type: 'text', required: false },
      { key: 'field_mapping', label: 'Field Mapping', type: 'key_value_pairs', required: false },
    ],
  },
  schedule: {
    label: 'Schedule',
    description: 'Fires on a cron schedule',
    category: 'trigger',
    icon: 'CalendarClock',
    color: '#3B82F6',
    inputs: 0,
    outputs: ['next'],
    fields: [
      { key: 'cron', label: 'Cron Expression', type: 'cron', required: true },
      { key: 'friendly_label', label: 'Description', type: 'text', required: false },
      { key: 'timezone', label: 'Timezone', type: 'select', options: TIMEZONES, required: false },
    ],
  },
  buyer_feedback: {
    label: 'Buyer Feedback Received',
    description: 'Fires when a buyer responds to a lead delivery',
    category: 'trigger',
    icon: 'Star',
    color: '#3B82F6',
    inputs: 0,
    outputs: ['next'],
    fields: [
      { key: 'feedback_type', label: 'Feedback Type', type: 'select', options: ['any','accepted','rejected','returned'], required: false },
    ],
  },

  // ── CONDITIONS ─────────────────────────────────────────────────
  if_field: {
    label: 'If Field Equals / Contains / …',
    description: 'Branch based on a lead field value',
    category: 'condition',
    icon: 'GitBranch',
    color: '#F59E0B',
    inputs: 1,
    outputs: ['true','false'],
    fields: [
      { key: 'field', label: 'Field', type: 'dropdown_lead_field', required: true },
      { key: 'operator', label: 'Operator', type: 'select', options: ['equals','not_equals','contains','not_contains','greater_than','less_than','exists','not_exists'], required: true },
      { key: 'value', label: 'Value', type: 'template_text', required: false },
    ],
  },
  if_tag: {
    label: 'If Lead Tag Present',
    description: 'Branch based on a tag on the lead',
    category: 'condition',
    icon: 'Tag',
    color: '#F59E0B',
    inputs: 1,
    outputs: ['true','false'],
    fields: [
      { key: 'tag', label: 'Tag Name', type: 'text', required: true },
    ],
  },
  if_business_hours: {
    label: 'If Within Business Hours',
    description: 'Branch based on current time',
    category: 'condition',
    icon: 'Clock',
    color: '#F59E0B',
    inputs: 1,
    outputs: ['true','false'],
    fields: [
      { key: 'start_time', label: 'Start Time (HH:MM)', type: 'text', required: true },
      { key: 'end_time', label: 'End Time (HH:MM)', type: 'text', required: true },
      { key: 'days', label: 'Days', type: 'multiselect', options: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], required: false },
      { key: 'timezone', label: 'Timezone', type: 'select', options: TIMEZONES, required: false },
    ],
  },
  if_buyer_cap: {
    label: 'If Buyer Cap Available',
    description: 'True if a buyer has capacity for more leads',
    category: 'condition',
    icon: 'Users',
    color: '#F59E0B',
    inputs: 1,
    outputs: ['true','false'],
    fields: [
      { key: 'buyer_id', label: 'Buyer (optional — any if blank)', type: 'text', required: false },
    ],
  },
  if_tcpa: {
    label: 'If TCPA Consent Valid',
    description: 'True if lead has valid TCPA consent',
    category: 'condition',
    icon: 'ShieldCheck',
    color: '#F59E0B',
    inputs: 1,
    outputs: ['true','false'],
    fields: [
      { key: 'consent_type', label: 'Consent Type', type: 'select', options: ['express_written','prior_express','any'], required: false },
    ],
  },
  branch: {
    label: 'Branch (multi-output)',
    description: 'Route to one of N branches based on conditions',
    category: 'condition',
    icon: 'Network',
    color: '#F59E0B',
    inputs: 1,
    outputs: ['branch_1','branch_2','default'],
    fields: [
      { key: 'branches', label: 'Branches', type: 'branch_list', required: true },
    ],
  },

  // ── ACTIONS — LEAD ─────────────────────────────────────────────
  update_field: {
    label: 'Update Lead Field',
    description: 'Set or update a field on the lead record',
    category: 'action_lead',
    icon: 'PenSquare',
    color: '#A855F7',
    inputs: 1,
    outputs: ['next'],
    fields: [
      { key: 'field', label: 'Field', type: 'dropdown_lead_field', required: true },
      { key: 'value', label: 'Value', type: 'template_text', required: true },
    ],
  },
  add_tag: {
    label: 'Add Tag',
    description: 'Add a tag to the lead',
    category: 'action_lead',
    icon: 'TagPlus',
    color: '#A855F7',
    inputs: 1,
    outputs: ['next'],
    fields: [
      { key: 'tag', label: 'Tag Name', type: 'text', required: true },
    ],
  },
  remove_tag: {
    label: 'Remove Tag',
    description: 'Remove a tag from the lead',
    category: 'action_lead',
    icon: 'TagMinus',
    color: '#A855F7',
    inputs: 1,
    outputs: ['next'],
    fields: [
      { key: 'tag', label: 'Tag Name', type: 'text', required: true },
    ],
  },
  change_status: {
    label: 'Change Status',
    description: 'Move the lead to a new status',
    category: 'action_lead',
    icon: 'ArrowRightLeft',
    color: '#A855F7',
    inputs: 1,
    outputs: ['next'],
    fields: [
      { key: 'status', label: 'New Status', type: 'dropdown_status', required: true },
    ],
  },
  add_note: {
    label: 'Add Note',
    description: 'Append a note to the lead activity log',
    category: 'action_lead',
    icon: 'StickyNote',
    color: '#A855F7',
    inputs: 1,
    outputs: ['next'],
    fields: [
      { key: 'note', label: 'Note', type: 'textarea', required: true },
    ],
  },
  calc_pvql: {
    label: 'Calculate PVQL Score',
    description: 'Re-run PVQL scoring on the lead',
    category: 'action_lead',
    icon: 'Calculator',
    color: '#A855F7',
    inputs: 1,
    outputs: ['next'],
    fields: [
      { key: 'model', label: 'Scoring Model', type: 'select', options: ['default','auto_mva_v2','slip_fall_v1'], required: false },
    ],
  },

  // ── ACTIONS — COMMUNICATION ────────────────────────────────────
  run_voice_agent: {
    label: 'Run Voice Agent',
    description: 'Initiate an outbound call with an AI voice agent',
    category: 'action_comm',
    icon: 'Mic',
    color: '#22D3EE',
    inputs: 1,
    outputs: ['completed','no_answer','failed'],
    fields: [
      { key: 'agent_id', label: 'Agent', type: 'dropdown_agent', required: true },
      { key: 'dynamic_variables', label: 'Dynamic Variables', type: 'key_value_pairs', required: false },
      { key: 'retry_count', label: 'Retry Count', type: 'number', required: false },
      { key: 'retry_delay_minutes', label: 'Retry Delay (minutes)', type: 'number', required: false },
    ],
  },
  send_sms: {
    label: 'Send SMS',
    description: 'Send an SMS message to the lead',
    category: 'action_comm',
    icon: 'MessageCircle',
    color: '#22D3EE',
    inputs: 1,
    outputs: ['next'],
    fields: [
      { key: 'template', label: 'Message', type: 'template_text', required: true },
      { key: 'from_number', label: 'From Number (optional)', type: 'text', required: false },
    ],
  },
  send_email: {
    label: 'Send Email',
    description: 'Send an email to the lead',
    category: 'action_comm',
    icon: 'Mail',
    color: '#22D3EE',
    inputs: 1,
    outputs: ['next'],
    fields: [
      { key: 'to', label: 'To', type: 'template_text', required: true },
      { key: 'subject', label: 'Subject', type: 'template_text', required: true },
      { key: 'body', label: 'Body', type: 'textarea', required: true },
    ],
  },
  send_doc_request: {
    label: 'Send Document Request',
    description: 'Send a document capture link via SMS',
    category: 'action_comm',
    icon: 'FileUp',
    color: '#22D3EE',
    inputs: 1,
    outputs: ['next'],
    fields: [
      { key: 'document_types', label: 'Document Types', type: 'multiselect', options: ['id','medical_records','accident_photos','insurance_card','police_report','other'], required: true },
      { key: 'expiry_hours', label: 'Link Expiry (hours)', type: 'number', required: false },
    ],
  },

  // ── ACTIONS — ROUTING ──────────────────────────────────────────
  find_buyer: {
    label: 'Find Best Buyer',
    description: 'Match the lead to the best available buyer',
    category: 'action_routing',
    icon: 'Search',
    color: '#10B981',
    inputs: 1,
    outputs: ['found','not_found'],
    fields: [
      { key: 'vertical_match', label: 'Require Vertical Match', type: 'boolean', required: false },
      { key: 'state_match', label: 'Require State Match', type: 'boolean', required: false },
      { key: 'prefer_exclusive', label: 'Prefer Exclusive Buyers', type: 'boolean', required: false },
      { key: 'max_price_priority', label: 'Prioritize Highest Price', type: 'boolean', required: false },
    ],
  },
  deliver_buyer: {
    label: 'Deliver to Buyer',
    description: 'Send the lead to a specific buyer',
    category: 'action_routing',
    icon: 'Send',
    color: '#10B981',
    inputs: 1,
    outputs: ['success','failed'],
    fields: [
      { key: 'buyer_id', label: 'Buyer (or {{buyer_id}} variable)', type: 'template_text', required: true },
      { key: 'method', label: 'Delivery Method', type: 'select', options: ['auto','webhook','email','sms','live_transfer'], required: true },
    ],
  },
  wait_buyer_response: {
    label: 'Wait for Buyer Response',
    description: 'Pause until the buyer accepts or rejects',
    category: 'action_routing',
    icon: 'Hourglass',
    color: '#10B981',
    inputs: 1,
    outputs: ['accepted','rejected','timeout'],
    fields: [
      { key: 'timeout_hours', label: 'Timeout (hours)', type: 'number', required: true },
    ],
  },

  // ── ACTIONS — DATA ─────────────────────────────────────────────
  send_webhook: {
    label: 'Send Webhook',
    description: 'POST lead data to an external URL',
    category: 'action_data',
    icon: 'Webhook',
    color: '#64748B',
    inputs: 1,
    outputs: ['success','failed'],
    fields: [
      { key: 'url', label: 'URL', type: 'text', required: true },
      { key: 'headers', label: 'Headers', type: 'key_value_pairs', required: false },
      { key: 'payload_template', label: 'Payload (JSON template)', type: 'json', required: false },
    ],
  },
  http_request: {
    label: 'HTTP Request',
    description: 'Make a generic HTTP call',
    category: 'action_data',
    icon: 'Globe',
    color: '#64748B',
    inputs: 1,
    outputs: ['success','failed'],
    fields: [
      { key: 'method', label: 'Method', type: 'select', options: ['GET','POST','PUT','PATCH','DELETE'], required: true },
      { key: 'url', label: 'URL', type: 'template_text', required: true },
      { key: 'headers', label: 'Headers', type: 'key_value_pairs', required: false },
      { key: 'body', label: 'Body (JSON)', type: 'json', required: false },
      { key: 'save_response_to', label: 'Save Response To Variable', type: 'text', required: false },
    ],
  },
  sync_bigquery: {
    label: 'Sync to BigQuery',
    description: '(Placeholder) Stream lead data to BigQuery',
    category: 'action_data',
    icon: 'Database',
    color: '#64748B',
    inputs: 1,
    outputs: ['next'],
    fields: [
      { key: 'dataset', label: 'Dataset', type: 'text', required: false },
      { key: 'table', label: 'Table', type: 'text', required: false },
    ],
  },
  append_sheet: {
    label: 'Append to Google Sheet',
    description: '(Placeholder) Append a row to a Google Sheet',
    category: 'action_data',
    icon: 'Table',
    color: '#64748B',
    inputs: 1,
    outputs: ['next'],
    fields: [
      { key: 'spreadsheet_id', label: 'Spreadsheet ID', type: 'text', required: false },
      { key: 'sheet_name', label: 'Sheet Name', type: 'text', required: false },
      { key: 'row_mapping', label: 'Column Mapping', type: 'key_value_pairs', required: false },
    ],
  },

  // ── UTILITIES ──────────────────────────────────────────────────
  wait: {
    label: 'Wait',
    description: 'Pause execution for a fixed duration',
    category: 'utility',
    icon: 'Pause',
    color: '#475569',
    inputs: 1,
    outputs: ['next'],
    fields: [
      { key: 'duration_value', label: 'Duration', type: 'number', required: true },
      { key: 'duration_unit', label: 'Unit', type: 'select', options: ['seconds','minutes','hours','days'], required: true },
    ],
  },
  loop: {
    label: 'Loop',
    description: 'Repeat a section N times or until a condition',
    category: 'utility',
    icon: 'Repeat',
    color: '#475569',
    inputs: 1,
    outputs: ['loop','done'],
    fields: [
      { key: 'max_iterations', label: 'Max Iterations', type: 'number', required: true },
      { key: 'break_condition', label: 'Break Condition (field + operator)', type: 'text', required: false },
    ],
  },
  set_variable: {
    label: 'Set Variable',
    description: 'Store a value into a workflow variable',
    category: 'utility',
    icon: 'Variable',
    color: '#475569',
    inputs: 1,
    outputs: ['next'],
    fields: [
      { key: 'variable_name', label: 'Variable Name', type: 'text', required: true },
      { key: 'value', label: 'Value', type: 'template_text', required: true },
    ],
  },
  end: {
    label: 'End',
    description: 'Explicitly end this workflow branch',
    category: 'utility',
    icon: 'OctagonX',
    color: '#475569',
    inputs: 1,
    outputs: [],
    fields: [
      { key: 'reason', label: 'Reason (optional)', type: 'text', required: false },
    ],
  },
};

export const NODE_SECTIONS = [
  { key: 'trigger',        label: 'Triggers',                color: '#3B82F6', types: ['new_lead_created','lead_status_changed','lead_field_updated','time_elapsed','inbound_sms','inbound_call','webhook_received','schedule','buyer_feedback'] },
  { key: 'condition',      label: 'Conditions',              color: '#F59E0B', types: ['if_field','if_tag','if_business_hours','if_buyer_cap','if_tcpa','branch'] },
  { key: 'action_lead',    label: 'Actions — Lead',          color: '#A855F7', types: ['update_field','add_tag','remove_tag','change_status','add_note','calc_pvql'] },
  { key: 'action_comm',    label: 'Actions — Communication', color: '#22D3EE', types: ['run_voice_agent','send_sms','send_email','send_doc_request'] },
  { key: 'action_routing', label: 'Actions — Routing',       color: '#10B981', types: ['find_buyer','deliver_buyer','wait_buyer_response'] },
  { key: 'action_data',    label: 'Actions — Data',          color: '#64748B', types: ['send_webhook','http_request','sync_bigquery','append_sheet'] },
  { key: 'utility',        label: 'Utilities',               color: '#475569', types: ['wait','loop','set_variable','end'] },
];

export const LEAD_FIELDS = [
  'first_name','last_name','email','phone','state','vertical','status',
  'source','pvql_score','attorney_name','incident_date','incident_type',
  'tags','assigned_to','notes','custom_field_1','custom_field_2',
];

export const LEAD_STATUSES = [
  'new','contacted','qualified','disqualified','signed','delivered',
  'returned','no_contact','dq','unsold',
];

export function getNodeSchema(type) {
  return NODE_SCHEMAS[type] || null;
}

export function getConfigSummary(type, data = {}) {
  const schema = getNodeSchema(type);
  if (!schema) return '';
  const parts = [];
  for (const field of schema.fields.slice(0, 2)) {
    const val = data[field.key];
    if (val !== undefined && val !== '' && val !== null) {
      if (Array.isArray(val) && val.length > 0) {
        parts.push(`${field.label}: ${val.slice(0, 2).join(', ')}${val.length > 2 ? '…' : ''}`);
      } else if (typeof val === 'boolean') {
        if (val) parts.push(field.label);
      } else if (typeof val === 'string' && val.length > 0) {
        parts.push(`${val.slice(0, 24)}${val.length > 24 ? '…' : ''}`);
      } else if (typeof val === 'number') {
        parts.push(`${val}`);
      }
    }
  }
  return parts.join(' · ');
}

export function validateWorkflow(nodes, edges) {
  const issues = [];
  const triggerNodes = nodes.filter(n => {
    const s = getNodeSchema(n.type);
    return s && s.category === 'trigger';
  });
  if (triggerNodes.length === 0) issues.push('No trigger node — add one to start the workflow');
  if (triggerNodes.length > 1) issues.push('Multiple trigger nodes — only one allowed');

  for (const node of nodes) {
    const schema = getNodeSchema(node.type);
    if (!schema) continue;
    const data = node.data || {};
    for (const field of schema.fields) {
      if (!field.required) continue;
      const val = data[field.key];
      if (val === undefined || val === '' || val === null || (Array.isArray(val) && val.length === 0)) {
        issues.push(`Node "${schema.label}": "${field.label}" is required`);
      }
    }
    if (schema.inputs > 0) {
      const hasIncoming = edges.some(e => e.target === node.id);
      if (!hasIncoming) {
        issues.push(`Node "${schema.label}" has no incoming connection`);
      }
    }
  }
  return issues;
}