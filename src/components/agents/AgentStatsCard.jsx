import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function AgentStatsCard({ label, value, icon: Icon, color }) {
  // Icon is passed as a prop
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <p className="text-xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      </CardContent>
    </Card>
  );
}