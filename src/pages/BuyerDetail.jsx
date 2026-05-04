import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useOrg } from '@/lib/OrgContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Edit, Pause, Play } from 'lucide-react';
import { formatCents, VERTICAL_LABELS } from '@/lib/leadUtils';
import { useToast } from '@/components/ui/use-toast';
import AddBuyerModal from '@/components/buyers/AddBuyerModal';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDistanceToNow } from 'date-fns';

const DELIVERY_STATUS_COLORS = { pending:'text-muted-foreground', sent:'text-blue-400', accepted:'text-success', rejected:'text-destructive', refunded:'text-warning', failed:'text-destructive' };

export default function BuyerDetail() {
  const { id } = useParams();
  const { currentOrg, membership } = useOrg();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [buyer, setBuyer] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const canAdmin = ['owner', 'admin'].includes(membership?.role);

  const load = async () => {
    const [b, dels] = await Promise.all([
      base44.entities.Buyer.get(id),
      base44.entities.LeadDelivery.filter({ buyer_id: id, organization_id: currentOrg?.id }, '-created_date', 100),
    ]);
    setBuyer(b);
    setDeliveries(dels);
    setLoading(false);
  };

  useEffect(() => { if (currentOrg && id) load(); }, [id, currentOrg]);

  const toggleActive = async () => {
    await base44.entities.Buyer.update(id, { active: !buyer.active });
    toast({ title: buyer.active ? 'Buyer paused' : 'Buyer activated' });
    load();
  };

  if (loading) return <div className="p-6"><Skeleton className="h-48 w-full" /></div>;
  if (!buyer) return <div className="p-6 text-muted-foreground">Buyer not found</div>;

  const capPct = buyer.daily_cap > 0 ? Math.round((buyer.current_day_count / buyer.daily_cap) * 100) : 0;
  const accepted = deliveries.filter(d => d.delivery_status === 'accepted').length;
  const acceptRate = deliveries.length > 0 ? Math.round((accepted / deliveries.length) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/buyers')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{buyer.name}</h1>
          <p className="text-sm text-muted-foreground">{buyer.contact_name} · {buyer.contact_email}</p>
        </div>
        <Badge className={`${buyer.active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'} border-0`}>
          {buyer.active ? 'Active' : 'Paused'}
        </Badge>
        {canAdmin && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => setShowEdit(true)}>
              <Edit className="w-3.5 h-3.5" /> Edit
            </Button>
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={toggleActive}>
              {buyer.active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {buyer.active ? 'Pause' : 'Activate'}
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="h-8">
          {['overview','history','performance'].map(t => (
            <TabsTrigger key={t} value={t} className="text-xs capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card><CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground mb-1">Daily Cap Usage</p>
              <p className="text-xl font-bold font-mono">{buyer.current_day_count}/{buyer.daily_cap}</p>
              <Progress value={capPct} className="h-1.5 mt-2" />
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground mb-1">Total Delivered</p>
              <p className="text-xl font-bold font-mono">{(buyer.total_delivered || 0).toLocaleString()}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground mb-1">Acceptance Rate</p>
              <p className="text-xl font-bold font-mono">{acceptRate}%</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground mb-1">Price/PVQL</p>
              <p className="text-xl font-bold font-mono text-success">{formatCents(buyer.price_per_pvql)}</p>
            </CardContent></Card>
          </div>
          <Card><CardContent className="p-4 grid grid-cols-2 gap-4 text-xs">
            <div><p className="text-[10px] text-muted-foreground">Verticals</p>
              <p>{buyer.verticals?.map(v => VERTICAL_LABELS[v] || v).join(', ') || 'All'}</p></div>
            <div><p className="text-[10px] text-muted-foreground">States</p>
              <p>{buyer.states?.join(', ') || 'All'}</p></div>
            <div><p className="text-[10px] text-muted-foreground">Delivery</p><p className="capitalize">{buyer.delivery_method}</p></div>
            <div><p className="text-[10px] text-muted-foreground">Payment Terms</p><p className="capitalize">{buyer.payment_terms?.replace('_',' ')}</p></div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="history" className="pt-4">
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Date</th>
                  <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Lead ID</th>
                  <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Status</th>
                  <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Payout</th>
                  <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Error</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.length === 0 ? (
                  <tr><td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">No deliveries yet</td></tr>
                ) : deliveries.map(d => (
                  <tr key={d.id} className="border-b border-border/50">
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{d.created_date ? formatDistanceToNow(new Date(d.created_date), {addSuffix:true}) : '—'}</td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">{d.lead_id?.slice(-8)}</td>
                    <td className="px-3 py-2"><span className={`font-medium ${DELIVERY_STATUS_COLORS[d.delivery_status]}`}>{d.delivery_status}</span></td>
                    <td className="px-3 py-2 font-mono">{d.payout ? formatCents(d.payout) : '—'}</td>
                    <td className="px-3 py-2 text-destructive/80 truncate max-w-32">{d.last_error || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold">Acceptance Rate Over Time</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">Performance charts require more data</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold">Revenue Over Time</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">Performance charts require more data</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {showEdit && (
        <AddBuyerModal buyer={buyer} onClose={() => setShowEdit(false)} onSuccess={() => { setShowEdit(false); load(); }} />
      )}
    </div>
  );
}