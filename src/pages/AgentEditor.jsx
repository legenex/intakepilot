import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useOrg } from '@/lib/OrgContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { syncAgentToProvider } from '@/functions/syncAgentToProvider';
import { enhancePromptWithAI } from '@/functions/enhancePromptWithAI';
import { listProviderVoices } from '@/functions/listProviderVoices';
import {
  ArrowLeft, Save, Zap, AlertTriangle,
  Loader2, CheckCircle2, Sparkles, Phone
} from 'lucide-react';
import { TOOL_DEFINITIONS } from '@/lib/agentTemplates';
import AgentCallTestPanel from '@/components/agents/AgentCallTestPanel';
import AgentCallHistory from '@/components/agents/AgentCallHistory';

const LLM_MODELS = [
  { value: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5 (Recommended)' },
  { value: 'claude-opus-4-7', label: 'Claude Opus 4.7 (Highest Quality)' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast)' },
];

export default function AgentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentOrg, membership } = useOrg();
  const { toast } = useToast();
  const isNew = id === 'new';

  const [agent, setAgent] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [voices, setVoices] = useState([]);
  const [enhancing, setEnhancing] = useState(false);
  const [enhanceDiff, setEnhanceDiff] = useState(null);
  const [credentials, setCredentials] = useState({});
  const [activeTab, setActiveTab] = useState('general');

  const canEdit = ['owner', 'admin'].includes(membership?.role);

  const loadAgent = useCallback(async () => {
    if (!currentOrg) return;
    const creds = await base44.entities.ProviderCredential.filter({ organization_id: currentOrg.id });
    const credMap = {};
    creds.forEach(c => { credMap[c.provider] = c; });
    setCredentials(credMap);

    if (!isNew) {
      const agents = await base44.entities.Agent.filter({ id, organization_id: currentOrg.id });
      if (agents[0]) {
        setAgent(agents[0]);
        setForm({ ...agents[0] });
      }
    } else {
      const initialForm = {
        name: '',
        description: '',
        type: 'voice',
        provider: 'retell',
        system_prompt: '',
        first_message: '',
        voice_id: '',
        llm_provider: 'anthropic',
        llm_model: 'claude-sonnet-4-5',
        temperature: 0.7,
        max_call_duration_s: 600,
        tools: [],
        status: 'draft',
        dynamic_variables_schema: {},
        compliance_settings: {}
      };
      setForm(initialForm);
    }
    setLoading(false);
  }, [id, currentOrg, isNew]);

  useEffect(() => { loadAgent(); }, [loadAgent]);

  useEffect(() => {
    if (form?.provider && credentials[form.provider]?.status === 'connected') {
      listProviderVoices({ provider: form.provider, organization_id: currentOrg?.id })
        .then(res => { if (res.data?.voices) setVoices(res.data.voices); });
    }
  }, [form?.provider, credentials]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name) { toast({ title: 'Name is required', variant: 'destructive' }); return; }
    setSaving(true);
    const data = { ...form, organization_id: currentOrg.id };
    let savedAgent;
    if (isNew) {
      savedAgent = await base44.entities.Agent.create(data);
      navigate(`/agents/${savedAgent.id}`, { replace: true });
    } else {
      savedAgent = await base44.entities.Agent.update(id, data);
    }
    setAgent(savedAgent);
    toast({ title: 'Agent saved' });
    setSaving(false);
  };

  const syncToProvider = async () => {
    const providerCred = credentials[form.provider];
    if (!providerCred || providerCred.status !== 'connected') {
      toast({ title: `Connect ${form.provider === 'retell' ? 'Retell' : 'Vapi'} first`, description: 'Go to Integrations to add credentials', variant: 'destructive' });
      return;
    }
    if (!agent?.id) { toast({ title: 'Save agent first', variant: 'destructive' }); return; }
    setSyncing(true);
    const res = await syncAgentToProvider({ agent_id: agent.id, organization_id: currentOrg.id });
    if (res.data?.success) {
      toast({ title: 'Agent synced to provider', description: `Provider ID: ${res.data.provider_agent_id}` });
      await loadAgent();
    } else {
      toast({ title: 'Sync failed', description: res.data?.error || 'Unknown error', variant: 'destructive' });
    }
    setSyncing(false);
  };

  const handleEnhancePrompt = async () => {
    setEnhancing(true);
    setEnhanceDiff(null);
    const res = await enhancePromptWithAI({
      current_prompt: form.system_prompt,
      agent_id: agent?.id,
      organization_id: currentOrg.id
    });
    if (res.data?.success) {
      setEnhanceDiff(res.data);
    } else {
      toast({ title: 'Enhancement failed', description: res.data?.error, variant: 'destructive' });
    }
    setEnhancing(false);
  };

  const toggleTool = (toolName) => {
    const current = form.tools || [];
    const exists = current.find(t => t.name === toolName || t === toolName);
    if (exists) {
      set('tools', current.filter(t => (t.name || t) !== toolName));
    } else {
      set('tools', [...current, { name: toolName, enabled: true }]);
    }
  };

  const isToolEnabled = (toolName) => {
    const tools = form?.tools || [];
    return tools.some(t => (t.name || t) === toolName);
  };

  const providerConnected = credentials[form?.provider]?.status === 'connected';
  const agentSynced = !!agent?.provider_agent_id;

  if (loading || !form) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-80 w-full" />
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="px-4 sm:px-6 py-3 border-b border-border flex items-center gap-3 flex-wrap bg-card/50">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/agents')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Input
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="Agent name..."
          className="h-8 text-sm font-semibold border-0 bg-transparent p-0 focus-visible:ring-0 w-48 sm:w-72"
          readOnly={!canEdit}
        />
        <div className="flex items-center gap-1.5 ml-auto flex-wrap">
          {/* Status */}
          {canEdit && (
            <Select value={form.status} onValueChange={v => set('status', v)}>
              <SelectTrigger className="h-7 text-xs w-24 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          )}
          {/* Provider switcher */}
          {canEdit && (
            <Select value={form.provider} onValueChange={v => set('provider', v)}>
              <SelectTrigger className="h-7 text-xs w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retell">Retell AI</SelectItem>
                <SelectItem value="vapi">Vapi</SelectItem>
              </SelectContent>
            </Select>
          )}
          {/* Version + sync indicator */}
          <Badge variant="outline" className="text-[10px] px-1.5 h-6">v{agent?.version || 1}</Badge>
          {agent?.last_synced_at && (
            <span className="text-[10px] text-muted-foreground">Synced {new Date(agent.last_synced_at).toLocaleDateString()}</span>
          )}
          {!providerConnected && (
            <Badge variant="outline" className="text-[10px] px-1.5 h-6 border-warning/30 text-warning">
              <AlertTriangle className="w-2.5 h-2.5 mr-1" />
              Provider not connected
            </Badge>
          )}
          {providerConnected && agentSynced && (
            <Badge variant="outline" className="text-[10px] px-1.5 h-6 border-success/30 text-success">
              <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
              Synced
            </Badge>
          )}
          {canEdit && (
            <>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={syncToProvider}
                disabled={syncing || !providerConnected || isNew}>
                {syncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                Sync to Provider
              </Button>
              <Button size="sm" className="h-7 text-xs gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={save} disabled={saving}>
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="px-4 sm:px-6 h-9 border-b border-border rounded-none justify-start bg-transparent flex-shrink-0 flex-wrap gap-0.5">
            {['general', 'prompt', 'voice', 'tools', 'variables', 'test', 'history', 'performance'].map(t => (
              <TabsTrigger key={t} value={t} className="text-xs h-7 rounded-md data-[state=active]:bg-muted capitalize">
                {t}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            {/* General */}
            <TabsContent value="general" className="m-0 p-4 sm:p-6 space-y-4 max-w-2xl">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">Agent Name</Label>
                  <Input value={form.name} onChange={e => set('name', e.target.value)} className="h-8 text-xs" readOnly={!canEdit} />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Type</Label>
                  <Select value={form.type} onValueChange={v => set('type', v)} disabled={!canEdit}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="voice">Voice</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs mb-1 block">Description</Label>
                <Textarea value={form.description || ''} onChange={e => set('description', e.target.value)}
                  className="text-xs min-h-14 resize-none" placeholder="What does this agent do?" readOnly={!canEdit} />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Outbound Phone Number</Label>
                <Input value={form.phone_number || ''} onChange={e => set('phone_number', e.target.value)}
                  className="h-8 text-xs font-mono" placeholder="+15551234567" readOnly={!canEdit} />
                <p className="text-[10px] text-muted-foreground mt-0.5">Must be a number registered in your voice provider account</p>
              </div>
              {!isNew && agent?.provider_agent_id && (
                <div className="p-3 rounded-lg bg-muted/40 text-xs">
                  <span className="text-muted-foreground">Provider Agent ID: </span>
                  <span className="font-mono text-primary">{agent.provider_agent_id}</span>
                </div>
              )}
            </TabsContent>

            {/* Prompt */}
            <TabsContent value="prompt" className="m-0 p-4 sm:p-6 space-y-4 max-w-3xl">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs">First Message / Greeting</Label>
                  <span className="text-[10px] text-muted-foreground">{(form.first_message || '').length} chars</span>
                </div>
                <Textarea value={form.first_message || ''} onChange={e => set('first_message', e.target.value)}
                  className="text-xs min-h-16 resize-none font-mono" readOnly={!canEdit}
                  placeholder="Hi {{lead_first_name}}, this is Alex calling..." />
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Available variables: {'{{lead_first_name}}'}, {'{{lead_state}}'}, {'{{lead_vertical}}'}, {'{{lead_incident_date}}'}
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs">System Prompt</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{(form.system_prompt || '').length} chars</span>
                    {canEdit && (
                      <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 gap-1"
                        onClick={handleEnhancePrompt} disabled={enhancing || !form.system_prompt}>
                        {enhancing ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
                        Enhance with AI
                      </Button>
                    )}
                  </div>
                </div>
                <Textarea value={form.system_prompt || ''} onChange={e => set('system_prompt', e.target.value)}
                  className="text-xs min-h-64 resize-none font-mono" readOnly={!canEdit}
                  placeholder="You are a professional intake specialist..." />
              </div>
              {/* AI Enhancement diff */}
              {enhanceDiff && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <p className="text-xs font-semibold text-primary">AI Suggested Improvements ({Math.round(enhanceDiff.confidence * 100)}% confidence)</p>
                  </div>
                  <ul className="space-y-1">
                    {(enhanceDiff.changes_summary || []).map((c, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex gap-2">
                        <span className="text-primary">•</span>{c}
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <Button size="sm" className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
                      onClick={() => { set('system_prompt', enhanceDiff.improved_prompt); setEnhanceDiff(null); }}>
                      <CheckCircle2 className="w-3 h-3" /> Apply Changes
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEnhanceDiff(null)}>
                      Dismiss
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Voice & Model */}
            <TabsContent value="voice" className="m-0 p-4 sm:p-6 space-y-4 max-w-2xl">
              {!providerConnected && (
                <div className="p-3 rounded-lg border border-warning/30 bg-warning/5 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-warning">Provider not connected</p>
                    <p className="text-xs text-muted-foreground">Connect {form.provider} in Integrations to browse voices and sync this agent.</p>
                    <Button size="sm" variant="link" className="h-5 text-xs px-0 text-primary" onClick={() => navigate('/integrations')}>
                      Go to Integrations →
                    </Button>
                  </div>
                </div>
              )}
              <div>
                <Label className="text-xs mb-1 block">Voice</Label>
                {voices.length > 0 ? (
                  <Select value={form.voice_id || ''} onValueChange={v => set('voice_id', v)} disabled={!canEdit}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select voice..." /></SelectTrigger>
                    <SelectContent>
                      {voices.map(v => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name} — {v.gender}, {v.accent}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={form.voice_id || ''} onChange={e => set('voice_id', e.target.value)}
                    className="h-8 text-xs font-mono" placeholder="Voice ID (e.g. openai-Alloy)" readOnly={!canEdit} />
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">LLM Provider</Label>
                  <Select value={form.llm_provider || 'anthropic'} onValueChange={v => set('llm_provider', v)} disabled={!canEdit}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                      <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Model</Label>
                  <Select value={form.llm_model || 'claude-sonnet-4-5'} onValueChange={v => set('llm_model', v)} disabled={!canEdit}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LLM_MODELS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">Temperature: {form.temperature || 0.7}</Label>
                  <input type="range" min="0" max="1" step="0.05" value={form.temperature || 0.7}
                    onChange={e => set('temperature', parseFloat(e.target.value))}
                    className="w-full accent-primary" disabled={!canEdit} />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                    <span>Consistent</span><span>Creative</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Max Duration (seconds)</Label>
                  <Input type="number" value={form.max_call_duration_s || 600}
                    onChange={e => set('max_call_duration_s', parseInt(e.target.value))}
                    className="h-8 text-xs" min={60} max={3600} readOnly={!canEdit} />
                </div>
              </div>
            </TabsContent>

            {/* Tools */}
            <TabsContent value="tools" className="m-0 p-4 sm:p-6 space-y-3 max-w-2xl">
              <p className="text-xs text-muted-foreground">Enable the tools this agent can call during a conversation. Agents invoke tools to take real actions like updating lead fields or initiating transfers.</p>
              {Object.values(TOOL_DEFINITIONS).map(tool => {
                const enabled = isToolEnabled(tool.name);
                return (
                  <div key={tool.name}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${enabled ? 'border-primary/30 bg-primary/5' : 'border-border hover:border-primary/20'}`}
                    onClick={() => canEdit && toggleTool(tool.name)}>
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${enabled ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                        {enabled && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold font-mono text-primary">{tool.name}()</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{tool.description}</p>
                        <p className="text-[10px] text-muted-foreground/60 font-mono mt-1">{tool.example}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </TabsContent>

            {/* Variables */}
            <TabsContent value="variables" className="m-0 p-4 sm:p-6 space-y-4 max-w-2xl">
              <p className="text-xs text-muted-foreground">Dynamic variables are injected into the agent's prompt and first message at call time from the lead record.</p>
              <div className="space-y-2">
                {[
                  { var: '{{lead_first_name}}', field: 'first_name', required: true },
                  { var: '{{lead_last_name}}', field: 'last_name', required: false },
                  { var: '{{lead_phone}}', field: 'phone', required: true },
                  { var: '{{lead_state}}', field: 'state', required: false },
                  { var: '{{lead_vertical}}', field: 'vertical', required: false },
                  { var: '{{lead_incident_date}}', field: 'incident_date', required: false },
                ].map(v => (
                  <div key={v.var} className="flex items-center gap-3 p-2.5 rounded-lg border border-border text-xs">
                    <code className="text-primary font-mono text-[11px] w-52 flex-shrink-0">{v.var}</code>
                    <span className="text-muted-foreground flex-1">from lead.{v.field}</span>
                    <Badge variant="outline" className={`text-[9px] ${v.required ? 'border-destructive/30 text-destructive' : 'border-border text-muted-foreground'}`}>
                      {v.required ? 'required' : 'optional'}
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Test */}
            <TabsContent value="test" className="m-0 p-4 sm:p-6 max-w-2xl">
              <AgentCallTestPanel
                agent={agent}
                orgId={currentOrg?.id}
                credentials={credentials}
                canEdit={canEdit}
              />
            </TabsContent>

            {/* History */}
            <TabsContent value="history" className="m-0">
              {agent?.id && <AgentCallHistory agentId={agent.id} orgId={currentOrg?.id} />}
            </TabsContent>

            {/* Performance */}
            <TabsContent value="performance" className="m-0 p-4 sm:p-6">
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">Performance analytics available after first calls</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}