import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useOrg } from '@/lib/OrgContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Upload, AlertTriangle, CheckCircle, ArrowRight, Download } from 'lucide-react';
import { fuzzyMapColumn, ALL_LEAD_FIELDS, normalizePhone, SOURCE_LABELS, VERTICAL_LABELS } from '@/lib/leadUtils';
import { logActivity } from '@/hooks/useLeads';

const STEPS = ['Upload', 'Map Columns', 'Settings', 'Import'];

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return null;
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return obj;
  });
  return { headers, rows };
}

const CONFIDENCE_COLORS = { high: 'text-success', medium: 'text-warning', low: 'text-muted-foreground', unmatched: 'text-destructive/70' };

export default function LeadsImport() {
  const { currentOrg } = useOrg();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [mappings, setMappings] = useState({});
  const [source, setSource] = useState('');
  const [defaultVertical, setDefaultVertical] = useState('');
  const [tcpaConsent, setTcpaConsent] = useState(false);
  const [dupHandling, setDupHandling] = useState('skip');
  const [job, setJob] = useState(null);
  const [progress, setProgress] = useState(0);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f) => {
    if (!f || !f.name.endsWith('.csv')) { toast({ title: 'Please upload a CSV file', variant: 'destructive' }); return; }
    if (f.size > 50 * 1024 * 1024) { toast({ title: 'File too large (max 50MB)', variant: 'destructive' }); return; }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = parseCSV(e.target.result);
      if (!result) { toast({ title: 'Could not parse CSV', variant: 'destructive' }); return; }
      const hasPhone = result.headers.some(h => /phone|mobile|cell/i.test(h));
      if (!hasPhone) { toast({ title: 'CSV must have a phone column', variant: 'destructive' }); return; }
      setParsed(result);
      const auto = {};
      result.headers.forEach(h => { auto[h] = fuzzyMapColumn(h); });
      setMappings(auto);
      setStep(1);
    };
    reader.readAsText(f);
  };

  const runImport = async () => {
    if (!tcpaConsent) return;
    setImporting(true);
    setStep(3);

    const user = await base44.auth.me();
    const importJob = await base44.entities.ImportJob.create({
      organization_id: currentOrg.id,
      status: 'running',
      total_rows: parsed.rows.length,
      started_at: new Date().toISOString(),
      triggered_by: user?.email,
      import_source: source,
      import_vertical: defaultVertical,
      field_mapping: mappings,
      duplicate_handling: dupHandling,
    });
    setJob(importJob);

    let imported = 0, skipped = 0, errors = 0;
    const errorLog = [];
    const existingPhones = new Set();

    if (dupHandling !== 'create') {
      const existing = await base44.entities.Lead.filter({ organization_id: currentOrg.id, deleted_at: null }, '-created_date', 1000);
      existing.forEach(l => { if (l.phone) existingPhones.add(l.phone); });
    }

    for (let i = 0; i < parsed.rows.length; i++) {
      const row = parsed.rows[i];
      try {
        const lead = { organization_id: currentOrg.id, custom_fields: {}, raw_payload: row };
        if (source) lead.source = source;
        if (defaultVertical) lead.vertical = defaultVertical;

        for (const [col, map] of Object.entries(mappings)) {
          const val = row[col];
          if (!val || map.field === '(ignore)') continue;
          if (map.field.startsWith('custom_fields.')) {
            const k = map.field.replace('custom_fields.', '');
            lead.custom_fields[k] = val;
          } else {
            if (map.field === 'medical_treatment' || map.field === 'has_attorney') {
              lead[map.field] = /yes|true|1/i.test(val);
            } else {
              lead[map.field] = val;
            }
          }
        }

        if (!lead.phone) { errors++; errorLog.push({ row: i+2, reason: 'Missing phone', data: row }); continue; }
        lead.phone = normalizePhone(lead.phone);

        if (dupHandling === 'skip' && existingPhones.has(lead.phone)) { skipped++; continue; }
        if (dupHandling === 'update' && existingPhones.has(lead.phone)) {
          const existing = await base44.entities.Lead.filter({ organization_id: currentOrg.id, phone: lead.phone, deleted_at: null });
          if (existing.length > 0) {
            await base44.entities.Lead.update(existing[0].id, lead);
            imported++;
            continue;
          }
        }

        lead.tags = [`import:job_${importJob.id?.slice(-8)}`];
        lead.import_job_id = importJob.id;
        await base44.entities.Lead.create(lead);
        existingPhones.add(lead.phone);
        imported++;
      } catch (e) {
        errors++;
        errorLog.push({ row: i+2, reason: e.message, data: row });
      }
      setProgress(Math.round(((i+1) / parsed.rows.length) * 100));
    }

    const status = errors > 0 && imported === 0 ? 'failed' : errors > 0 ? 'partial' : 'completed';
    await base44.entities.ImportJob.update(importJob.id, {
      status, imported_count: imported, skipped_count: skipped,
      error_count: errors, error_log: errorLog, completed_at: new Date().toISOString(),
    });

    await logActivity({
      organization_id: currentOrg.id, lead_id: 'batch',
      type: 'import', payload: { imported, skipped, errors, job_id: importJob.id, summary: `Imported ${imported} leads from CSV` },
      actor_label: user?.full_name || 'User',
    });

    setResults({ imported, skipped, errors, errorLog, jobId: importJob.id });
    setImporting(false);
    toast({ title: `Import complete: ${imported} imported, ${skipped} skipped, ${errors} errors` });
  };

  const exportErrors = () => {
    if (!results?.errorLog?.length) return;
    const headers = ['row','reason',...(parsed?.headers || [])];
    const rows = results.errorLog.map(e => [e.row, e.reason, ...((parsed?.headers || []).map(h => e.data?.[h] || ''))].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='import_errors.csv'; a.click();
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold">Import Leads</h1>
        <p className="text-sm text-muted-foreground">Upload a CSV file to import leads into your pipeline</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-1.5 ${i <= step ? 'text-foreground' : 'text-muted-foreground'}`}>
              <div className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${i < step ? 'bg-success text-white' : i === step ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {i < step ? '✓' : i+1}
              </div>
              <span className="text-xs hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 ${i < step ? 'bg-success' : 'bg-border'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 0: Upload */}
      {step === 0 && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'}`}
        >
          <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">Drag & drop a CSV file here</p>
          <p className="text-xs text-muted-foreground mb-4">Must have a phone column · Max 50MB</p>
          <label>
            <Button variant="outline" size="sm" asChild><span>Browse File</span></Button>
            <input type="file" accept=".csv" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
          </label>
        </div>
      )}

      {/* Step 1: Mapping */}
      {step === 1 && parsed && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{parsed.rows.length.toLocaleString()} rows · {parsed.headers.length} columns detected</p>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Source Column</th>
                  <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Sample</th>
                  <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Confidence</th>
                  <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Maps To</th>
                </tr>
              </thead>
              <tbody>
                {parsed.headers.map(h => {
                  const map = mappings[h] || { field: `custom_fields.${h}`, confidence: 'low' };
                  const sample = parsed.rows.slice(0,3).map(r => r[h]).filter(Boolean).join(', ');
                  return (
                    <tr key={h} className="border-b border-border/40">
                      <td className="px-3 py-2 font-mono font-medium">{h}</td>
                      <td className="px-3 py-2 text-muted-foreground max-w-32 truncate">{sample || '—'}</td>
                      <td className="px-3 py-2">
                        <span className={`font-medium ${CONFIDENCE_COLORS[map.confidence]}`}>{map.confidence}</span>
                      </td>
                      <td className="px-3 py-2">
                        <Select
                          value={map.field}
                          onValueChange={v => setMappings(m => ({ ...m, [h]: { field: v, confidence: 'manual' } }))}
                        >
                          <SelectTrigger className="h-7 text-xs w-48"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ALL_LEAD_FIELDS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setStep(2)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              Next: Settings <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Settings */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs mb-1.5 block">Lead Source (required)</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger className="text-xs"><SelectValue placeholder="Select source..." /></SelectTrigger>
                <SelectContent>
                  {Object.entries(SOURCE_LABELS).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Default Vertical (if no vertical column)</Label>
              <Select value={defaultVertical} onValueChange={setDefaultVertical}>
                <SelectTrigger className="text-xs"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {Object.entries(VERTICAL_LABELS).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs mb-1.5 block">Duplicate Handling</Label>
            <Select value={dupHandling} onValueChange={setDupHandling}>
              <SelectTrigger className="text-xs w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="skip">Skip duplicates (default)</SelectItem>
                <SelectItem value="update">Update existing</SelectItem>
                <SelectItem value="create">Always create</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 rounded-xl border border-warning/30 bg-warning/5 space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox id="tcpa" checked={tcpaConsent} onCheckedChange={setTcpaConsent} className="mt-0.5" />
              <label htmlFor="tcpa" className="text-xs cursor-pointer">
                <span className="font-semibold">I confirm these leads have valid TCPA consent on file or are exempt from TCPA requirements.</span>
                <p className="text-muted-foreground mt-1">Your name, timestamp, and IP will be logged for compliance audit purposes.</p>
              </label>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button
              onClick={runImport}
              disabled={!source || !tcpaConsent || importing}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              Import {parsed?.rows.length.toLocaleString()} Leads <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Progress / Results */}
      {step === 3 && (
        <div className="space-y-5">
          {importing ? (
            <div className="text-center space-y-4 py-8">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-medium">Importing {parsed?.rows.length.toLocaleString()} rows...</p>
              <div className="max-w-sm mx-auto">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1.5">{progress}%</p>
              </div>
            </div>
          ) : results && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                <Card className="border-success/30 bg-success/5"><CardContent className="p-4 text-center">
                  <CheckCircle className="w-5 h-5 text-success mx-auto mb-1" />
                  <p className="text-2xl font-bold font-mono">{results.imported.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Imported</p>
                </CardContent></Card>
                <Card><CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold font-mono">{results.skipped.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Skipped (duplicates)</p>
                </CardContent></Card>
                <Card className={results.errors > 0 ? 'border-destructive/30 bg-destructive/5' : ''}><CardContent className="p-4 text-center">
                  {results.errors > 0 && <AlertTriangle className="w-5 h-5 text-destructive mx-auto mb-1" />}
                  <p className="text-2xl font-bold font-mono">{results.errors.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Errors</p>
                </CardContent></Card>
              </div>
              {results.errorLog?.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold">Error Log</p>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={exportErrors}>
                      <Download className="w-3 h-3" /> Download CSV
                    </Button>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {results.errorLog.slice(0,10).map((e, i) => (
                      <div key={i} className="text-[10px] text-muted-foreground px-2 py-1 rounded bg-destructive/5">
                        Row {e.row}: {e.reason}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <Button onClick={() => navigate(`/leads?tag=import:job_${results.jobId?.slice(-8)}`)} className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1">
                  View Imported Leads
                </Button>
                <Button variant="outline" onClick={() => { setStep(0); setFile(null); setParsed(null); setResults(null); setProgress(0); }}>
                  Import More
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}