import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp } from 'lucide-react';

const STAGES = [
  { status: 'new', label: 'RAW', color: '#64748b' },
  { status: 'qualified_sms', label: 'QUALIFIED', color: '#3b82f6' },
  { status: 'phone_verified', label: 'PHONE VERIFIED', color: '#22d3ee' },
  { status: 'pvql', label: 'PVQL', color: '#8b5cf6' },
  { status: 'retainer_signed', label: 'RETAINER', color: '#10b981' },
  { status: 'sold', label: 'SOLD', color: '#10b981' },
];

function getDateStart(range) {
  const now = new Date();
  if (range === 'today') { const d = new Date(now); d.setHours(0,0,0,0); return d; }
  if (range === '7d') { const d = new Date(now); d.setDate(d.getDate()-7); return d; }
  const d = new Date(now); d.setDate(d.getDate()-30); return d;
}

export default function PipelineFunnel({ orgId, range }) {
  const navigate = useNavigate();
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!orgId) return;
    const since = getDateStart(range).toISOString();
    const leads = await base44.entities.Lead.filter(
      { organization_id: orgId, deleted_at: null }, '-created_date', 1000
    );
    const inRange = leads.filter(l => l.created_date >= since);
    const c = {};
    STAGES.forEach(s => {
      c[s.status] = inRange.filter(l => {
        const idx = ['new','engaged_sms','qualified_sms','phone_verified','pvql','retainer_signed','sold','disqualified','dnc'].indexOf(l.status);
        const stageIdx = ['new','engaged_sms','qualified_sms','phone_verified','pvql','retainer_signed','sold','disqualified','dnc'].indexOf(s.status);
        return idx >= stageIdx;
      }).length;
    });
    setCounts(c);
    setLoading(false);
  }, [orgId, range]);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return (
    <Card><CardContent className="p-4"><Skeleton className="h-32 w-full" /></CardContent></Card>
  );

  const max = counts ? Math.max(...Object.values(counts), 1) : 1;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" /> Pipeline Funnel
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-2">
          {STAGES.map((stage, i) => {
            const count = counts?.[stage.status] || 0;
            const prev = i > 0 ? counts?.[STAGES[i-1].status] || 0 : null;
            const pct = prev ? Math.round((count / Math.max(prev, 1)) * 100) : null;
            const barWidth = Math.round((count / max) * 100);
            return (
              <button
                key={stage.status}
                onClick={() => navigate(`/leads?status=${stage.status}`)}
                className="w-full text-left group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-semibold text-muted-foreground w-24 flex-shrink-0">{stage.label}</span>
                  <div className="flex-1 h-5 bg-muted rounded-sm overflow-hidden">
                    <div
                      className="h-full rounded-sm transition-all group-hover:opacity-90"
                      style={{ width: `${barWidth}%`, backgroundColor: stage.color, minWidth: count > 0 ? 4 : 0 }}
                    />
                  </div>
                  <span className="text-xs font-mono font-semibold w-12 text-right">{count.toLocaleString()}</span>
                  {pct !== null && (
                    <span className="text-[10px] text-muted-foreground w-12 text-right">{pct}%</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}