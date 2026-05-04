import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useOrg } from '@/lib/OrgContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, MessageSquare, Play, Pause, BarChart3, Users, CheckCircle, XCircle } from 'lucide-react';
import SMSCampaignModal from '@/components/sms/SMSCampaignModal';

const STATUS_STYLES = {
  draft: 'border-border text-muted-foreground',
  active: 'border-success/30 text-success',
  paused: 'border-warning/30 text-warning',
  completed: 'border-primary/30 text-primary',
};

export default function SMSCampaigns() {
  const { currentOrg } = useOrg();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCampaign, setEditCampaign] = useState(null);

  const load = async () => {
    if (!currentOrg) return;
    const data = await base44.entities.SMSCampaign.filter({ organization_id: currentOrg.id }, '-created_date');
    setCampaigns(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [currentOrg]);

  const toggleStatus = async (campaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    await base44.entities.SMSCampaign.update(campaign.id, { status: newStatus });
    setCampaigns(prev => prev.map(c => c.id === campaign.id ? { ...c, status: newStatus } : c));
  };

  const openEdit = (c) => { setEditCampaign(c); setShowModal(true); };
  const openNew = () => { setEditCampaign(null); setShowModal(true); };

  const totalSent = campaigns.reduce((s, c) => s + (c.total_sent || 0), 0);
  const totalReplies = campaigns.reduce((s, c) => s + (c.total_replies || 0), 0);
  const replyRate = totalSent > 0 ? ((totalReplies / totalSent) * 100).toFixed(1) : '0';

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">SMS Campaigns</h1>
          <p className="text-sm text-muted-foreground">Automated multi-step SMS sequences</p>
        </div>
        <Button onClick={openNew} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
          <Plus className="w-3.5 h-3.5" /> New Campaign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active Campaigns', value: campaigns.filter(c => c.status === 'active').length, icon: Play },
          { label: 'Total Sent', value: totalSent.toLocaleString(), icon: MessageSquare },
          { label: 'Total Replies', value: totalReplies.toLocaleString(), icon: Users },
          { label: 'Reply Rate', value: `${replyRate}%`, icon: BarChart3, raw: true },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Campaign list */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      ) : campaigns.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-14 text-center space-y-3">
            <MessageSquare className="w-10 h-10 mx-auto opacity-30" />
            <p className="font-semibold">No campaigns yet</p>
            <p className="text-sm text-muted-foreground">Build a multi-step SMS sequence to automatically nurture and qualify leads.</p>
            <Button size="sm" onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2">
              <Plus className="w-3.5 h-3.5 mr-1" /> Create Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {campaigns.map(campaign => {
            const deliveryRate = campaign.total_sent > 0
              ? ((campaign.total_delivered / campaign.total_sent) * 100).toFixed(0)
              : '—';
            const replyRateC = campaign.total_sent > 0
              ? ((campaign.total_replies / campaign.total_sent) * 100).toFixed(1)
              : '—';
            return (
              <Card key={campaign.id} className="hover:border-primary/30 transition-colors cursor-pointer" onClick={() => openEdit(campaign)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="font-semibold text-sm">{campaign.name}</span>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${STATUS_STYLES[campaign.status]}`}>
                          {campaign.status}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                          {campaign.trigger_type?.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                          {campaign.sequence?.length || 0} steps
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{campaign.total_sent || 0} sent</span>
                        <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-success" />{deliveryRate}% delivered</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3 text-primary" />{replyRateC}% reply rate</span>
                        <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-destructive" />{campaign.total_optouts || 0} opt-outs</span>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7 flex-shrink-0" onClick={e => { e.stopPropagation(); toggleStatus(campaign); }}>
                      {campaign.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {showModal && (
        <SMSCampaignModal
          campaign={editCampaign}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}