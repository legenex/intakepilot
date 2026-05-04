import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Phone, AlertTriangle, Shield, CheckCircle2, XCircle } from 'lucide-react';
import { startCall } from '@/functions/startCall';
import { useToast } from '@/components/ui/use-toast';
import { getLeadName } from '@/lib/leadUtils';

export default function CallWithAgentModal({ lead, orgId, onClose, onSuccess }) {
  const { toast } = useToast();
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [credentials, setCredentials] = useState({});
  const [calling, setCalling] = useState(false);
  const [compliance, setCompliance] = useState(null);
  const [showOverride, setShowOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  useEffect(() => {
    Promise.all([
      base44.entities.Agent.filter({ organization_id: orgId, status: 'active' }, '-created_date'),
      base44.entities.ProviderCredential.filter({ organization_id: orgId }),
    ]).then(([agentData, credData]) => {
      const voiceAgents = agentData.filter(a => a.type === 'voice' || a.type === 'hybrid');
      setAgents(voiceAgents);
      if (voiceAgents.length > 0) setSelectedAgentId(voiceAgents[0].id);
      const credMap = {};
      credData.forEach(c => { credMap[c.provider] = c; });
      setCredentials(credMap);
    });
  }, [orgId]);

  const selectedAgent = agents.find(a => a.id === selectedAgentId);
  const providerConnected = selectedAgent && credentials[selectedAgent.provider]?.status === 'connected';
  const agentSynced = !!selectedAgent?.provider_agent_id;

  const handleCall = async (withOverride = false) => {
    if (!selectedAgentId) { toast({ title: 'Select an agent', variant: 'destructive' }); return; }
    setCalling(true);
    setCompliance(null);

    const res = await startCall({
      agent_id: selectedAgentId,
      lead_id: lead.id,
      organization_id: orgId,
      override_reason: withOverride ? overrideReason : undefined,
    });
    const result = res.data;

    if (result?.compliance?.blocks?.length > 0) {
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
      toast({ title: 'Call started', description: `Calling ${lead.phone}...` });
      onSuccess?.(result.call_id);
      onClose();
    }
    setCalling(false);
  };

  const blocked = compliance && compliance.blocks?.length > 0;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" /> Call with AI Agent
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Calling: <span className="font-semibold text-foreground">{getLeadName(lead)}</span> · {lead.phone}</p>
          </div>

          {agents.length === 0 ? (
            <div className="p-3 rounded-lg border border-warning/30 bg-warning/5">
              <p className="text-xs font-semibold text-warning">No active voice agents</p>
              <p className="text-xs text-muted-foreground mt-0.5">Create and activate a voice agent first.</p>
            </div>
          ) : (
            <div>
              <label className="text-xs font-medium block mb-1">Select Agent</label>
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {agents.map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name} ({a.provider})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Agent status indicators */}
          {selectedAgent && (
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className={`text-[10px] h-5 ${providerConnected ? 'border-success/30 text-success' : 'border-destructive/30 text-destructive'}`}>
                {providerConnected ? <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> : <XCircle className="w-2.5 h-2.5 mr-1" />}
                Provider {providerConnected ? 'connected' : 'not connected'}
              </Badge>
              <Badge variant="outline" className={`text-[10px] h-5 ${agentSynced ? 'border-success/30 text-success' : 'border-warning/30 text-warning'}`}>
                {agentSynced ? 'Synced' : 'Not synced'}
              </Badge>
            </div>
          )}

          {!providerConnected && selectedAgent && (
            <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-xs">
              Connect {selectedAgent.provider === 'retell' ? 'Retell AI' : 'Vapi'} in Integrations before placing calls.
            </div>
          )}

          {!agentSynced && providerConnected && selectedAgent && (
            <div className="p-3 rounded-lg border border-warning/30 bg-warning/5 text-xs">
              Sync this agent to the provider from the Agent Editor.
            </div>
          )}

          {/* Consent status */}
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              TCPA consent: {lead.tcpa_consent_at
                ? <span className="text-success font-medium">On file ({new Date(lead.tcpa_consent_at).toLocaleDateString()})</span>
                : <span className="text-warning font-medium">Not on file — warning will appear</span>}
            </p>
          </div>

          {/* Compliance blocks */}
          {blocked && compliance.blocks.map((b, i) => (
            <div key={i} className="p-3 rounded-lg border border-destructive/30 bg-destructive/5">
              <p className="text-xs font-semibold text-destructive">🚫 This call is blocked</p>
              <p className="text-xs text-muted-foreground mt-1">{b.message}</p>
            </div>
          ))}

          {/* Compliance warnings */}
          {compliance?.warnings?.length > 0 && !blocked && (
            <div className="p-3 rounded-lg border border-warning/30 bg-warning/5 space-y-1">
              <p className="text-xs font-semibold text-warning flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Compliance Warnings
              </p>
              {compliance.warnings.map((w, i) => <p key={i} className="text-xs text-muted-foreground">• {w.message}</p>)}
            </div>
          )}

          {/* Override form */}
          {showOverride && !blocked && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Enter reason to proceed despite warnings (required for audit):</p>
              <Textarea value={overrideReason} onChange={e => setOverrideReason(e.target.value)}
                className="text-xs min-h-16 resize-none"
                placeholder="e.g. Lead reconfirmed consent verbally..." />
              <Button className="w-full h-8 text-xs bg-amber-500 text-white hover:bg-amber-600 gap-1"
                onClick={() => handleCall(true)} disabled={!overrideReason.trim() || calling}>
                {calling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Phone className="w-3.5 h-3.5" />}
                Override & Start Call
              </Button>
            </div>
          )}

          {!showOverride && !blocked && (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-8 text-xs" onClick={onClose}>Cancel</Button>
              <Button
                className="flex-1 h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
                onClick={() => handleCall(false)}
                disabled={calling || !selectedAgentId || !providerConnected || !agentSynced}>
                {calling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Phone className="w-3.5 h-3.5" />}
                Start Call
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}