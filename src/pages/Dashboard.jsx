import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useOrg } from '@/lib/OrgContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, TrendingUp, Phone, FileSignature, DollarSign, Clock, AlertTriangle, CheckCircle2, ArrowRight, Upload, UserPlus, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCents, STATUS_LABELS, PIPELINE_STAGES, getLeadName } from '@/lib/leadUtils';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import PipelineFunnel from '@/components/dashboard/PipelineFunnel';
import NeedsAttentionPanel from '@/components/dashboard/NeedsAttentionPanel';
import StatCard from '@/components/dashboard/StatCard';

const DATE_RANGES = [
  { label: 'Today', value: 'today' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
];

function getDateStart(range) {
  const now = new Date();
  if (range === 'today') { const d = new Date(now); d.setHours(0,0,0,0); return d; }
  if (range === '7d') { const d = new Date(now); d.setDate(d.getDate()-7); return d; }
  if (range === '30d') { const d = new Date(now); d.setDate(d.getDate()-30); return d; }
  return new Date(now.setHours(0,0,0,0));
}

const ONBOARDING_ITEMS = [
  { key: 'org', label: 'Set up organization', href: '/settings/organization' },
  { key: 'buyer', label: 'Add your first buyer', href: '/buyers' },
  { key: 'import', label: 'Import your first leads', href: '/leads/import' },
  { key: 'deliver', label: 'Deliver a lead to a buyer', href: '/leads' },
];

export default function Dashboard() {
  const { currentOrg } = useOrg();
  const navigate = useNavigate();
  const [range, setRange] = useState('today');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [completedItems, setCompletedItems] = useState({});

  const loadStats = useCallback(async () => {
    if (!currentOrg) return;
    const since = getDateStart(range).toISOString();
    const [leads, deliveries, buyers] = await Promise.all([
      base44.entities.Lead.filter({ organization_id: currentOrg.id, deleted_at: null }, '-created_date', 500),
      base44.entities.LeadDelivery.filter({ organization_id: currentOrg.id }, '-created_date', 200),
      base44.entities.Buyer.filter({ organization_id: currentOrg.id }),
    ]);

    const inRange = leads.filter(l => l.created_date >= since);
    const pvqls = inRange.filter(l => ['pvql','retainer_signed','sold'].includes(l.status));
    const retainers = inRange.filter(l => ['retainer_signed','sold'].includes(l.status));
    const sold = inRange.filter(l => l.status === 'sold');
    const revenue = deliveries
      .filter(d => d.delivered_at >= since && d.delivery_status === 'accepted')
      .reduce((s, d) => s + (d.payout || 0), 0);

    setStats({
      leadsToday: inRange.length,
      qualifiedToday: inRange.filter(l => ['qualified_sms','phone_verified','pvql','retainer_signed','sold'].includes(l.status)).length,
      pvqlsToday: pvqls.length,
      retainersToday: retainers.length,
      revenueToday: revenue,
      avgTimeToVerify: null,
      totalLeads: leads.length,
      totalBuyers: buyers.length,
    });

    // Check onboarding
    const done = {
      org: !!currentOrg.name,
      buyer: buyers.length > 0,
      import: leads.length > 0,
      deliver: deliveries.length > 0,
    };
    setCompletedItems(done);
    setOnboardingDone(Object.values(done).every(Boolean));
    setLoading(false);
  }, [currentOrg, range]);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 15000);
    return () => clearInterval(interval);
  }, [loadStats]);

  if (!currentOrg) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No organization found. <Link to="/onboarding" className="text-primary underline">Set one up</Link>.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">
            {user ? `Good ${getGreeting()}, ${user.full_name?.split(' ')[0]}` : 'Dashboard'}
          </h1>
          <p className="text-sm text-muted-foreground">{currentOrg.name} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {DATE_RANGES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => navigate('/leads/import')} className="h-8 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
            <Upload className="w-3.5 h-3.5" /> Import
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {loading ? Array.from({length:6}).map((_,i) => (
          <Card key={i}><CardContent className="p-4"><Skeleton className="h-8 w-16 mb-2" /><Skeleton className="h-3 w-24" /></CardContent></Card>
        )) : (<>
          <StatCard icon={Users} label="Leads" value={stats.leadsToday} color="text-primary" />
          <StatCard icon={TrendingUp} label="Qualified" value={stats.qualifiedToday} color="text-blue-400" />
          <StatCard icon={Phone} label="PVQLs" value={stats.pvqlsToday} color="text-violet-400" />
          <StatCard icon={FileSignature} label="Retainers" value={stats.retainersToday} color="text-success" />
          <StatCard icon={DollarSign} label="Revenue" value={formatCents(stats.revenueToday)} color="text-success" raw />
          <StatCard icon={Clock} label="Avg Verify" value={stats.avgTimeToVerify ? `${stats.avgTimeToVerify}m` : '—'} color="text-muted-foreground" raw />
        </>)}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <PipelineFunnel orgId={currentOrg.id} range={range} />
          <NeedsAttentionPanel orgId={currentOrg.id} />
        </div>
        <div className="space-y-4">
          <ActivityFeed orgId={currentOrg.id} />
          {!onboardingDone && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Getting Started
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 pb-4">
                {ONBOARDING_ITEMS.map(item => (
                  <Link key={item.key} to={item.href} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors group">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${completedItems[item.key] ? 'border-success bg-success' : 'border-muted-foreground'}`}>
                      {completedItems[item.key] && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-xs ${completedItems[item.key] ? 'line-through text-muted-foreground' : ''}`}>{item.label}</span>
                    <ArrowRight className="w-3 h-3 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}