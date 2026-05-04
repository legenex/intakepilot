import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from 'lucide-react';

export default function PlatformBigQuery() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">BigQuery Sync Health</h1>
        <p className="text-muted-foreground text-sm mt-1">Coming soon</p>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <Database className="w-12 h-12 text-primary/20 mx-auto mb-4" />
          <p className="text-muted-foreground">BigQuery sync activity and health metrics will appear here once BigQuery integration is available.</p>
        </CardContent>
      </Card>
    </div>
  );
}