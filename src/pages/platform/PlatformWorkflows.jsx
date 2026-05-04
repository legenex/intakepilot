import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket } from 'lucide-react';

export default function PlatformWorkflows() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Workflow Engine</h1>
        <p className="text-muted-foreground text-sm mt-1">Coming in major release</p>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <Rocket className="w-12 h-12 text-primary/20 mx-auto mb-4" />
          <p className="text-muted-foreground">Workflow engine health monitoring and management will appear here once the workflow engine is built.</p>
        </CardContent>
      </Card>
    </div>
  );
}