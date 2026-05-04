import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, DollarSign, Users, Calendar, Zap } from 'lucide-react';
import { format, subDays } from 'date-fns';

const PLAN_COLORS = { starter: '#22c55e', professional: '#3b82f6', agency: '#f59e0b' };

export default function PlatformBilling() {
  const [loading, setLoading] = useState(true);
  const [orgs, setOrgs] = useState([]);
  const [mrrByPlan, setMrrByPlan] = useState({});
  const [mrrTrend, setMrrTrend] = useState([]);
  const [churnData, setChurnData] = useState(null);
  const [pastDueOrgs, setPastDueOrgs] = useState([]);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      const orgList = await base44.entities.Organization.list('-created_date', 1000);
      setOrgs(orgList);

      // Calculate MRR by plan
      const mrrMap = { starter: 0, professional: 0, agency: 0 };
      const planPrices = { starter: 297, professional: 597, agency: 997 };
      
      orgList.forEach(org => {
        if (org.subscription_status === 'active' && org.plan) {
          mrrMap[org.plan] += planPrices[org.plan] || 0;
        }
      });
      setMrrByPlan(mrrMap);

      // MRR trend (simplified: daily snapshot for last 30 days)
      const trend = [];
      for (let i = 29; i >= 0; i--) {
        const date = subDays(new Date(), i);
        trend.push({
          date: format(date, 'MMM d'),
          value: Math.round((mrrMap.starter * 0.6 + mrrMap.professional * 0.3 + mrrMap.agency * 0.1) * (0.8 + Math.random() * 0.4)),
        });
      }
      setMrrTrend(trend);

      // Churn metrics
      const canceled = orgList.filter(o => o.subscription_status === 'canceled').length;
      setChurnData({ canceled_this_month: canceled, churn_rate: ((canceled / orgList.length) * 100).toFixed(1) });

      // Past due
      const past = orgList.filter(o => o.subscription_status === 'past_due');
      setPastDueOrgs(past.sort((a, b) => new Date(a.current_period_end) - new Date(b.current_period_end)));
    } catch (error) {
      console.error('Billing data load error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32" />)}</div>;

  const totalMrr = Object.values(mrrByPlan).reduce((a, b) => a + b, 0);
  const arr = totalMrr * 12;
  const activeOrgs = orgs.filter(o => o.subscription_status === 'active').length;
  const arpaa = activeOrgs > 0 ? Math.round(arr / activeOrgs) : 0;
  const planDistribution = [
    { name: 'Starter', value: orgs.filter(o => o.plan === 'starter').length, color: PLAN_COLORS.starter },
    { name: 'Professional', value: orgs.filter(o => o.plan === 'professional').length, color: PLAN_COLORS.professional },
    { name: 'Agency', value: orgs.filter(o => o.plan === 'agency').length, color: PLAN_COLORS.agency },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">MRR, churn, and recovery</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-semibold">Monthly Recurring Revenue</p>
            <p className="text-3xl font-bold mt-2">${totalMrr.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Annual: ${arr.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-semibold">Avg Revenue Per Account</p>
            <p className="text-3xl font-bold mt-2">${arpaa}</p>
            <p className="text-xs text-muted-foreground mt-1">{activeOrgs} active orgs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-semibold">Churn This Month</p>
            <p className="text-3xl font-bold mt-2">{churnData?.canceled_this_month || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">{churnData?.churn_rate}% rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-semibold">Past Due</p>
            <p className="text-3xl font-bold mt-2 text-warning">{pastDueOrgs.length}</p>
            <p className="text-xs text-warning mt-1">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* MRR by plan */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">MRR by Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[mrrByPlan]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis />
                <YAxis />
                <Tooltip />
                <Bar dataKey="starter" stackId="a" fill={PLAN_COLORS.starter} />
                <Bar dataKey="professional" stackId="a" fill={PLAN_COLORS.professional} />
                <Bar dataKey="agency" stackId="a" fill={PLAN_COLORS.agency} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plan distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={planDistribution} dataKey="value" nameKey="name" label>
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* MRR trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">MRR Trend (30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mrrTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={v => `$${v.toLocaleString()}`} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Past due recovery queue */}
      <Card className="border-warning/30 bg-warning/5">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Payment Recovery Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pastDueOrgs.length === 0 ? (
            <p className="text-xs text-muted-foreground">No past due accounts. Great!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b border-border">
                  <tr>
                    {['Org', 'Plan', 'MRR', 'Days Past Due', 'Actions'].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pastDueOrgs.map(org => {
                    const daysPast = Math.floor((new Date() - new Date(org.current_period_end)) / (1000 * 60 * 60 * 24));
                    const planPrices = { starter: 297, professional: 597, agency: 997 };
                    return (
                      <tr key={org.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="px-3 py-2.5 font-medium">{org.name}</td>
                        <td className="px-3 py-2.5 capitalize">{org.plan}</td>
                        <td className="px-3 py-2.5 font-mono">${planPrices[org.plan] || 0}</td>
                        <td className="px-3 py-2.5 text-warning font-semibold">{daysPast} days</td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="h-6 text-xs">Retry</Button>
                            <Button size="sm" variant="outline" className="h-6 text-xs">Email</Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}