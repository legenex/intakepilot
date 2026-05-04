import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useOrg } from '@/lib/OrgContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Phone, Star, Tag, CheckCircle, AlertOctagon, MessageSquare, FileText } from 'lucide-react';
import { STATUS_LABELS, STATUS_COLORS, VERTICAL_LABELS, SOURCE_LABELS, getLeadName, formatCents } from '@/lib/leadUtils';
import { logActivity } from '@/hooks/useLeads';
import { useToast } from '@/components/ui/use-toast';
import LeadOverviewTab from './tabs/LeadOverviewTab';
import LeadActivityTab from './tabs/LeadActivityTab';
import LeadDocumentsTab from './tabs/LeadDocumentsTab';
import LeadBuyerHistoryTab from './tabs/LeadBuyerHistoryTab';
import LeadRawDataTab from './tabs/LeadRawDataTab';
import LeadRightRail from './LeadRightRail';
import DeliverLeadModal from './DeliverLeadModal';
import LeadCallsTab from './tabs/LeadCallsTab';
import LeadMessagesTab from './tabs/LeadMessagesTab';

export default function LeadDrawer({ leadId, onClose, onRefresh, canEdit, canAdmin }) {
  const { currentOrg } = useOrg();
  const { toast } = useToast();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeliver, setShowDeliver] = useState(false);
  const [user, setUser] = useState(null);

  const loadLead = useCallback(async () => {
    if (!leadId) return;
    const l = await base44.entities.Lead.get(leadId);
    setLead(l);
    setLoading(false);
  }, [leadId]);

  useEffect(() => {
    loadLead();
    base44.auth.me().then(setUser);
  }, [loadLead]);

  const markPVQL = async () => {
    await base44.entities.Lead.update(leadId, { status: 'pvql', pvql_verified_at: new Date().toISOString() });
    await logActivity({ organization_id: currentOrg.id, lead_id: leadId, type: 'status_changed', payload: { from: lead.status, to: 'pvql', summary: 'Marked as PVQL' }, actor_label: user?.full_name || 'User' });
    toast({ title: 'Marked as PVQL' });
    loadLead(); onRefresh();
  };

  const markDNC = async () => {
    await base44.entities.Lead.update(leadId, { status: 'dnc' });
    await logActivity({ organization_id: currentOrg.id, lead_id: leadId, type: 'status_changed', payload: { from: lead.status, to: 'dnc', summary: 'Marked as DNC' }, actor_label: user?.full_name || 'User' });
    toast({ title: 'Marked as DNC' });
    loadLead(); onRefresh();
  };

  if (loading) return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-3/5 bg-card border-l border-border z-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!lead) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-3/5 bg-card border-l border-border z-50 flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h2 className="text-lg font-bold truncate">{getLeadName(lead)}</h2>
            <Badge className={`text-xs ${STATUS_COLORS[lead.status]}`}>{STATUS_LABELS[lead.status]}</Badge>
            {lead.pvql_score && <Badge className="text-xs bg-violet-500/10 text-violet-400 border-0">{lead.pvql_score}/10 PVQL</Badge>}
            {lead.source && <Badge variant="outline" className="text-xs">{SOURCE_LABELS[lead.source]}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground font-mono">{lead.phone}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick actions */}
      {canEdit && (
        <div className="px-5 py-2 border-b border-border flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-violet-400 border-violet-400/30" onClick={markPVQL} disabled={lead.status === 'pvql'}>
            <Star className="w-3 h-3" /> Mark PVQL
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 bg-primary/5 text-primary border-primary/30" onClick={() => setShowDeliver(true)}>
            <CheckCircle className="w-3 h-3" /> Send to Buyer
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-destructive border-destructive/30" onClick={markDNC} disabled={lead.status === 'dnc'}>
            <AlertOctagon className="w-3 h-3" /> Mark DNC
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-primary border-primary/30" asChild>
            <a href={`/sms/inbox`}><MessageSquare className="w-3 h-3" /> SMS</a>
          </Button>
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="px-5 h-9 border-b border-border rounded-none justify-start bg-transparent gap-1 flex-shrink-0">
            {[
              { value: 'overview', label: 'Overview' },
              { value: 'activity', label: 'Activity' },
              { value: 'calls', label: 'Calls' },
              { value: 'messages', label: 'Messages' },
              { value: 'documents', label: 'Documents' },
              { value: 'buyers', label: 'Buyer History' },
              { value: 'raw', label: 'Raw Data' },
            ].map(t => (
              <TabsTrigger key={t.value} value={t.value} className="text-xs h-7 rounded-md data-[state=active]:bg-muted">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <TabsContent value="overview" className="m-0 p-5">
                <LeadOverviewTab lead={lead} canEdit={canEdit} onRefresh={loadLead} orgId={currentOrg?.id} userId={user?.id} userLabel={user?.full_name} />
              </TabsContent>
              <TabsContent value="activity" className="m-0 p-5">
                <LeadActivityTab leadId={leadId} orgId={currentOrg?.id} />
              </TabsContent>
              <TabsContent value="calls" className="m-0">
                <LeadCallsTab lead={lead} orgId={currentOrg?.id} />
              </TabsContent>
              <TabsContent value="messages" className="m-0">
                <LeadMessagesTab lead={lead} orgId={currentOrg?.id} />
              </TabsContent>
              <TabsContent value="documents" className="m-0 p-5">
                <LeadDocumentsTab lead={lead} orgId={currentOrg?.id} canEdit={canEdit} onRefresh={loadLead} />
              </TabsContent>
              <TabsContent value="buyers" className="m-0 p-5">
                <LeadBuyerHistoryTab leadId={leadId} orgId={currentOrg?.id} />
              </TabsContent>
              <TabsContent value="raw" className="m-0 p-5">
                <LeadRawDataTab lead={lead} />
              </TabsContent>
            </div>

            {/* Right rail */}
            <div className="w-56 border-l border-border flex-shrink-0 overflow-y-auto p-4">
              <LeadRightRail lead={lead} orgId={currentOrg?.id} canEdit={canEdit} onRefresh={loadLead} userLabel={user?.full_name} />
            </div>
          </div>
        </Tabs>
      </div>

      {showDeliver && (
        <DeliverLeadModal
          lead={lead}
          orgId={currentOrg?.id}
          onClose={() => setShowDeliver(false)}
          onSuccess={() => { setShowDeliver(false); loadLead(); onRefresh(); }}
          userLabel={user?.full_name}
        />
      )}
    </div>
  );
}