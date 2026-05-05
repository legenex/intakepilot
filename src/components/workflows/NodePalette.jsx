import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Search, GripVertical } from 'lucide-react';
import { NODE_SECTIONS, NODE_SCHEMAS } from '@/lib/workflowNodeSchemas';
import { Input } from '@/components/ui/input';
import { getNodeIcon } from '@/components/workflows/NodeIcon';

function PaletteCard({ type, schema }) {
  const Icon = getNodeIcon(schema.icon);

  const onDragStart = (e) => {
    e.dataTransfer.setData('application/reactflow-type', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="group flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-muted/60 cursor-grab active:cursor-grabbing transition-colors"
      title={schema.description}
    >
      <GripVertical className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
      <div
        className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: schema.color + '22', color: schema.color }}
      >
        {Icon && <Icon className="w-3 h-3" />}
      </div>
      <span className="text-xs font-medium truncate">{schema.label}</span>
    </div>
  );
}

function Section({ section, searchQuery }) {
  const [open, setOpen] = useState(true);

  const filteredTypes = section.types.filter(type => {
    if (!searchQuery) return true;
    const schema = NODE_SCHEMAS[type];
    return (
      schema.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (schema.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (searchQuery && filteredTypes.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider hover:bg-muted/40 rounded-md transition-colors"
        style={{ color: section.color }}
      >
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        {section.label}
        <span className="ml-auto text-muted-foreground font-normal normal-case tracking-normal">
          {filteredTypes.length}
        </span>
      </button>
      {open && (
        <div className="ml-1 space-y-0.5">
          {filteredTypes.map(type => (
            <PaletteCard key={type} type={type} schema={NODE_SCHEMAS[type]} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function NodePalette() {
  const [search, setSearch] = useState('');

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search nodes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {NODE_SECTIONS.map(section => (
          <Section key={section.key} section={section} searchQuery={search} />
        ))}
      </div>
    </div>
  );
}