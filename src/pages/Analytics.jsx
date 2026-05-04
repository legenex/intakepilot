import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useOrg } from '@/lib/OrgContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Download } from 'lucide-react';
import { STATUS_LABELS, SOURCE_LABELS, VERTICAL_LABELS, PIPELINE_STAGES, formatCents } from '@/lib/leadUtils';

const COLORS = ['#22d3ee','#3b82f6','#8b5cf6','#ec4899','#10b981','#f59e0b','#ef4444','#6366f1'];

function getDateStart(range) {
  const now = new Date();
  if (range === '7d') { const d = new Date(now); d.setDate(d.getDate()-7); return d; }
  if (range === '30d') { const d = new Date(now); d.setDate(d.getDate()-30); return d; }
  if (range === '90d') { const d = new Date(now); d.setDate(d.getDate()-90); return d; }
  const d = new Date(now); d.setDate(d.getDate()-30); return d;
}

function exportCSV(data, name) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(r => headers.map(h => r[h] ?? '').join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download = `${name}.csv`; a.click();
}

export default function Analytics() {
  const { currentOrg } = useOrg();
  const [range, setRange] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!currentOrg) return;
    setLoading(true);
    const since = getDateStart(range).toISOString();

    const [leads, deliveries, buyers] = await Promise.all([
      base44.entities.Lead.filter({ organization_id: currentOrg.id, deleted_at: null }, '-created_date', 1000),
      base44.entities.LeadDelivery.filter({ organization_id: currentOrg.id }, '-created_date', 500),
      base44.entities.Buyer.filter({ organization_id: currentOrg.id }),
    ]);

    const inRange = leads.filter(l => l.created_date >= since);

    // Funnel
    const funnel = PIPELINE_STAGES.map(s => ({
      stage: STATUS_LABELS[s],
      count: inRange.filter(l => {
        const stIdx = PIPELINE_STAGES.indexOf(s);
        const lIdx = PIPELINE_STAGES.indexOf(l.status);
        return lIdx >= stIdx || ['retainer_signed','sold'].includes(l.status) && stIdx <= 4;
      }).length,
    }));

    // By source
    const sourceCounts = {};
    inRange.forEach(l => { sourceCounts[l.source || 'unknown'] = (sourceCounts[l.source || 'unknown'] || 0) + 1; });
    const bySource = Object.entries(sourceCounts).map(([k,v]) => ({ name: SOURCE_LABELS[k]||k, count: v })).sort((a,b) => b.count - a.count);

    // By vertical
    const vertCounts = {};
    inRange.forEach(l => { vertCounts[l.vertical || 'unknown'] = (vertCounts[l.vertical || 'unknown'] || 0) + 1; });
    const byVertical = Object.entries(vertCounts).map(([k,v]) => ({ name: VERTICAL_LABELS[k]||k, count: v }));

    // PVQL score dist
    const scoreDist = Array.from({length:10}, (_,i) => ({
      score: i+1,
      count: inRange.filter(l => l.pvql_score === i+1).length,
    }));

    // Disposition
    const dispCounts = {};
    inRange.forEach(l => { dispCounts[l.disposition || 'pending'] = (dispCounts[l.disposition || 'pending'] || 0) + 1; });
    const disposition = Object.entries(dispCounts).map(([k,v]) => ({ name: k, value: v }));

    // Buyer leaderboard
    const buyerMap = {};
    buyers.forEach(b => { buyerMap[b.id] = b; });
    const buyerDeliveries = {};
    deliveries.filter(d => d.created_date >= since).forEach(d => {
      if (!buyerDeliveries[d.buyer_id]) buyerDeliveries[d.buyer_id] = { sent:0, accepted:0, revenue:0 };
      buyerDeliveries[d.buyer_id].sent++;
      if (d.delivery_status === 'accepted') { buyerDeliveries[d.buyer_id].accepted++; buyerDeliveries[d.buyer_id].revenue += d.payout || 0; }
    });
    const buyerLeaderboard = Object.entries(buyerDeliveries).map(([id, stats]) => ({
      name: buyerMap[id]?.name || id.slice(-8),
      sent: stats.sent,
      accepted: stats.accepted,
      acceptRate: Math.round((stats.accepted / stats.sent) * 100),
      revenue: stats.revenue,
    })).sort((a,b) => b.revenue - a.revenue);

    setData({ funnel, bySource, byVertical, scoreDist, disposition, buyerLeaderboard, totalLeads: inRange.length });
    setLoading(false);
  }, [currentOrg, range]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Analytics</h1>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 Days</SelectItem>
            <SelectItem value="30d">30 Days</SelectItem>
            <SelectItem value="90d">90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({length:6}).map((_,i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Funnel */}
          <Card className="sm:col-span-2">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Pipeline Funnel ({data.totalLeads.toLocaleString()} leads)</CardTitle>
              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => exportCSV(data.funnel, 'funnel')}>
                <Download className="w-3 h-3" /> CSV
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data.funnel} barSize={40}>
                  <XAxis dataKey="stage" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4,4,0,0]}>
                    {data.funnel.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* By Source */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Leads by Source</CardTitle>
              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => exportCSV(data.bySource, 'source')}>
                <Download className="w-3 h-3" />
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={data.bySource} layout="vertical" barSize={14}>
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#22d3ee" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Disposition */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Disposition Breakdown</CardTitle>
              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => exportCSV(data.disposition, 'disposition')}>
                <Download className="w-3 h-3" />
              </Button>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={140}>
                <PieChart>
                  <Pie data={data.disposition} dataKey="value" innerRadius={35} outerRadius={60} paddingAngle={2}>
                    {data.disposition.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5">
                {data.disposition.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs capitalize">{d.name}</span>
                    <span className="text-xs font-mono text-muted-foreground ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* PVQL Score */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">PVQL Score Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={data.scoreDist} barSize={18}>
                  <XAxis dataKey="score" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* By Vertical */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Leads by Vertical</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={data.byVertical} layout="vertical" barSize={14}>
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Buyer Leaderboard */}
          <Card className="sm:col-span-2">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Buyer Performance Leaderboard</CardTitle>
              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => exportCSV(data.buyerLeaderboard, 'buyers')}>
                <Download className="w-3 h-3" /> CSV
              </Button>
            </CardHeader>
            <CardContent>
              {data.buyerLeaderboard.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No delivery data in period</p>
              ) : (
                <table className="w-full text-xs">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Buyer</th>
                      <th className="px-2 py-1.5 text-right font-semibold text-muted-foreground">Sent</th>
                      <th className="px-2 py-1.5 text-right font-semibold text-muted-foreground">Accepted</th>
                      <th className="px-2 py-1.5 text-right font-semibold text-muted-foreground">Accept Rate</th>
                      <th className="px-2 py-1.5 text-right font-semibold text-muted-foreground">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.buyerLeaderboard.map((b, i) => (
                      <tr key={i} className="border-b border-border/40">
                        <td className="px-2 py-1.5 font-medium">{b.name}</td>
                        <td className="px-2 py-1.5 text-right font-mono">{b.sent}</td>
                        <td className="px-2 py-1.5 text-right font-mono">{b.accepted}</td>
                        <td className="px-2 py-1.5 text-right font-mono text-success">{b.acceptRate}%</td>
                        <td className="px-2 py-1.5 text-right font-mono font-semibold">{formatCents(b.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}