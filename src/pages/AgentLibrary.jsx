import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useOrg } from '@/lib/OrgContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Plus, Phone, MessageSquare, Zap, Settings, Play, Pause,
  BarChart3, CheckCircle2, ArrowRightLeft, Search, AlertTriangle
} from 'lucide-react';
import CreateAgentModal from '@/components/agents/CreateAgentModal';
import { formatDistanceToNow } from 'date-fns';

const TYPE_ICONS = { voice: Phone, sms: MessageSquare, hybrid: Zap };
const TYPE_COLORS = {
  voice: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  sms: 'bg-primary/10 text-primary border-primary/20',
  hybrid: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};
const PROVIDER_COLORS = {
  retell: 'bg-violet-500/10 text-violet-400',
  vapi: 'bg-blue-500/10 text-blue-400',
  twilio: 'bg-red-500/10 text-red-400',
};
const STATUS_COLORS = {
  active: 'border-success/30 text-success bg-success/5',
  paused: 'border-warning/30 text-warning bg-warning/5',
  draft: 'border-border text-muted-foreground',
};

export default function AgentLibrary() {
  const { currentOrg, membership } = useOrg();
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [credentials, setCredentials] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  const canEdit = ['owner', 'admin'].includes(membership?.role);

  const load = async () => {
    if (!currentOrg) return;
    const [agentData, credData] = await Promise.all([
      base44.entities.Agent.filter({ organization_id: currentOrg.id }, '-created_date'),
      base44.entities.ProviderCredential.filter({ organization_id: currentOrg.id }),
    ]);
    setAgents(agentData);
    const credMap = {};
    credData.forEach(c => { credMap[c.provider] = c; });
    setCredentials(credMap);
    setLoading(false);
  };

  useEffect(() => { load(); }, [currentOrg]);

  const toggleStatus = async (e, agent) => {
    e.stopPropagation();
    const newStatus = agent.status === 'active' ? 'paused' : 'active';
    await base44.entities.Agent.update(agent.id, { status: newStatus });
    setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: newStatus } : a));
  };

  const anyConnected = Object.values(credentials).some(c => c.status === 'connected');

  const filtered = agents.filter(a => {
    if (filterType !== 'all' && a.type !== filterType) return false;
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeCount = agents.filter(a => a.status === 'active').length;
  const syncedCount = agents.filter(a => a.provider_agent_id).length;

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold">AI Agents</h1>
          <p className="text-sm text-muted-foreground">
            {activeCount} active · {syncedCount} synced to provider
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => setShowCreate(true)} size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Create Agent
          </Button>
        )}
      </div>

      {/* No providers warning */}
      {!loading && !anyConnected && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-warning/30 bg-warning/5">
          <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold">No providers connected</p>
            <p className="text-xs text-muted-foreground mt-0.5">Test calls and SMS are disabled until you connect a provider.</p>
            <Button size="sm" variant="link" className="h-5 p-0 text-xs text-primary mt-1"
              onClick={() => navigate('/integrations')}>
              Set up Integrations →
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Agents', value: agents.length, color: 'text-foreground' },
          { label: 'Active', value: activeCount, color: 'text-success' },
          { label: 'Synced', value: syncedCount, color: 'text-primary' },
          { label: 'Providers', value: Object.values(credentials).filter(c => c.status === 'connected').length, color: 'text-violet-400' },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
          </CardContent></Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-40 max-w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search agents..."
            className="pl-8 h-8 text-xs" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="voice">Voice</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Agent list */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-14 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <p className="font-semibold">{agents.length === 0 ? 'No agents yet' : 'No agents match filters'}</p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              {agents.length === 0 ? 'Create your first AI agent from a template or from scratch.' : 'Try adjusting your filters.'}
            </p>
            {agents.length === 0 && canEdit && (
              <Button size="sm" onClick={() => setShowCreate(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2">
                <Plus className="w-3.5 h-3.5 mr-1" /> Create Agent
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(agent => {
            const Icon = TYPE_ICONS[agent.type] || Zap;
            const providerCred = credentials[agent.provider];
            const providerOk = providerCred?.status === 'connected';
            const stats = agent.stats_cache || {};
            return (
              <Card key={agent.id}
                className="hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => navigate(`/agents/${agent.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[agent.type] || 'bg-muted'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{agent.name}</span>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${TYPE_COLORS[agent.type]}`}>
                          {agent.type}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 capitalize ${PROVIDER_COLORS[agent.provider] || ''}`}>
                          {agent.provider}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${STATUS_COLORS[agent.status]}`}>
                          {agent.status}
                        </Badge>
                        {!agent.provider_agent_id && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-muted text-muted-foreground">
                            not synced
                          </Badge>
                        )}
                        {!providerOk && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-warning/30 text-warning">
                            <AlertTriangle className="w-2.5 h-2.5 mr-1" />provider offline
                          </Badge>
                        )}
                      </div>
                      {agent.description && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">{agent.description}</p>
                      )}
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span>{stats.calls_7d ?? '—'} calls (7d)</span>
                        <span>{stats.success_rate != null ? `${Math.round(stats.success_rate * 100)}%` : '—'} success</span>
                        <span>{agent.last_used_at ? formatDistanceToNow(new Date(agent.last_used_at), { addSuffix: true }) : 'never used'}</span>
                        {agent.last_synced_at && (
                          <span>synced {formatDistanceToNow(new Date(agent.last_synced_at), { addSuffix: true })}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => toggleStatus(e, agent)}
                        disabled={!canEdit}>
                        {agent.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7"
                        onClick={() => navigate(`/agents/${agent.id}`)}>
                        <Settings className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {showCreate && (
        <CreateAgentModal
          orgId={currentOrg?.id}
          onClose={() => setShowCreate(false)}
          onSuccess={(agentId) => { setShowCreate(false); navigate(`/agents/${agentId}`); }}
        />
      )}
    </div>
  );
}