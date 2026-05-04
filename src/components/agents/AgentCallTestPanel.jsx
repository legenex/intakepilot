import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { startCall } from '@/functions/startCall';
import { useToast } from '@/components/ui/use-toast';
import { Phone, PhoneOff, Loader2, AlertTriangle, CheckCircle2, Clock, MessageSquare } from 'lucide-react';

export default function AgentCallTestPanel({ agent, orgId, credentials, canEdit }) {
  const { toast } = useToast();
  const [phone, setPhone] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [calling, setCalling] = useState(false);
  const [activeCall, setActiveCall] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [showOverride, setShowOverride] = useState(false);
  const [pollInterval, setPollInterval] = useState(null);
  const [liveTranscript, setLiveTranscript] = useState([]);

  useEffect(() => {
    return () => { if (pollInterval) clearInterval(pollInterval); };
  }, [pollInterval]);

  const providerConnected = agent?.provider && credentials[agent.provider]?.status === 'connected';
  const agentSynced = !!agent?.provider_agent_id;

  const startTestCall = async (withOverride = false) => {
    if (!phone) { toast({ title: 'Enter a phone number', variant: 'destructive' }); return; }
    setCalling(true);
    setCompliance(null);
    setShowOverride(false);

    const mockLead = {
      id: 'test',
      phone,
      first_name: 'Test',
      last_name: 'Lead',
      state: 'TX',
      vertical: 'auto_mva',
      status: 'new',
      tags: []
    };

    const res = await startCall({
      agent_id: agent.id,
      lead_id: 'test',
      organization_id: orgId,
      override_reason: withOverride ? overrideReason : undefined,
      mock_lead_data: mockLead
    });

    const result = res.data;

    if (result?.compliance && !result.compliance.allowed) {
      setCompliance(result.compliance);
      setCalling(false);
      return;
    }

    if (result?.compliance?.warnings?.length > 0 && !withOverride) {
      setCompliance(result.compliance);
      setShowOverride(true);
      setCalling(false);
      return;
    }

    if (result?.error) {
      toast({ title: 'Call failed', description: result.error, variant: 'destructive' });
      setCalling(false);
      return;
    }

    if (result?.success) {
      setActiveCall({ call_id: result.call_id, provider_call_id: result.provider_call_id, started_at: new Date() });
      toast({ title: 'Call started', description: `Ringing ${phone}...` });
      // Poll for transcript updates
      const interval = setInterval(async () => {
        const calls = await base44.entities.Call.filter({ id: result.call_id });
        if (calls[0]) {
          const call = calls[0];
          if (call.transcript) setLiveTranscript(Array.isArray(call.transcript) ? call.transcript : []);
          if (['completed', 'failed', 'no_answer', 'voicemail'].includes(call.status)) {
            clearInterval(interval);
            setActiveCall(prev => ({ ...prev, status: call.status, outcome: call.outcome }));
          }
        }
      }, 3000);
      setPollInterval(interval);
    }
    setCalling(false);
  };

  const blocked = compliance && !compliance.allowed;

  if (!agent) return (
    <div className="text-center py-12 text-muted-foreground text-sm">Save agent first to test calls</div>
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold mb-1">Test Call</p>
        <p className="text-xs text-muted-foreground">Place a test call from this agent to a real phone number. Uses live provider — charges may apply.</p>
      </div>

      {!providerConnected && (
        <div className="p-3 rounded-lg border border-warning/30 bg-warning/5 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
          <p className="text-xs">Connect {agent.provider === 'retell' ? 'Retell AI' : 'Vapi'} in Integrations before placing test calls.</p>
        </div>
      )}

      {!agentSynced && providerConnected && (
        <div className="p-3 rounded-lg border border-warning/30 bg-warning/5 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
          <p className="text-xs">Sync this agent to the provider first using the "Sync to Provider" button above.</p>
        </div>
      )}

      <div>
        <Label className="text-xs mb-1 block">Phone Number to Call</Label>
        <Input value={phone} onChange={e => setPhone(e.target.value)}
          placeholder="+15551234567" className="h-8 text-xs font-mono" />
      </div>

      {/* Compliance warnings */}
      {compliance && compliance.warnings.length > 0 && (
        <div className="p-3 rounded-lg border border-warning/30 bg-warning/5 space-y-2">
          <p className="text-xs font-semibold text-warning flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Compliance Warnings
          </p>
          {compliance.warnings.map((w, i) => (
            <p key={i} className="text-xs text-muted-foreground">• {w.message}</p>
          ))}
        </div>
      )}

      {/* Hard blocks */}
      {blocked && compliance.blocks.map((b, i) => (
        <div key={i} className="p-3 rounded-lg border border-destructive/30 bg-destructive/5">
          <p className="text-xs font-semibold text-destructive">🚫 This call is blocked</p>
          <p className="text-xs text-muted-foreground mt-1">{b.message}</p>
          <a href="/legal/tcpa" target="_blank" className="text-xs text-primary underline mt-1 inline-block">Why is this blocked? →</a>
        </div>
      ))}

      {/* Override form */}
      {showOverride && !blocked && (
        <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 space-y-2">
          <p className="text-xs font-semibold text-amber-500">Override Required</p>
          <p className="text-xs text-muted-foreground">Explain why you're proceeding despite the warnings (required for audit trail):</p>
          <Textarea value={overrideReason} onChange={e => setOverrideReason(e.target.value)}
            className="text-xs min-h-12 resize-none" placeholder="e.g. Lead reconfirmed consent verbally during inbound call..." />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setShowOverride(false); setCompliance(null); }}>Cancel</Button>
            <Button size="sm" className="h-7 text-xs bg-amber-500 text-white hover:bg-amber-600 gap-1"
              onClick={() => startTestCall(true)} disabled={!overrideReason.trim() || calling}>
              {calling ? <Loader2 className="w-3 h-3 animate-spin" /> : <Phone className="w-3 h-3" />}
              Override & Call
            </Button>
          </div>
        </div>
      )}

      {/* Active call */}
      {activeCall && (
        <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <p className="text-xs font-semibold">
              {activeCall.status ? `Call ${activeCall.status}` : 'Call in progress...'}
            </p>
            {activeCall.outcome && (
              <Badge variant="outline" className="text-[10px] px-1.5 h-5">{activeCall.outcome}</Badge>
            )}
          </div>
          {liveTranscript.length > 0 && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {liveTranscript.map((t, i) => (
                <div key={i} className={`text-xs flex gap-2 ${t.speaker === 'agent' ? 'text-primary' : 'text-foreground'}`}>
                  <span className="font-semibold capitalize flex-shrink-0">{t.speaker}:</span>
                  <span>{t.text}</span>
                </div>
              ))}
            </div>
          )}
          {!activeCall.status && (
            <p className="text-[10px] text-muted-foreground">Polling for transcript updates every 3s...</p>
          )}
        </div>
      )}

      {!showOverride && !blocked && (
        <Button
          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => startTestCall(false)}
          disabled={calling || !providerConnected || !agentSynced || !phone || !canEdit}
        >
          {calling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
          {calling ? 'Starting call...' : 'Start Test Call'}
        </Button>
      )}

      <p className="text-[10px] text-muted-foreground text-center">
        Test calls use live provider infrastructure. Standard per-minute charges apply.
      </p>
    </div>
  );
}