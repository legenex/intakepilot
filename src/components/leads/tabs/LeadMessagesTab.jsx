import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, Bot, User, Sparkles, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getLeadName } from '@/lib/leadUtils';

const INTENT_COLORS = {
  positive: 'text-success',
  negative: 'text-destructive',
  question: 'text-warning',
  stop: 'text-destructive',
  callback_request: 'text-primary',
  unknown: 'text-muted-foreground',
};

export default function LeadMessagesTab({ lead, orgId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!lead?.id) return;
    base44.entities.SMSMessage.filter({ organization_id: orgId, lead_id: lead.id }, 'created_date', 50)
      .then(data => { setMessages(data); setLoading(false); });
  }, [lead?.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const getSuggestion = async () => {
    setLoadingSuggestion(true);
    const context = messages.slice(-6).map(m => `${m.direction === 'inbound' ? 'Lead' : 'Agent'}: ${m.body}`).join('\n');
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an intake specialist for a personal injury law firm. Write a brief, friendly SMS reply to continue qualifying this lead.\n\nConversation:\n${context || '(no messages yet)'}\n\nLead: ${getLeadName(lead)}, ${lead.vertical || 'unknown vertical'}, ${lead.state || ''}, status: ${lead.status}\n\nWrite ONLY the reply message, no quotes, max 160 chars.`,
    });
    setAiSuggestion(res);
    setLoadingSuggestion(false);
  };

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    const msg = await base44.entities.SMSMessage.create({
      organization_id: orgId,
      lead_id: lead.id,
      direction: 'outbound',
      body: reply.trim(),
      status: 'sent',
      sent_at: new Date().toISOString(),
    });
    await base44.entities.LeadActivity.create({
      organization_id: orgId,
      lead_id: lead.id,
      type: 'sms_sent',
      payload: { body: reply.trim(), manual: true },
      actor: 'operator',
      actor_label: 'Operator',
    });
    setMessages(prev => [...prev, msg]);
    setReply('');
    setAiSuggestion('');
    setSending(false);
  };

  if (loading) return <div className="p-4 space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-10 rounded-lg" />)}</div>;

  return (
    <div className="flex flex-col h-80">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No SMS messages yet
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-xs">
              <div className={`flex items-end gap-1.5 ${msg.direction === 'outbound' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mb-1 ${msg.direction === 'outbound' ? 'bg-primary/10' : 'bg-muted'}`}>
                  {msg.direction === 'outbound' ? <Bot className="w-3 h-3 text-primary" /> : <User className="w-3 h-3 text-muted-foreground" />}
                </div>
                <div className={`rounded-2xl px-3 py-2 text-xs ${msg.direction === 'outbound' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm'}`}>
                  {msg.body}
                </div>
              </div>
              <div className={`flex items-center gap-1.5 mt-0.5 ${msg.direction === 'outbound' ? 'justify-end' : ''}`}>
                <p className="text-[10px] text-muted-foreground">
                  {msg.sent_at ? formatDistanceToNow(new Date(msg.sent_at), { addSuffix: true }) : ''}
                </p>
                {msg.ai_intent && <span className={`text-[10px] ${INTENT_COLORS[msg.ai_intent] || ''}`}>{msg.ai_intent}</span>}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* AI suggestion */}
      {aiSuggestion && (
        <div className="px-3 pb-2">
          <div className="flex items-start gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
            <Sparkles className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs flex-1">{aiSuggestion}</p>
            <Button size="sm" variant="ghost" className="h-5 text-[10px] px-1.5 text-primary" onClick={() => { setReply(aiSuggestion); setAiSuggestion(''); }}>
              Use
            </Button>
          </div>
        </div>
      )}

      {/* Reply */}
      <div className="p-3 border-t border-border flex gap-2">
        <Button size="icon" variant="outline" className="h-8 w-8 flex-shrink-0" onClick={getSuggestion} disabled={loadingSuggestion}>
          <Sparkles className={`w-3.5 h-3.5 ${loadingSuggestion ? 'animate-pulse text-primary' : ''}`} />
        </Button>
        <Input
          value={reply}
          onChange={e => setReply(e.target.value)}
          placeholder="Type SMS..."
          className="text-xs h-8"
          onKeyDown={e => e.key === 'Enter' && sendReply()}
        />
        <Button className="h-8 bg-primary text-primary-foreground hover:bg-primary/90" onClick={sendReply} disabled={sending || !reply.trim()}>
          <Send className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}