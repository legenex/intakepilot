import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Send, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_COLORS = {
  open: 'bg-primary/10 text-primary',
  in_progress: 'bg-blue-500/10 text-blue-500',
  awaiting_customer: 'bg-yellow-500/10 text-yellow-500',
  responded: 'bg-green-500/10 text-green-500',
  closed: 'bg-muted text-muted-foreground',
};

const PRIORITY_COLORS = {
  low: 'text-muted-foreground',
  medium: 'text-yellow-500',
  high: 'text-orange-500',
  urgent: 'text-destructive',
};

export default function PlatformSupport() {
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('open');
  const [replyText, setReplyText] = useState('');
  const [replyMode, setReplyMode] = useState('customer');
  const [orgs, setOrgs] = useState({});

  useEffect(() => {
    loadTickets();
  }, [statusFilter]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const query = statusFilter === 'all' ? {} : { status: statusFilter };
      const ticketList = await base44.entities.SupportTicket.filter(query, '-created_date', 100);
      setTickets(ticketList);

      if (selected) {
        const updated = ticketList.find(t => t.id === selected.id);
        if (updated) setSelected(updated);
      }

      // Load orgs
      const orgList = await base44.entities.Organization.list();
      const orgMap = {};
      orgList.forEach(o => { orgMap[o.id] = o; });
      setOrgs(orgMap);
    } catch (error) {
      console.error('Ticket load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || !selected) return;

    const user = await base44.auth.me();
    const updatedThread = [
      ...(selected.thread || []),
      {
        timestamp: new Date().toISOString(),
        sender_type: 'super_admin',
        sender_id: user.id,
        sender_name: user.full_name,
        body: replyText,
        internal: replyMode === 'internal',
      },
    ];

    await base44.entities.SupportTicket.update(selected.id, {
      thread: updatedThread,
      status: replyMode === 'internal' ? selected.status : 'responded',
    });

    setReplyText('');
    loadTickets();
  };

  if (loading) return <div className="p-6 space-y-4">{[1,2].map(i => <Skeleton key={i} className="h-32" />)}</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Support Inbox</h1>
        <p className="text-muted-foreground text-sm mt-1">Unified ticket management across all organizations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Open', count: tickets.filter(t => t.status === 'open').length },
          { label: 'In Progress', count: tickets.filter(t => t.status === 'in_progress').length },
          { label: 'Awaiting Response', count: tickets.filter(t => t.status === 'awaiting_customer').length },
          { label: 'Closed', count: tickets.filter(t => t.status === 'closed').length },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-96">
        {/* Ticket list */}
        <Card className="lg:col-span-1 overflow-hidden flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Tickets</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 text-xs mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-1 p-3">
            {tickets.map(ticket => (
              <button
                key={ticket.id}
                onClick={() => setSelected(ticket)}
                className={`w-full p-2 rounded-lg text-left text-xs transition-colors ${
                  selected?.id === ticket.id ? 'bg-primary/10' : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{ticket.subject}</p>
                    <p className="text-muted-foreground truncate">{ticket.customer_name}</p>
                  </div>
                  <Badge className={`text-[10px] flex-shrink-0 ${STATUS_COLORS[ticket.status]}`}>
                    {ticket.priority}
                  </Badge>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Ticket detail */}
        <Card className="lg:col-span-2 overflow-hidden flex flex-col">
          {selected ? (
            <>
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm">{selected.subject}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{selected.customer_name} • {selected.customer_email}</p>
                  </div>
                  <Badge className={`text-[10px] ${STATUS_COLORS[selected.status]}`}>{selected.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-2 p-3">
                {(selected.thread || []).map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg text-xs ${
                      msg.internal
                        ? 'bg-warning/5 border border-warning/20'
                        : msg.sender_type === 'super_admin'
                        ? 'bg-primary/5 border border-primary/20'
                        : 'bg-muted/50'
                    }`}
                  >
                    <p className="font-semibold text-[10px]">{msg.sender_name} {msg.internal && '(Internal)'}</p>
                    <p className="mt-1">{msg.body}</p>
                    <p className="text-[9px] text-muted-foreground mt-1">{format(new Date(msg.timestamp), 'PPp')}</p>
                  </div>
                ))}
              </CardContent>
              <div className="border-t border-border p-3 space-y-2">
                <Textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  className="h-16 text-xs"
                />
                <div className="flex items-center gap-2">
                  <Select value={replyMode} onValueChange={setReplyMode}>
                    <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer Reply</SelectItem>
                      <SelectItem value="internal">Internal Note</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={sendReply} className="h-8 text-xs gap-1">
                    <Send className="w-3 h-3" /> Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-sm">Select a ticket to view details</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}