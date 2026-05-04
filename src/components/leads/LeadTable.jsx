import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { STATUS_LABELS, STATUS_COLORS, VERTICAL_LABELS, SOURCE_LABELS, getLeadName, formatCents } from '@/lib/leadUtils';
import { formatDistanceToNow } from 'date-fns';

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'phone', label: 'Phone' },
  { key: 'status', label: 'Status' },
  { key: 'vertical', label: 'Vertical' },
  { key: 'source', label: 'Source' },
  { key: 'state', label: 'State' },
  { key: 'pvql_score', label: 'PVQL' },
  { key: 'created_date', label: 'Created' },
];

export default function LeadTable({ leads, onLeadClick, selectedIds, onSelect, canEdit }) {
  const [sortKey, setSortKey] = useState('created_date');
  const [sortDir, setSortDir] = useState('desc');

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const sorted = [...leads].sort((a, b) => {
    let av = sortKey === 'name' ? getLeadName(a) : (a[sortKey] ?? '');
    let bv = sortKey === 'name' ? getLeadName(b) : (b[sortKey] ?? '');
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const allSelected = leads.length > 0 && leads.every(l => selectedIds.includes(l.id));
  const toggleAll = () => {
    onSelect(allSelected ? [] : leads.map(l => l.id));
  };

  return (
    <div className="overflow-auto h-full">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-card border-b border-border z-10">
          <tr>
            <th className="px-3 py-2 w-8">
              <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
            </th>
            {COLUMNS.map(col => (
              <th
                key={col.key}
                className="px-3 py-2 text-left font-semibold text-muted-foreground cursor-pointer hover:text-foreground whitespace-nowrap"
                onClick={() => toggleSort(col.key)}
              >
                <span className="flex items-center gap-1">
                  {col.label}
                  {sortKey === col.key && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr><td colSpan={COLUMNS.length + 1} className="px-3 py-12 text-center text-muted-foreground">No leads found</td></tr>
          ) : sorted.map(lead => (
            <tr
              key={lead.id}
              className={`border-b border-border/50 hover:bg-muted/40 cursor-pointer transition-colors ${selectedIds.includes(lead.id) ? 'bg-primary/5' : ''}`}
              onClick={() => onLeadClick(lead.id)}
            >
              <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.includes(lead.id)}
                  onCheckedChange={() => {
                    onSelect(prev => prev.includes(lead.id) ? prev.filter(x => x !== lead.id) : [...prev, lead.id]);
                  }}
                />
              </td>
              <td className="px-3 py-2 font-medium whitespace-nowrap">{getLeadName(lead)}</td>
              <td className="px-3 py-2 font-mono text-muted-foreground">{lead.phone}</td>
              <td className="px-3 py-2">
                <Badge className={`text-[10px] px-1.5 py-0 ${STATUS_COLORS[lead.status]}`}>
                  {STATUS_LABELS[lead.status]}
                </Badge>
              </td>
              <td className="px-3 py-2 text-muted-foreground">{VERTICAL_LABELS[lead.vertical] || lead.vertical || '—'}</td>
              <td className="px-3 py-2 text-muted-foreground">{SOURCE_LABELS[lead.source] || lead.source || '—'}</td>
              <td className="px-3 py-2 text-muted-foreground">{lead.state || '—'}</td>
              <td className="px-3 py-2">
                {lead.pvql_score ? <span className="font-mono text-violet-400 font-semibold">{lead.pvql_score}/10</span> : '—'}
              </td>
              <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                {lead.created_date ? formatDistanceToNow(new Date(lead.created_date), { addSuffix: true }) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}