import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Phone, PhoneOutgoing, PhoneIncoming, Play, Mic, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const STATUS_STYLES = {
  completed: 'bg-success/10 text-success',
  no_answer: 'bg-warning/10 text-warning',
  failed: 'bg-destructive/10 text-destructive',
  busy: 'bg-warning/10 text-warning',
  voicemail: 'bg-muted text-muted-foreground',
  in_progress: 'bg-primary/10 text-primary',
};

function fmtDuration(secs) {
  if (!secs) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function LeadCallsTab({ lead, orgId }) {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!lead?.id) return;
    base44.entities.CallLog.filter({ organization_id: orgId, lead_id: lead.id }, '-created_date', 20)
      .then(data => { setCalls(data); setLoading(false); });
  }, [lead?.id]);

  if (loading) return <div className="p-4 space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>;

  if (calls.length === 0) return (
    <div className="p-6 text-center text-sm text-muted-foreground">
      <Phone className="w-8 h-8 mx-auto mb-2 opacity-30" />
      No calls yet
    </div>
  );

  return (
    <div className="p-4 space-y-2">
      {calls.map(call => (
        <div key={call.id}>
          <div
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 cursor-pointer transition-colors"
            onClick={() => setExpanded(expanded === call.id ? null : call.id)}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${STATUS_STYLES[call.status] || 'bg-muted'}`}>
              {call.direction === 'outbound' ? <PhoneOutgoing className="w-3.5 h-3.5" /> : <PhoneIncoming className="w-3.5 h-3.5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${STATUS_STYLES[call.status] || ''}`}>{call.status}</Badge>
                {call.qualification_result && call.qualification_result !== 'pending' && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{call.qualification_result}</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {call.started_at ? formatDistanceToNow(new Date(call.started_at), { addSuffix: true }) : ''}
                {' · '}{fmtDuration(call.duration_seconds)}
                {call.attempt_number > 1 ? ` · attempt #${call.attempt_number}` : ''}
              </p>
            </div>
            <div className="flex gap-1">
              {call.recording_url && (
                <Button size="icon" variant="ghost" className="h-6 w-6" asChild onClick={e => e.stopPropagation()}>
                  <a href={call.recording_url} target="_blank" rel="noopener noreferrer"><Play className="w-3 h-3" /></a>
                </Button>
              )}
              {call.transcript && <Mic className="w-3 h-3 text-muted-foreground" />}
            </div>
          </div>
          {expanded === call.id && (call.ai_summary || call.transcript) && (
            <div className="mx-3 mb-2 p-3 rounded-b-lg bg-muted/40 border border-t-0 border-border space-y-2">
              {call.ai_summary && (
                <div>
                  <p className="text-[10px] font-semibold text-primary mb-0.5">AI Summary</p>
                  <p className="text-xs">{call.ai_summary}</p>
                </div>
              )}
              {call.transcript && (
                <div>
                  <p className="text-[10px] font-semibold mb-0.5">Transcript</p>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">{call.transcript}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}