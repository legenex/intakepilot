import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useOrg } from '@/lib/OrgContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, AlertTriangle, Download, CheckCircle2, XCircle, Info } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { getLeadName } from '@/lib/leadUtils';

const CHECK_CONFIG = {
  tcpa: { label: 'TCPA Consent', description: 'Require documented consent before contacting leads', risk: 'medium' },
  after_hours: { label: 'After-Hours Block', description: 'Block calls outside 8am-9pm local time', risk: 'medium' },
  frequency_cap: { label: 'Frequency Cap', description: 'Limit outbound contacts per lead per week', risk: 'low' },
  dnc: { label: 'DNC Block', description: 'Block all contact with DNC-tagged leads', risk: 'critical' },
  two_party_disclosure: { label: 'Two-Party Recording Disclosure', description: 'Auto-prepend disclosure for CA, FL, IL and other states', risk: 'high' },
};

export default function ComplianceAudit() {
  const { currentOrg, membership } = useOrg();
  const [overrides, setOverrides] = useState([]);
  const [leads, setLeads] = useState({});
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({ voice_cap: 3, sms_cap: 7 });
  const [savingSettings, setSavingSettings] = useState(false);

  const canAdmin = ['owner', 'admin'].includes(membership?.role);

  useEffect(() => {
    if (!currentOrg) return;
    base44.entities.ComplianceOverride.filter({ organization_id: currentOrg.id }, '-created_date', 200)
      .then(async (data) => {
        setOverrides(data);
        const ids = [...new Set(data.map(o => o.lead_id).filter(Boolean))];
        if (ids.length) {
          const leadData = await Promise.all(ids.slice(0, 50).map(id =>
            base44.entities.Lead.filter({ id }).then(r => r[0]).catch(() => null)
          ));
          const m = {};
          leadData.forEach(l => { if (l) m[l.id] = l; });
          setLeads(m);
        }
        setLoading(false);
      });
  }, [currentOrg]);

  const exportCSV = () => {
    const rows = overrides.map(o => [
      o.created_date ? format(new Date(o.created_date), 'yyyy-MM-dd HH:mm:ss') : '',
      leads[o.lead_id] ? getLeadName(leads[o.lead_id]) : o.lead_id,
      o.override_type,
      o.override_by_name || o.override_by,
      (o.checks_overridden || []).join(', '),
      `"${(o.reason || '').replace(/"/g, '""')}"`
    ].join(','));
    const csv = ['Date,Lead,Override Type,By,Checks Overridden,Reason', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'compliance-audit.csv'; a.click();
  };

  if (!canAdmin) return (
    <div className="p-8 text-center text-muted-foreground">Admin access required.</div>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Compliance
          </h1>
          <p className="text-sm text-muted-foreground">TCPA compliance settings and audit trail</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={exportCSV}>
          <Download className="w-3.5 h-3.5" /> Export Audit Log
        </Button>
      </div>

      {/* Compliance checks config */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Compliance Checks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(CHECK_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-start gap-3 p-3 rounded-lg border border-border">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.risk === 'critical' ? 'bg-destructive/10' : cfg.risk === 'high' ? 'bg-warning/10' : 'bg-success/10'}`}>
                {key === 'dnc' ? <XCircle className="w-4 h-4 text-destructive" /> : <CheckCircle2 className={`w-4 h-4 ${cfg.risk === 'critical' ? 'text-destructive' : cfg.risk === 'high' ? 'text-warning' : 'text-success'}`} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold">{cfg.label}</p>
                  <Badge variant="outline" className={`text-[9px] px-1 h-4 ${cfg.risk === 'critical' ? 'border-destructive/30 text-destructive' : cfg.risk === 'high' ? 'border-warning/30 text-warning' : 'border-success/30 text-success'}`}>
                    {cfg.risk}
                  </Badge>
                  <Badge variant="outline" className="text-[9px] px-1 h-4 bg-success/10 text-success border-success/30">Always On</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{cfg.description}</p>
              </div>
            </div>
          ))}

          {/* Frequency caps */}
          <div className="p-3 rounded-lg border border-border">
            <p className="text-xs font-semibold mb-2">Frequency Caps (per lead, per 7 days)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Voice calls</Label>
                <Input type="number" value={settings.voice_cap}
                  onChange={e => setSettings(s => ({ ...s, voice_cap: parseInt(e.target.value) }))}
                  className="h-7 text-xs" min={1} max={20} readOnly={!canAdmin} />
              </div>
              <div>
                <Label className="text-xs mb-1 block">SMS messages</Label>
                <Input type="number" value={settings.sms_cap}
                  onChange={e => setSettings(s => ({ ...s, sms_cap: parseInt(e.target.value) }))}
                  className="h-7 text-xs" min={1} max={50} readOnly={!canAdmin} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DNC notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5">
        <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-destructive">DNC is an absolute block</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Leads marked as DNC cannot be called or texted under any circumstances. This aligns with the Telephone Consumer Protection Act (TCPA) and CAN-SPAM requirements.
            Violations can result in $500–$1,500 per violation in statutory damages.
          </p>
        </div>
      </div>

      {/* Audit log */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            Compliance Override Audit Log
            <Badge variant="outline" className="text-[10px] px-1.5">{overrides.length} records</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-10 rounded" />)}</div>
          ) : overrides.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              <Shield className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No compliance overrides recorded
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    {['Date', 'Lead', 'Override By', 'Checks Overridden', 'Reason'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {overrides.map(o => (
                    <tr key={o.id} className="border-b border-border/50">
                      <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                        {o.created_date ? format(new Date(o.created_date), 'MM/dd HH:mm') : '—'}
                      </td>
                      <td className="px-4 py-2.5 font-medium">
                        {leads[o.lead_id] ? getLeadName(leads[o.lead_id]) : o.lead_id?.slice(0,8)}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{o.override_by_name || o.override_by}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-1 flex-wrap">
                          {(o.checks_overridden || []).map(c => (
                            <Badge key={c} variant="outline" className="text-[9px] px-1 h-4 border-warning/30 text-warning">{c}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground max-w-xs truncate">{o.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}