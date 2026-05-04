import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useOrg } from '@/lib/OrgContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, Mic, ArrowRightLeft, Play, Download } from 'lucide-react';
import { getLeadName } from '@/lib/leadUtils';
import { formatDistanceToNow, format } from 'date-fns';

const STATUS_STYLES = {
  completed: 'bg-success/10 text-success border-success/20',
  no_answer: 'bg-warning/10 text-warning border-warning/20',
  failed: 'bg-destructive/10 text-destructive border-destructive/20',
  busy: 'bg-warning/10 text-warning border-warning/20',
  voicemail: 'bg-muted text-muted-foreground',
  in_progress: 'bg-primary/10 text-primary border-primary/20',
  transferred: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
};

const QUAL_STYLES = {
  qualified: 'bg-success/10 text-success',
  disqualified: 'bg-destructive/10 text-destructive',
  transferred: 'bg-violet-500/10 text-violet-400',
  no_answer: 'bg-warning/10 text-warning',
  pending: 'bg-muted text-muted-foreground',
};

function fmtDuration(secs) {
  if (!secs) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function CallCenter() {
  const { currentOrg } = useOrg();
  const [calls, setCalls] = useState([]);
  const [leads, setLeads] = useState({});
  const [agents, setAgents] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedCall, setSelectedCall] = useState(null);

  useEffect(() => { loadCalls(); }, [currentOrg, filter]);

  const loadCalls = async () => {
    if (!currentOrg) return;
    setLoading(true);
    const query = { organization_id: currentOrg.id };
    if (filter !== 'all') query.qualification_result = filter;
    const [callData, agentData] = await Promise.all([
      base44.entities.CallLog.filter(query, '-created_date', 100),
      base44.entities.AIAgent.filter({ organization_id: currentOrg.id }),
    ]);
    setCalls(callData);
    const agentMap = {};
    agentData.forEach(a => { agentMap[a.id] = a; });
    setAgents(agentMap);
    // Batch-fetch unique leads
    const leadIds = [...new Set(callData.map(c => c.lead_id).filter(Boolean))];
    if (leadIds.length) {
      const leadData = await Promise.all(leadIds.slice(0, 50).map(id =>
        base44.entities.Lead.filter({ id }).then(r => r[0]).catch(() => null)
      ));
      const leadMap = {};
      leadData.forEach(l => { if (l) leadMap[l.id] = l; });
      setLeads(leadMap);
    }
    setLoading(false);
  };

  // Summary stats
  const total = calls.length;
  const connected = calls.filter(c => c.status === 'completed').length;
  const qualified = calls.filter(c => c.qualification_result === 'qualified').length;
  const transferred = calls.filter(c => c.qualification_result === 'transferred').length;
  const avgDuration = calls.length > 0
    ? Math.round(calls.filter(c => c.duration_seconds).reduce((s, c) => s + (c.duration_seconds || 0), 0) / calls.filter(c => c.duration_seconds).length)
    : 0;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold">Call Center</h1>
          <p className="text-sm text-muted-foreground">AI voice call logs & recordings</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Calls</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="transferred">Transferred</SelectItem>
            <SelectItem value="disqualified">Disqualified</SelectItem>
            <SelectItem value="no_answer">No Answer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Calls', value: total, icon: Phone, color: 'text-foreground' },
          { label: 'Connected', value: connected, icon: PhoneIncoming, color: 'text-success' },
          { label: 'Qualified', value: qualified, icon: PhoneOutgoing, color: 'text-primary' },
          { label: 'Transferred', value: transferred, icon: ArrowRightLeft, color: 'text-violet-400' },
          { label: 'Avg Duration', value: fmtDuration(avgDuration), icon: Clock, color: 'text-muted-foreground', raw: true },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-xl font-bold">{s.raw ? s.value : s.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call log table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Call Log</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
          ) : calls.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No calls yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    {['Lead', 'Agent', 'Direction', 'Status', 'Qualification', 'Duration', 'Attempt', 'Time', ''].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {calls.map(call => {
                    const lead = leads[call.lead_id];
                    const agent = agents[call.agent_id];
                    return (
                      <tr key={call.id} className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => setSelectedCall(selectedCall?.id === call.id ? null : call)}>
                        <td className="px-4 py-2.5 font-medium">{lead ? getLeadName(lead) : '—'}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{agent?.name || '—'}</td>
                        <td className="px-4 py-2.5">
                          {call.direction === 'outbound'
                            ? <PhoneOutgoing className="w-3.5 h-3.5 text-primary" />
                            : <PhoneIncoming className="w-3.5 h-3.5 text-success" />}
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${STATUS_STYLES[call.status] || ''}`}>
                            {call.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5">
                          {call.qualification_result && (
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${QUAL_STYLES[call.qualification_result] || ''}`}>
                              {call.qualification_result}
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">{fmtDuration(call.duration_seconds)}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">#{call.attempt_number || 1}</td>
                        <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                          {call.started_at ? formatDistanceToNow(new Date(call.started_at), { addSuffix: true }) : '—'}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex gap-1">
                            {call.recording_url && (
                              <Button size="icon" variant="ghost" className="h-6 w-6" asChild>
                                <a href={call.recording_url} target="_blank" rel="noopener noreferrer"><Play className="w-3 h-3" /></a>
                              </Button>
                            )}
                            {call.transcript && (
                              <Button size="icon" variant="ghost" className="h-6 w-6" title="View transcript">
                                <Mic className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expanded call detail */}
      {selectedCall && (
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Call Detail — {selectedCall.provider_call_id || selectedCall.id}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedCall.ai_summary && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs font-semibold text-primary mb-1">AI Summary</p>
                <p className="text-sm">{selectedCall.ai_summary}</p>
              </div>
            )}
            {selectedCall.transcript && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs font-semibold mb-1">Transcript</p>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">{selectedCall.transcript}</p>
              </div>
            )}
            {selectedCall.qualification_data && Object.keys(selectedCall.qualification_data).length > 0 && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs font-semibold mb-1">Qualification Data</p>
                <pre className="text-xs text-muted-foreground overflow-auto">{JSON.stringify(selectedCall.qualification_data, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}