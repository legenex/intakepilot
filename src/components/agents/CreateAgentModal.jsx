import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2, BookTemplate, PenLine, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import { SYSTEM_TEMPLATES } from '@/lib/agentTemplates';
import { generateAgentWithAI } from '@/functions/generateAgentWithAI';
import { useToast } from '@/components/ui/use-toast';

const TYPE_COLORS = {
  voice: 'bg-violet-500/10 text-violet-400',
  sms: 'bg-primary/10 text-primary',
  hybrid: 'bg-orange-500/10 text-orange-400',
};

export default function CreateAgentModal({ orgId, onClose, onSuccess }) {
  const { toast } = useToast();
  const [mode, setMode] = useState(null); // 'template' | 'ai' | 'scratch'
  const [aiDescription, setAiDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const createFromTemplate = async (template) => {
    const agent = await base44.entities.Agent.create({
      organization_id: orgId,
      name: template.name,
      description: template.description,
      type: template.type,
      provider: template.recommended_provider,
      system_prompt: template.system_prompt,
      first_message: template.first_message,
      llm_model: template.llm_model || 'claude-sonnet-4-5',
      temperature: template.temperature || 0.7,
      max_call_duration_s: template.max_call_duration_s || 600,
      tools: (template.default_tools || []).map(t => ({ name: t, enabled: true })),
      status: 'draft',
      template_id: template.id,
    });
    onSuccess(agent.id);
  };

  const createFromAI = async () => {
    if (!aiDescription.trim()) return;
    setGenerating(true);
    const res = await generateAgentWithAI({ description: aiDescription, organization_id: orgId });
    if (res.data?.success) {
      const draft = res.data.agent;
      const agent = await base44.entities.Agent.create({
        organization_id: orgId,
        name: draft.name,
        description: draft.description,
        type: draft.type || 'voice',
        provider: draft.recommended_provider || 'retell',
        system_prompt: draft.system_prompt,
        first_message: draft.first_message,
        llm_model: draft.llm_model || 'claude-sonnet-4-5',
        temperature: draft.temperature || 0.7,
        max_call_duration_s: draft.max_call_duration_s || 600,
        tools: (draft.suggested_tools || []).map(t => ({ name: t, enabled: true })),
        status: 'draft',
      });
      onSuccess(agent.id);
    } else {
      toast({ title: 'AI generation failed', description: res.data?.error, variant: 'destructive' });
    }
    setGenerating(false);
  };

  const createFromScratch = async () => {
    const agent = await base44.entities.Agent.create({
      organization_id: orgId,
      name: 'New Agent',
      type: 'voice',
      provider: 'retell',
      status: 'draft',
      llm_model: 'claude-sonnet-4-5',
      temperature: 0.7,
      max_call_duration_s: 600,
      tools: [],
    });
    onSuccess(agent.id);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Create AI Agent</DialogTitle>
        </DialogHeader>

        {!mode ? (
          <div className="space-y-3 mt-2">
            <p className="text-xs text-muted-foreground">Choose how to create your agent:</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'template', icon: BookTemplate, label: 'From Template', desc: '7 battle-tested templates for PI intake', color: 'border-primary/30 hover:bg-primary/5' },
                { key: 'ai', icon: Sparkles, label: 'Build with AI', desc: 'Describe what it should do, AI drafts it', color: 'border-violet-500/30 hover:bg-violet-500/5' },
                { key: 'scratch', icon: PenLine, label: 'From Scratch', desc: 'Start with a blank canvas', color: 'border-border hover:bg-muted/50' },
              ].map(opt => (
                <button key={opt.key}
                  className={`p-4 rounded-xl border text-left transition-all ${opt.color}`}
                  onClick={() => opt.key === 'scratch' ? createFromScratch() : setMode(opt.key)}>
                  <opt.icon className="w-5 h-5 mb-2 text-primary" />
                  <p className="text-xs font-semibold">{opt.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        ) : mode === 'template' ? (
          <div className="space-y-3 mt-2">
            <Button variant="ghost" size="sm" className="h-6 text-xs px-0 text-muted-foreground" onClick={() => setMode(null)}>
              ← Back
            </Button>
            <p className="text-xs text-muted-foreground">Select a starting template — you can customize everything in the editor:</p>
            <div className="space-y-2">
              {SYSTEM_TEMPLATES.map(tpl => (
                <div key={tpl.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedTemplate?.id === tpl.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                  onClick={() => setSelectedTemplate(tpl)}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold">{tpl.name}</span>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${TYPE_COLORS[tpl.type]}`}>{tpl.type}</Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">{tpl.recommended_provider}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{tpl.description}</p>
                      {tpl.default_tools?.length > 0 && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Tools: {tpl.default_tools.join(', ')}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!selectedTemplate}
              onClick={() => selectedTemplate && createFromTemplate(selectedTemplate)}>
              Use Template: {selectedTemplate?.name || '—'}
            </Button>
          </div>
        ) : mode === 'ai' ? (
          <div className="space-y-4 mt-2">
            <Button variant="ghost" size="sm" className="h-6 text-xs px-0 text-muted-foreground" onClick={() => setMode(null)}>
              ← Back
            </Button>
            <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-warning mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                <strong>AI-drafted starting point</strong> — review and refine against real call recordings. Templates outperform AI-drafts in production.
              </p>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Describe what this agent should do</label>
              <Textarea
                value={aiDescription}
                onChange={e => setAiDescription(e.target.value)}
                className="min-h-28 text-xs resize-none"
                placeholder="e.g. An outbound voice agent that calls auto accident leads in the Southeast, qualifies them on injury severity, medical treatment, and fault, then warm-transfers qualified leads to our Atlanta buyer team. Should be empathetic and handle objections about speaking to AI..."
              />
            </div>
            <Button className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={createFromAI} disabled={generating || !aiDescription.trim()}>
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? 'Generating agent...' : 'Generate Agent with AI'}
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}