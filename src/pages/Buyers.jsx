import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Building2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useBuyers } from '@/hooks/useBuyers';
import { useOrg } from '@/lib/OrgContext';
import { formatCents, VERTICAL_LABELS } from '@/lib/leadUtils';
import AddBuyerModal from '@/components/buyers/AddBuyerModal';

export default function Buyers() {
  const { membership } = useOrg();
  const { buyers, loading, refetch } = useBuyers();
  const [showAdd, setShowAdd] = useState(false);
  const canAdmin = ['owner', 'admin'].includes(membership?.role);

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Buyers</h1>
          <p className="text-sm text-muted-foreground">{buyers.length} configured</p>
        </div>
        {canAdmin && (
          <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4" /> Add Buyer
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({length:3}).map((_,i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : buyers.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium">No buyers yet</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Add your first buyer to start routing leads</p>
          {canAdmin && (
            <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4" /> Add Buyer
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Buyer</th>
                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Verticals</th>
                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">States</th>
                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Daily Cap</th>
                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Price/PVQL</th>
                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Total</th>
                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {buyers.map(b => {
                const capPct = b.daily_cap > 0 ? Math.round((b.current_day_count / b.daily_cap) * 100) : 0;
                return (
                  <tr key={b.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/buyers/${b.id}`} className="font-semibold hover:text-primary transition-colors">
                        {b.name}
                      </Link>
                      {b.contact_name && <p className="text-[10px] text-muted-foreground">{b.contact_name}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(b.verticals || []).slice(0,2).map(v => (
                          <Badge key={v} variant="outline" className="text-[10px] py-0">{VERTICAL_LABELS[v] || v}</Badge>
                        ))}
                        {(b.verticals || []).length > 2 && <Badge variant="outline" className="text-[10px] py-0">+{b.verticals.length - 2}</Badge>}
                        {!b.verticals?.length && <span className="text-muted-foreground">All</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-muted-foreground">{b.states?.length ? b.states.slice(0,3).join(', ') + (b.states.length > 3 ? `…` : '') : 'All'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1 w-28">
                        <div className="flex justify-between">
                          <span className="font-mono">{b.current_day_count}/{b.daily_cap}</span>
                          <span className="text-muted-foreground">{capPct}%</span>
                        </div>
                        <Progress value={capPct} className="h-1.5" />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold">{formatCents(b.price_per_pvql)}</td>
                    <td className="px-4 py-3 font-mono">{b.total_delivered?.toLocaleString() || 0}</td>
                    <td className="px-4 py-3">
                      <Badge className={`text-[10px] ${b.active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'} border-0`}>
                        {b.active ? 'Active' : 'Paused'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <AddBuyerModal onClose={() => setShowAdd(false)} onSuccess={() => { setShowAdd(false); refetch(); }} />
      )}
    </div>
  );
}