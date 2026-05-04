import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function StatCard({ icon: IconComponent, label, value, color, raw }) {
  return (
    <Card className="hover:border-border/80 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">{label}</span>
          <IconComponent className={`w-3.5 h-3.5 ${color}`} />
        </div>
        <div className="text-2xl font-bold font-mono">
          {raw ? value : (typeof value === 'number' ? value.toLocaleString() : value)}
        </div>
      </CardContent>
    </Card>
  );
}