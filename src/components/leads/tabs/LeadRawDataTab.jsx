import React, { useState } from 'react';

function JsonNode({ data, depth = 0 }) {
  const [open, setOpen] = useState(depth < 2);
  if (data === null || data === undefined) return <span className="text-muted-foreground">null</span>;
  if (typeof data !== 'object') return <span className="text-success/80 font-mono text-xs">{JSON.stringify(data)}</span>;
  const keys = Object.keys(data);
  if (keys.length === 0) return <span className="text-muted-foreground font-mono text-xs">{Array.isArray(data) ? '[]' : '{}'}</span>;

  return (
    <span>
      <button onClick={() => setOpen(o => !o)} className="text-muted-foreground hover:text-foreground mr-1">{open ? '▼' : '▶'}</button>
      {open ? (
        <span>
          {keys.map(k => (
            <div key={k} style={{ paddingLeft: (depth + 1) * 12 }}>
              <span className="text-primary/80 font-mono text-xs">"{k}"</span>
              <span className="text-muted-foreground text-xs">: </span>
              <JsonNode data={data[k]} depth={depth + 1} />
            </div>
          ))}
        </span>
      ) : (
        <span className="text-muted-foreground text-xs">{`{${keys.length} keys}`}</span>
      )}
    </span>
  );
}

export default function LeadRawDataTab({ lead }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Raw Payload</p>
        <div className="bg-muted/40 rounded-lg p-3 font-mono text-xs overflow-auto max-h-64">
          {lead.raw_payload ? <JsonNode data={lead.raw_payload} /> : <span className="text-muted-foreground">No raw payload</span>}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Custom Fields</p>
        <div className="bg-muted/40 rounded-lg p-3 font-mono text-xs overflow-auto max-h-64">
          {lead.custom_fields && Object.keys(lead.custom_fields).length > 0
            ? <JsonNode data={lead.custom_fields} />
            : <span className="text-muted-foreground">No custom fields</span>}
        </div>
      </div>
    </div>
  );
}