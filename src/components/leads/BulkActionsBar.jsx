import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { X, Tag, Trash2, Send, ArrowRight } from 'lucide-react';
import { STATUS_LABELS, KANBAN_COLUMNS } from '@/lib/leadUtils';
import { logActivity } from '@/hooks/useLeads';

export default function BulkActionsBar({ selectedIds, leads, orgId, onClear, onRefresh, canAdmin }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const changeStatus = async (status) => {
    setLoading(true);
    for (const id of selectedIds) {
      const lead = leads.find(l => l.id === id);
      await base44.entities.Lead.update(id, { status });
      await logActivity({ organization_id: orgId, lead_id: id, type: 'status_changed', payload: { from: lead?.status, to: status, summary: `Bulk status → ${STATUS_LABELS[status]}` }, actor_label: 'User' });
    }
    toast({ title: `Updated ${selectedIds.length} leads to ${STATUS_LABELS[status]}` });
    onClear();
    onRefresh();
    setLoading(false);
  };

  const softDelete = async () => {
    if (!canAdmin || !confirm(`Delete ${selectedIds.length} leads? This is reversible.`)) return;
    setLoading(true);
    for (const id of selectedIds) {
      await base44.entities.Lead.update(id, { deleted_at: new Date().toISOString() });
    }
    toast({ title: `Deleted ${selectedIds.length} leads` });
    onClear();
    onRefresh();
    setLoading(false);
  };

  const exportCSV = () => {
    const selected = leads.filter(l => selectedIds.includes(l.id));
    const headers = ['first_name','last_name','phone','email','state','zip','source','vertical','status','pvql_score','created_date'];
    const rows = selected.map(l => headers.map(h => (l[h] ?? '')).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'leads_export.csv'; a.click();
  };

  return (
    <div className="border-b border-border bg-primary/5 px-4 py-2 flex items-center gap-3 flex-wrap">
      <span className="text-xs font-medium">{selectedIds.length} selected</span>
      <div className="flex items-center gap-2 ml-2">
        <Select onValueChange={changeStatus} disabled={loading}>
          <SelectTrigger className="h-7 text-xs w-36">
            <span className="flex items-center gap-1"><ArrowRight className="w-3 h-3" /> Change status</span>
          </SelectTrigger>
          <SelectContent>
            {KANBAN_COLUMNS.map(s => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={exportCSV}>
          Export CSV
        </Button>
        {canAdmin && (
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-destructive border-destructive/30" onClick={softDelete} disabled={loading}>
            <Trash2 className="w-3 h-3" /> Delete
          </Button>
        )}
      </div>
      <Button size="sm" variant="ghost" className="h-7 w-7 ml-auto p-0" onClick={onClear}>
        <X className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}