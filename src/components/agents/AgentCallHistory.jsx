import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Play, Mic, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getLeadName } from '@/lib/leadUtils';

function fmtDuration(s) {
  if (!s) return '—';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

const OUTCOME_COLORS = {
  qualified: 'bg-success/10 text-success',
  disqualified: 'bg-destructive/10 text-destructive',
  transferred: 'bg-violet-500/10 text-violet-400',
  no_answer: 'bg-warning/10 text-warning',
  pending: 'bg-muted text-muted-foreground',
  failed: 'bg-destructive/10 text-destructive',
};

export default function AgentCallHistory({ agentId, orgId }) {
  const [calls, setCalls] = useState([]);
  const [leads, setLeads] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!agentId) return;
    base44.entities.Call.filter({ agent_id: agentId, organization_id: orgId }, '-created_date', 50)
      .then(async (data) => {
        setCalls(data);
        const ids = [...new Set(data.map(c => c.lead_id).filter(Boolean))];
        if (ids.length) {
          const leadData = await Promise.all(ids.slice(0, 30).map(id =>
            base44.entities.Lead.filter({ id }).then(r => r[0]).catch(() => null)
          ));
          const m = {};
          leadData.forEach(l => { if (l) m[l.id] = l; });
          setLeads(m);
        }
        setLoading(false);
      });
  }, [agentId]);

  if (loading) return (
    <div className="p-4 space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-10 rounded-lg" />)}</div>
  );

  if (calls.length === 0) return (
    <div className="p-8 text-center text-sm text-muted-foreground">No calls yet for this agent</div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            {['Lead', 'Status', 'Outcome', 'Duration', 'PVQL Score', 'Cost', 'Time', ''].map(h => (
              <th key={h} className="px-4 py-2.5 text-left font-medium text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calls.map(call => {
            const lead = leads[call.lead_id];
            return (
              <React.Fragment key={call.id}>
                <tr className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => setExpanded(expanded === call.id ? null : call.id)}>
                  <td className="px-4 py-2.5 font-medium">{lead ? getLeadName(lead) : '—'}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{call.status}</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${OUTCOME_COLORS[call.outcome] || ''}`}>
                      {call.outcome || '—'}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{fmtDuration(call.duration_s)}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{call.pvql_score_after_call ? `${call.pvql_score_after_call}/10` : '—'}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{call.cost_cents ? `$${(call.cost_cents/100).toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                    {call.started_at ? formatDistanceToNow(new Date(call.started_at), { addSuffix: true }) : '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1">
                      {call.recording_url && (
                        <Button size="icon" variant="ghost" className="h-6 w-6" asChild onClick={e => e.stopPropagation()}>
                          <a href={call.recording_url} target="_blank" rel="noopener noreferrer"><Play className="w-3 h-3" /></a>
                        </Button>
                      )}
                      <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${expanded === call.id ? 'rotate-180' : ''}`} />
                    </div>
                  </td>
                </tr>
                {expanded === call.id && (
                  <tr className="border-b border-border/50">
                    <td colSpan={8} className="px-4 py-3 bg-muted/20">
                      <div className="space-y-2">
                        {call.summary && (
                          <div>
                            <p className="text-[10px] font-semibold text-primary mb-0.5">Summary</p>
                            <p className="text-xs">{call.summary}</p>
                          </div>
                        )}
                        {call.structured_data && Object.keys(call.structured_data).length > 0 && (
                          <div>
                            <p className="text-[10px] font-semibold mb-0.5">Extracted Data</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(call.structured_data).map(([k, v]) => (
                                <span key={k} className="text-[10px] bg-card border border-border rounded px-1.5 py-0.5">
                                  <span className="text-muted-foreground">{k}: </span>{String(v)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}