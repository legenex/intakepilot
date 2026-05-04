import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useOrg } from '@/lib/OrgContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Phone, MessageSquare, ArrowRightLeft, Play, Pause, Settings, Zap, BarChart3 } from 'lucide-react';
import AgentModal from '@/components/agents/AgentModal';
import AgentStatsCard from '@/components/agents/AgentStatsCard';

const TYPE_ICONS = {
  voice_outbound: Phone,
  voice_inbound: Phone,
  sms_outbound: MessageSquare,
  sms_inbound: MessageSquare,
  warm_transfer: ArrowRightLeft,
};

const TYPE_LABELS = {
  voice_outbound: 'Voice Outbound',
  voice_inbound: 'Voice Inbound',
  sms_outbound: 'SMS Outbound',
  sms_inbound: 'SMS Inbound',
  warm_transfer: 'Warm Transfer',
};

const TYPE_COLORS = {
  voice_outbound: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  voice_inbound: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  sms_outbound: 'bg-primary/10 text-primary border-primary/20',
  sms_inbound: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  warm_transfer: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

export default function Agents() {
  const { currentOrg } = useOrg();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editAgent, setEditAgent] = useState(null);

  const load = async () => {
    if (!currentOrg) return;
    const data = await base44.entities.AIAgent.filter({ organization_id: currentOrg.id }, '-created_date');
    setAgents(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [currentOrg]);

  const toggleStatus = async (agent) => {
    const newStatus = agent.status === 'active' ? 'paused' : 'active';
    await base44.entities.AIAgent.update(agent.id, { status: newStatus });
    setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: newStatus } : a));
  };

  const openEdit = (agent) => { setEditAgent(agent); setShowModal(true); };
  const openNew = () => { setEditAgent(null); setShowModal(true); };

  const activeAgents = agents.filter(a => a.status === 'active');
  const totalCalls = agents.reduce((s, a) => s + (a.total_calls_made || 0), 0);
  const totalSMS = agents.reduce((s, a) => s + (a.total_sms_sent || 0), 0);
  const totalQualified = agents.reduce((s, a) => s + (a.total_qualified || 0), 0);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">AI Agents</h1>
          <p className="text-sm text-muted-foreground">Automated voice & SMS qualification pipeline</p>
        </div>
        <Button onClick={openNew} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
          <Plus className="w-3.5 h-3.5" /> New Agent
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <AgentStatsCard label="Active Agents" value={activeAgents.length} icon={Zap} color="text-primary" />
        <AgentStatsCard label="Calls Made" value={totalCalls.toLocaleString()} icon={Phone} color="text-violet-400" />
        <AgentStatsCard label="SMS Sent" value={totalSMS.toLocaleString()} icon={MessageSquare} color="text-cyan-400" />
        <AgentStatsCard label="Qualified" value={totalQualified.toLocaleString()} icon={BarChart3} color="text-success" />
      </div>

      {/* Agent list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : agents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-14 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <p className="font-semibold">No agents yet</p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">Create your first AI agent to start automatically qualifying leads via voice or SMS.</p>
            <Button size="sm" onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2">
              <Plus className="w-3.5 h-3.5 mr-1" /> Create Agent
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {agents.map(agent => {
            const Icon = TYPE_ICONS[agent.type] || Zap;
            const convRate = agent.total_calls_made > 0
              ? ((agent.total_qualified / agent.total_calls_made) * 100).toFixed(1)
              : '—';
            return (
              <Card key={agent.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[agent.type]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{agent.name}</span>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${TYPE_COLORS[agent.type]}`}>
                          {TYPE_LABELS[agent.type]}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${agent.status === 'active' ? 'border-success/30 text-success' : agent.status === 'paused' ? 'border-warning/30 text-warning' : 'border-border text-muted-foreground'}`}>
                          {agent.status}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span>📞 {agent.total_calls_made || 0} calls</span>
                        <span>💬 {agent.total_sms_sent || 0} SMS</span>
                        <span>✅ {agent.total_qualified || 0} qualified</span>
                        <span>🔁 {agent.total_transferred || 0} transferred</span>
                        <span>📊 {convRate}% conv</span>
                        {agent.phone_number && <span>📱 {agent.phone_number}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toggleStatus(agent)}>
                        {agent.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(agent)}>
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

      {showModal && (
        <AgentModal
          agent={editAgent}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}