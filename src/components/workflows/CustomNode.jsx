import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { AlertCircle } from 'lucide-react';
import { getNodeSchema, getConfigSummary, LEAD_STATUSES } from '@/lib/workflowNodeSchemas';
import { getNodeIcon } from '@/components/workflows/NodeIcon';

function isIncomplete(type, data = {}) {
  const schema = getNodeSchema(type);
  if (!schema) return false;
  return schema.fields.some(f => {
    if (!f.required) return false;
    const v = data[f.key];
    return v === undefined || v === '' || v === null || (Array.isArray(v) && v.length === 0);
  });
}

export default function CustomNode({ data, type, selected }) {
  const schema = getNodeSchema(type);
  if (!schema) return null;

  const Icon = getNodeIcon(schema.icon);
  const summary = getConfigSummary(type, data);
  const incomplete = isIncomplete(type, data);
  const outputs = schema.outputs || ['next'];

  return (
    <div
      className="relative bg-card border rounded-xl shadow-sm min-w-[180px] max-w-[220px] overflow-hidden transition-all"
      style={{
        borderColor: selected ? schema.color : 'hsl(var(--border))',
        boxShadow: selected ? `0 0 0 2px ${schema.color}55` : undefined,
      }}
    >
      {/* Top color stripe */}
      <div className="h-1 w-full" style={{ backgroundColor: schema.color }} />

      {/* Incomplete indicator */}
      {incomplete && (
        <div className="absolute top-2 right-2">
          <AlertCircle className="w-3.5 h-3.5 text-destructive" />
        </div>
      )}

      {/* Input handle (top) */}
      {schema.inputs > 0 && (
        <Handle
          type="target"
          position={Position.Top}
          id="input"
          style={{
            background: schema.color,
            border: '2px solid white',
            width: 10,
            height: 10,
            top: -5,
          }}
        />
      )}

      {/* Body */}
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: schema.color + '22', color: schema.color }}
          >
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold leading-tight pr-4">{schema.label}</span>
        </div>
        {summary && (
          <p className="mt-1.5 text-[10px] text-muted-foreground leading-tight truncate">{summary}</p>
        )}
      </div>

      {/* Output handles (bottom) */}
      {outputs.length === 1 && (
        <Handle
          type="source"
          position={Position.Bottom}
          id={outputs[0]}
          style={{
            background: schema.color,
            border: '2px solid white',
            width: 10,
            height: 10,
            bottom: -5,
          }}
        />
      )}
      {outputs.length === 2 && outputs.map((out, i) => (
        <Handle
          key={out}
          type="source"
          position={Position.Bottom}
          id={out}
          style={{
            background: schema.color,
            border: '2px solid white',
            width: 10,
            height: 10,
            bottom: -5,
            left: `${(i + 1) * (100 / (outputs.length + 1))}%`,
          }}
        >
          <div
            className="absolute text-[8px] font-semibold whitespace-nowrap"
            style={{ bottom: -14, left: '50%', transform: 'translateX(-50%)', color: schema.color }}
          >
            {out}
          </div>
        </Handle>
      ))}
      {outputs.length >= 3 && outputs.map((out, i) => (
        <Handle
          key={out}
          type="source"
          position={Position.Bottom}
          id={out}
          style={{
            background: schema.color,
            border: '2px solid white',
            width: 10,
            height: 10,
            bottom: -5,
            left: `${(i + 1) * (100 / (outputs.length + 1))}%`,
          }}
        >
          <div
            className="absolute text-[8px] font-semibold whitespace-nowrap"
            style={{ bottom: -14, left: '50%', transform: 'translateX(-50%)', color: schema.color }}
          >
            {out}
          </div>
        </Handle>
      ))}
    </div>
  );
}