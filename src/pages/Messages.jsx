import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useOrg } from '@/lib/OrgContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, MessageSquare, Bot, User, Phone, RefreshCw, Sparkles, UserCheck, UserX, Search, AlertTriangle } from 'lucide-react';
import { getLeadName } from '@/lib/leadUtils';
import { formatDistanceToNow, format } from 'date-fns';

const INTENT_COLORS = {
  positive: 'text-success', negative: 'text-destructive', question: 'text-warning',
  stop: 'text-destructive', callback_request: 'text-primary', unknown: 'text-muted-foreground',
};

const THREAD_STATUS_COLORS = {
  active: 'text-success', paused: 'text-warning', closed: 'text-muted-foreground', handed_off: 'text-primary'
};

export default function Messages() {
  const { currentOrg, membership } = useOrg();
  const [threads, setThreads] = useState([]);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [leadData, setLeadData] = useState(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const bottomRef = useRef(null);
  const canEdit = ['owner', 'admin', 'operator'].includes(membership?.role);

  const loadThreads = useCallback(async () => {
    if (!currentOrg) return;
    const threadData = await base44.entities.ConversationThread.filter(
      { organization_id: currentOrg.id }, '-last_message_at', 100
    );
    // Fetch lead names
    const leadIds = [...new Set(threadData.map(t => t.lead_id).filter(Boolean))];
    const leadMap = {};
    if (leadIds.length) {
      const leads = await Promise.all(leadIds.slice(0, 50).map(id =>
        base44.entities.Lead.filter({ id }).then(r => r[0]).catch(() => null)
      ));
      leads.forEach(l => { if (l) leadMap[l.id] = l; });
    }
    setThreads(threadData.map(t => ({ ...t, lead: leadMap[t.lead_id] })));
    setLoading(false);
  }, [currentOrg]);

  const loadThread = useCallback(async (threadId) => {
    if (!currentOrg) return;
    const thread = threads.find(t => t.id === threadId);
    setSelectedThread(thread);
    const [msgs, leadArr] = await Promise.all([
      base44.entities.Message.filter(
        { organization_id: currentOrg.id, thread_id: threadId },
        'created_date', 100
      ),
      thread?.lead_id ? base44.entities.Lead.filter({ id: thread.lead_id }) : Promise.resolve([])
    ]);
    setMessages(msgs);
    setLeadData(leadArr[0] || null);
  }, [currentOrg, threads]);

  useEffect(() => { loadThreads(); }, [loadThreads]);

  useEffect(() => {
    if (selectedThreadId) loadThread(selectedThreadId);
  }, [selectedThreadId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Poll active threads every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedThreadId && selectedThread?.status === 'active') loadThread(selectedThreadId);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedThreadId, selectedThread]);

  const getSuggestion = async () => {
    if (!messages.length || !leadData) return;
    setLoadingSuggestion(true);
    const context = messages.slice(-6).map(m => `${m.direction === 'inbound' ? 'Lead' : 'Agent'}: ${m.body}`).join('\n');
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an intake specialist for a personal injury law firm. Write a brief, friendly SMS reply.\n\nConversation:\n${context}\n\nLead: ${getLeadName(leadData)}, ${leadData.vertical || ''}, ${leadData.state || ''}, status: ${leadData.status}\n\nWrite ONLY the reply message, max 160 chars.`,
    });
    setAiSuggestion(res);
    setLoadingSuggestion(false);
  };

  const sendReply = async () => {
    if (!reply.trim() || !selectedThreadId || !selectedThread) return;
    setSending(true);
    const now = new Date().toISOString();
    const msg = await base44.entities.Message.create({
      organization_id: currentOrg.id,
      lead_id: selectedThread.lead_id,
      direction: 'outbound',
      body: reply.trim(),
      status: 'sent',
      thread_id: selectedThreadId,
      agent_handled: false,
    });
    await base44.entities.ConversationThread.update(selectedThreadId, {
      last_message_at: now,
      last_message_preview: reply.trim().slice(0, 100)
    });
    setMessages(prev => [...prev, msg]);
    setReply('');
    setAiSuggestion('');
    await loadThreads();
    setSending(false);
  };

  const takeOver = async () => {
    const user = await base44.auth.me();
    await base44.entities.ConversationThread.update(selectedThreadId, {
      status: 'handed_off',
      handed_off_to: user.id,
      handed_off_at: new Date().toISOString()
    });
    setSelectedThread(prev => ({ ...prev, status: 'handed_off', handed_off_to: user.id }));
    setThreads(prev => prev.map(t => t.id === selectedThreadId ? { ...t, status: 'handed_off' } : t));
  };

  const handBackToAgent = async () => {
    await base44.entities.ConversationThread.update(selectedThreadId, {
      status: 'active',
      handed_off_to: null,
      handed_off_at: null
    });
    setSelectedThread(prev => ({ ...prev, status: 'active', handed_off_to: null }));
    setThreads(prev => prev.map(t => t.id === selectedThreadId ? { ...t, status: 'active' } : t));
  };

  const filteredThreads = threads.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (search) {
      const name = t.lead ? getLeadName(t.lead) : '';
      return name.toLowerCase().includes(search.toLowerCase()) || t.last_message_preview?.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const twilioConnected = true; // Would check credentials

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Thread list */}
      <div className="w-72 flex-shrink-0 border-r border-border flex flex-col">
        <div className="p-3 border-b border-border space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">Messages</h2>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={loadThreads}>
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search..." className="pl-7 h-7 text-xs" />
          </div>
          <div className="flex gap-1">
            {['all', 'active', 'handed_off', 'closed'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`flex-1 text-[10px] py-0.5 rounded transition-colors ${filterStatus === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
                {s === 'all' ? 'All' : s === 'handed_off' ? 'Taken over' : s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-3 space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
          ) : filteredThreads.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-30" />
              No threads yet
            </div>
          ) : filteredThreads.map(t => (
            <button key={t.id} onClick={() => setSelectedThreadId(t.id)}
              className={`w-full text-left p-3 border-b border-border/50 hover:bg-muted/50 transition-colors ${selectedThreadId === t.id ? 'bg-muted' : ''}`}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-semibold truncate">{t.lead ? getLeadName(t.lead) : t.lead_id?.slice(0,8)}</span>
                <div className="flex items-center gap-1">
                  {(t.unread_count > 0) && (
                    <Badge className="text-[9px] px-1 py-0 min-w-4 h-4 bg-primary text-primary-foreground">{t.unread_count}</Badge>
                  )}
                  <span className={`text-[9px] ${THREAD_STATUS_COLORS[t.status] || ''}`}>●</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">{t.last_message_preview || 'No messages'}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                {t.last_message_at ? formatDistanceToNow(new Date(t.last_message_at), { addSuffix: true }) : ''}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Conversation */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selectedThreadId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a conversation</p>
            </div>
          </div>
        ) : (
          <>
            {/* Lead header */}
            <div className="p-3 border-b border-border flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{leadData ? getLeadName(leadData) : '—'}</p>
                <p className="text-xs text-muted-foreground">{leadData?.phone} · {leadData?.state} · {leadData?.status}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-[10px] h-5 ${THREAD_STATUS_COLORS[selectedThread?.status] || ''}`}>
                  {selectedThread?.status === 'handed_off' ? 'You have control' : selectedThread?.status || 'unknown'}
                </Badge>
                {canEdit && selectedThread?.status !== 'handed_off' && (
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={takeOver}>
                    <UserCheck className="w-3 h-3" /> Take Over
                  </Button>
                )}
                {canEdit && selectedThread?.status === 'handed_off' && (
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={handBackToAgent}>
                    <Bot className="w-3 h-3" /> Hand Back to Agent
                  </Button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-xs lg:max-w-md">
                    <div className={`flex items-end gap-1.5 ${msg.direction === 'outbound' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mb-1 ${msg.direction === 'outbound' ? 'bg-primary/10' : 'bg-muted'}`}>
                        {msg.direction === 'outbound'
                          ? (msg.agent_handled ? <Bot className="w-3 h-3 text-primary" /> : <User className="w-3 h-3 text-primary" />)
                          : <User className="w-3 h-3 text-muted-foreground" />}
                      </div>
                      <div className={`rounded-2xl px-3 py-2 text-sm ${msg.direction === 'outbound' ? `${msg.agent_handled ? 'bg-violet-500 text-white' : 'bg-primary text-primary-foreground'} rounded-br-sm` : 'bg-muted text-foreground rounded-bl-sm'}`}>
                        {msg.body}
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 mt-0.5 ${msg.direction === 'outbound' ? 'justify-end' : ''}`}>
                      <p className="text-[10px] text-muted-foreground">
                        {msg.created_date ? formatDistanceToNow(new Date(msg.created_date), { addSuffix: true }) : ''}
                        {msg.agent_handled ? ' · agent' : ''}
                      </p>
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
                  <p className="text-xs flex-1">{aiSuggestion}</p>
                  <Button size="sm" variant="ghost" className="h-6 text-xs px-2 text-primary"
                    onClick={() => { setReply(aiSuggestion); setAiSuggestion(''); }}>Use</Button>
                </div>
              </div>
            )}

            {/* Reply box */}
            {(selectedThread?.status === 'handed_off' || selectedThread?.status === 'active') && canEdit && (
              <div className="p-3 border-t border-border flex gap-2">
                <Button size="icon" variant="outline" className="h-9 w-9 flex-shrink-0"
                  onClick={getSuggestion} disabled={loadingSuggestion}>
                  <Sparkles className={`w-3.5 h-3.5 ${loadingSuggestion ? 'animate-pulse text-primary' : ''}`} />
                </Button>
                <Input value={reply} onChange={e => setReply(e.target.value)}
                  placeholder="Type a reply..." className="text-sm"
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()} />
                <Button className="h-9 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={sendReply} disabled={sending || !reply.trim()}>
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}