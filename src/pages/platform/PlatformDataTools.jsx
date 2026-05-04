import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function PlatformDataTools() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Data Tools</h1>
        <p className="text-muted-foreground text-sm mt-1">Advanced data management and compliance</p>
      </div>

      {/* Bulk export */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Download className="w-4 h-4" />
            Bulk Export
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Export leads, calls, messages, and deliveries to CSV or JSON. Useful for analysis or migration.
          </p>
          <Button variant="outline" size="sm">Export Data</Button>
        </CardContent>
      </Card>

      {/* PII redaction */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            PII Redaction (GDPR/CCPA)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Delete personally identifiable information from records per right-to-deletion requests. Preserves record IDs for analytics.
          </p>
          <Button variant="outline" size="sm">Redact Records</Button>
        </CardContent>
      </Card>

      {/* Data integrity scanner */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Data Integrity Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Detect orphaned records, malformed data, missing consent flags, and other data quality issues across the platform.
          </p>
          <Button variant="outline" size="sm">Run Scan</Button>
        </CardContent>
      </Card>

      {/* Bulk import */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Bulk Import (Admin)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Import data on behalf of an organization (fraud recovery, migrations). Requires reason audit log entry.
          </p>
          <Button variant="outline" size="sm">Import Data</Button>
        </CardContent>
      </Card>
    </div>
  );
}