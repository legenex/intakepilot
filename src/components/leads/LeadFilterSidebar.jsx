import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { STATUS_LABELS, VERTICAL_LABELS, SOURCE_LABELS, KANBAN_COLUMNS } from '@/lib/leadUtils';

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

export default function LeadFilterSidebar({ open, onClose, filters, setFilter }) {
  if (!open) return null;

  return (
    <div className="w-56 flex-shrink-0 border-r border-border bg-card flex flex-col">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <span className="text-xs font-semibold">Filters</span>
        <div className="flex items-center gap-2">
          <button onClick={() => {
            ['status','source','vertical','state','buyer','tag'].forEach(k => setFilter(k,''));
          }} className="text-[10px] text-muted-foreground hover:text-foreground">Clear all</button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}><X className="w-3.5 h-3.5" /></Button>
        </div>
      </div>
      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">Status</Label>
          <Select value={filters.status || 'all'} onValueChange={v => setFilter('status', v === 'all' ? '' : v)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {KANBAN_COLUMNS.map(s => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">Vertical</Label>
          <Select value={filters.vertical || 'all'} onValueChange={v => setFilter('vertical', v === 'all' ? '' : v)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Verticals</SelectItem>
              {Object.entries(VERTICAL_LABELS).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">Source</Label>
          <Select value={filters.source || 'all'} onValueChange={v => setFilter('source', v === 'all' ? '' : v)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {Object.entries(SOURCE_LABELS).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 block">State</Label>
          <Select value={filters.state || 'all'} onValueChange={v => setFilter('state', v === 'all' ? '' : v)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}