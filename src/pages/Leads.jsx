import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useOrg } from '@/lib/OrgContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Search, LayoutGrid, List, RefreshCw, Plus } from 'lucide-react';
import { STATUS_LABELS, VERTICAL_LABELS, SOURCE_LABELS, KANBAN_COLUMNS, normalizePhone, getLeadName } from '@/lib/leadUtils';
import LeadKanban from '@/components/leads/LeadKanban';
import LeadTable from '@/components/leads/LeadTable';
import LeadFilterSidebar from '@/components/leads/LeadFilterSidebar';
import LeadDrawer from '@/components/leads/LeadDrawer';
import BulkActionsBar from '@/components/leads/BulkActionsBar';

function useDebounce(value, ms) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export default function Leads() {
  const { currentOrg, membership } = useOrg();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [view, setView] = useState(searchParams.get('view') || 'kanban');
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [openDrawerId, setOpenDrawerId] = useState(searchParams.get('lead') || null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  // Parse filters from URL
  const filters = {
    status: searchParams.get('status') || '',
    source: searchParams.get('source') || '',
    vertical: searchParams.get('vertical') || '',
    state: searchParams.get('state') || '',
    buyer: searchParams.get('buyer') || '',
    tag: searchParams.get('tag') || '',
  };

  const setFilter = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    setSearchParams(p);
  };

  const loadLeads = useCallback(async () => {
    if (!currentOrg) return;
    setLoading(true);
    const query = { organization_id: currentOrg.id, deleted_at: null };
    if (filters.status) query.status = filters.status;
    if (filters.source) query.source = filters.source;
    if (filters.vertical) query.vertical = filters.vertical;
    if (filters.state) query.state = filters.state;
    if (filters.buyer) query.assigned_buyer_id = filters.buyer;

    let results = await base44.entities.Lead.filter(query, '-created_date', 500);

    // Client-side search
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      results = results.filter(l =>
        getLeadName(l).toLowerCase().includes(q) ||
        l.phone?.includes(q) ||
        l.email?.toLowerCase().includes(q)
      );
    }

    if (filters.tag) {
      results = results.filter(l => l.tags?.includes(filters.tag));
    }

    setLeads(results);
    setLoading(false);
  }, [currentOrg, JSON.stringify(filters), debouncedSearch]);

  useEffect(() => { loadLeads(); }, [loadLeads]);

  // Poll every 15s
  useEffect(() => {
    const interval = setInterval(loadLeads, 15000);
    return () => clearInterval(interval);
  }, [loadLeads]);

  const canEdit = ['owner', 'admin', 'operator'].includes(membership?.role);
  const canAdmin = ['owner', 'admin'].includes(membership?.role);

  return (
    <div className="flex h-full">
      <LeadFilterSidebar
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        setFilter={setFilter}
      />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="border-b border-border px-4 py-2.5 flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-40 max-w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setFiltersOpen(v => !v)}>
            Filters {Object.values(filters).filter(Boolean).length > 0 && `(${Object.values(filters).filter(Boolean).length})`}
          </Button>
          <div className="flex items-center border border-border rounded-md">
            <button
              onClick={() => setView('kanban')}
              className={`p-1.5 ${view === 'kanban' ? 'bg-muted' : ''} rounded-l-md`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setView('table')}
              className={`p-1.5 ${view === 'table' ? 'bg-muted' : ''} rounded-r-md`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
          <Button variant="outline" size="sm" className="h-8" onClick={loadLeads}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          {canAdmin && (
            <Button size="sm" className="h-8 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs ml-auto" onClick={() => navigate('/leads/import')}>
              <Upload className="w-3.5 h-3.5" /> Import
            </Button>
          )}
        </div>

        {/* Bulk actions */}
        {selectedIds.length > 0 && (
          <BulkActionsBar
            selectedIds={selectedIds}
            leads={leads}
            orgId={currentOrg?.id}
            onClear={() => setSelectedIds([])}
            onRefresh={loadLeads}
            canAdmin={canAdmin}
          />
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="p-4 grid grid-cols-4 gap-3">
              {Array.from({length:8}).map((_,i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : view === 'kanban' ? (
            <LeadKanban
              leads={leads}
              onLeadClick={id => setOpenDrawerId(id)}
              selectedIds={selectedIds}
              onSelect={setSelectedIds}
              canEdit={canEdit}
              onRefresh={loadLeads}
            />
          ) : (
            <LeadTable
              leads={leads}
              onLeadClick={id => setOpenDrawerId(id)}
              selectedIds={selectedIds}
              onSelect={setSelectedIds}
              canEdit={canEdit}
            />
          )}
        </div>
      </div>

      {/* Lead drawer */}
      {openDrawerId && (
        <LeadDrawer
          leadId={openDrawerId}
          onClose={() => setOpenDrawerId(null)}
          onRefresh={loadLeads}
          canEdit={canEdit}
          canAdmin={canAdmin}
        />
      )}
    </div>
  );
}