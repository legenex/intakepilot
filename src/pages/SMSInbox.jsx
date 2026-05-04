import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useOrg } from '@/lib/OrgContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, MessageSquare, Bot, User, Phone, RefreshCw, Sparkles } from 'lucide-react';
import { getLeadName } from '@/lib/leadUtils';
import { formatDistanceToNow } from 'date-fns';

const INTENT_COLORS = {
  positive: 'text-success',
  negative: 'text-destructive',
  question: 'text-warning',
  stop: 'text-destructive',
  callback_request: 'text-primary',
  document_sent: 'text-cyan-400',
  unknown: 'text-muted-foreground',
};

export default function SMSInbox() {
  const { currentOrg } = useOrg();
  const [threads, setThreads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [messages, setMessages] = useState([]);
  const [leadData, setLeadData] = useState(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { loadThreads(); }, [currentOrg]);
  useEffect(() => { if (selectedLead) loadThread(selectedLead); }, [selectedLead]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadThreads = async () => {
    if (!currentOrg) return;
    const msgs = await base44.entities.SMSMessage.filter({ organization_id: currentOrg.id }, '-created_date', 200);
    // Group by lead_id, get latest per lead
    const byLead = {};
    msgs.forEach(m => {
      if (!byLead[m.lead_id] || m.created_date > byLead[m.lead_id].created_date) {
        byLead[m.lead_id] = m;
      }
    });
    // Fetch lead names
    const leadIds = Object.keys(byLead);
    const leads = leadIds.length > 0
      ? await Promise.all(leadIds.map(id => base44.entities.Lead.filter({ id }).then(r => r[0]).catch(() => null)))
      : [];
    const leadMap = {};
    leads.forEach(l => { if (l) leadMap[l.id] = l; });
    const threadsArr = Object.entries(byLead).map(([leadId, lastMsg]) => ({
      leadId,
      lastMsg,
      lead: leadMap[leadId],
      unread: msgs.filter(m => m.lead_id === leadId && m.direction === 'inbound' && m.status === 'received').length,
    })).sort((a, b) => b.lastMsg.created_date?.localeCompare(a.lastMsg.created_date));
    setThreads(threadsArr);
    setLoading(false);
  };

  const loadThread = async (leadId) => {
    const [msgs, leads] = await Promise.all([
      base44.entities.SMSMessage.filter({ organization_id: currentOrg.id, lead_id: leadId }, 'created_date', 100),
      base44.entities.Lead.filter({ id: leadId }),
    ]);
    setMessages(msgs);
    setLeadData(leads[0] || null);
  };

  const getSuggestion = async () => {
    if (!messages.length) return;
    setLoadingSuggestion(true);
    const lastInbound = [...messages].reverse().find(m => m.direction === 'inbound');
    if (lastInbound?.ai_suggested_reply) {
      setAiSuggestion(lastInbound.ai_suggested_reply);
    } else {
      const context = messages.slice(-6).map(m => `${m.direction === 'inbound' ? 'Lead' : 'Agent'}: ${m.body}`).join('\n');
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an intake specialist for a personal injury law firm. Write a brief, friendly SMS reply to continue qualifying this lead.\n\nConversation:\n${context}\n\nLead info: ${leadData ? `${getLeadName(leadData)}, ${leadData.vertical || 'unknown vertical'}, ${leadData.state || ''}` : 'unknown'}\n\nWrite ONLY the reply message, no quotes, max 160 chars.`,
      });
      setAiSuggestion(res);
    }
    setLoadingSuggestion(false);
  };

  const sendReply = async () => {
    if (!reply.trim() || !selectedLead) return;
    setSending(true);
    await base44.entities.SMSMessage.create({
      organization_id: currentOrg.id,
      lead_id: selectedLead,
      direction: 'outbound',
      body: reply.trim(),
      status: 'sent',
      sent_at: new Date().toISOString(),
    });
    await base44.entities.LeadActivity.create({
      organization_id: currentOrg.id,
      lead_id: selectedLead,
      type: 'sms_sent',
      payload: { body: reply.trim(), manual: true },
      actor: 'operator',
      actor_label: 'Operator',
    });
    setReply('');
    setAiSuggestion('');
    await loadThread(selectedLead);
    await loadThreads();
    setSending(false);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Thread list */}
      <div className="w-72 flex-shrink-0 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-sm">SMS Inbox</h2>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={loadThreads}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-3 space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
          ) : threads.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No SMS threads yet</div>
          ) : threads.map(t => (
            <button
              key={t.leadId}
              onClick={() => setSelectedLead(t.leadId)}
              className={`w-full text-left p-3 border-b border-border/50 hover:bg-muted/50 transition-colors ${selectedLead === t.leadId ? 'bg-muted' : ''}`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-semibold truncate">{t.lead ? getLeadName(t.lead) : t.leadId.slice(0,8)}</span>
                {t.unread > 0 && <Badge className="text-[9px] px-1 py-0 min-w-4 h-4 bg-primary text-primary-foreground">{t.unread}</Badge>}
              </div>
              <p className="text-[11px] text-muted-foreground truncate">{t.lastMsg.body}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                {t.lastMsg.created_date ? formatDistanceToNow(new Date(t.lastMsg.created_date), { addSuffix: true }) : ''}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Conversation */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selectedLead ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            <div className="text-center">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
              Select a conversation
            </div>
          </div>
        ) : (
          <>
            {/* Lead header */}
            <div className="p-4 border-b border-border flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{leadData ? getLeadName(leadData) : '—'}</p>
                <p className="text-xs text-muted-foreground">{leadData?.phone} · {leadData?.state} · {leadData?.status}</p>
              </div>
              {leadData?.phone && (
                <Button size="sm" variant="outline" className="ml-auto gap-1.5 h-7 text-xs">
                  <Phone className="w-3 h-3" /> Call
                </Button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md ${msg.direction === 'outbound' ? 'order-last' : ''}`}>
                    <div className={`flex items-end gap-1.5 ${msg.direction === 'outbound' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mb-1 ${msg.direction === 'outbound' ? 'bg-primary/10' : 'bg-muted'}`}>
                        {msg.direction === 'outbound' ? <Bot className="w-3 h-3 text-primary" /> : <User className="w-3 h-3 text-muted-foreground" />}
                      </div>
                      <div className={`rounded-2xl px-3 py-2 text-sm ${msg.direction === 'outbound' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm'}`}>
                        {msg.body}
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 mt-0.5 ${msg.direction === 'outbound' ? 'justify-end' : ''}`}>
                      <p className="text-[10px] text-muted-foreground">
                        {msg.sent_at ? formatDistanceToNow(new Date(msg.sent_at), { addSuffix: true }) : ''}
                      </p>
                      {msg.ai_intent && (
                        <span className={`text-[10px] ${INTENT_COLORS[msg.ai_intent]}`}>{msg.ai_intent}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* AI suggestion */}
            {aiSuggestion && (
              <div className="px-4 pb-2">
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                  <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-foreground flex-1">{aiSuggestion}</p>
                  <Button size="sm" variant="ghost" className="h-6 text-xs px-2 text-primary" onClick={() => { setReply(aiSuggestion); setAiSuggestion(''); }}>
                    Use
                  </Button>
                </div>
              </div>
            )}

            {/* Reply box */}
            <div className="p-4 border-t border-border flex gap-2">
              <Button size="icon" variant="outline" className="h-9 w-9 flex-shrink-0" onClick={getSuggestion} disabled={loadingSuggestion} title="AI suggest reply">
                <Sparkles className={`w-3.5 h-3.5 ${loadingSuggestion ? 'animate-pulse text-primary' : ''}`} />
              </Button>
              <Input
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder="Type a reply..."
                className="text-sm"
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()}
              />
              <Button className="h-9 bg-primary text-primary-foreground hover:bg-primary/90" onClick={sendReply} disabled={sending || !reply.trim()}>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}