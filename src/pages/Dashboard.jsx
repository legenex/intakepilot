import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useOrg } from '@/lib/OrgContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Phone, DollarSign, BarChart3, CheckCircle, Circle, ArrowRight, MessageSquare, Mic, Upload, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const checklistItems = [
  { id: 'twilio', label: 'Connect Twilio', desc: 'Set up your phone numbers for SMS and voice', icon: Phone, href: '/coming-soon' },
  { id: 'voice', label: 'Connect Voice Provider', desc: 'Configure your AI voice engine', icon: Mic, href: '/coming-soon' },
  { id: 'agent', label: 'Create First Agent', desc: 'Design your first AI intake agent', icon: Zap, href: '/coming-soon' },
  { id: 'leads', label: 'Import Leads', desc: 'Upload your existing leads to get started', icon: Upload, href: '/coming-soon' },
];

const statCards = [
  { label: 'Leads Today', value: '—', icon: Users, change: null },
  { label: 'Calls Today', value: '—', icon: Phone, change: null },
  { label: 'Revenue', value: '—', icon: DollarSign, change: null },
  { label: 'Conversion', value: '—', icon: BarChart3, change: null },
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const { currentOrg } = useOrg();
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  if (!currentOrg) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">No Organization Found</h2>
          <p className="text-muted-foreground mb-4">Let's set up your workspace first.</p>
          <Button onClick={() => navigate('/onboarding')}>Complete Setup</Button>
        </div>
      </div>
    );
  }

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Welcome back, {firstName}</h1>
        <p className="text-sm text-muted-foreground mt-1">{currentOrg.name} · {currentOrg.plan ? currentOrg.plan.charAt(0).toUpperCase() + currentOrg.plan.slice(1) : 'Starter'} Plan</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                  <stat.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold font-mono">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Onboarding checklist */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Getting Started</CardTitle>
                <Badge variant="secondary" className="text-xs">0/4 completed</Badge>
              </div>
              <Progress value={0} className="h-1 mt-2" />
            </CardHeader>
            <CardContent className="space-y-1 pt-0">
              {checklistItems.map(item => (
                <Link
                  key={item.id}
                  to={item.href}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
                >
                  <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Empty state */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="h-full">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[280px]">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">Your data will appear here</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Once you connect a source and start processing leads, you'll see real-time analytics here.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Activity feed empty */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">No activity yet. Activity will show up here once you start processing leads.</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}