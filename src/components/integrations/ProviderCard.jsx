import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2, ExternalLink, Eye, EyeOff, Plug, PlugZap, Unplug } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const STATUS_CONFIG = {
  connected: { label: 'Connected', color: 'bg-success/10 text-success border-success/20', icon: CheckCircle2 },
  error: { label: 'Error', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
  disconnected: { label: 'Not Connected', color: 'bg-muted text-muted-foreground', icon: Plug }
};

export default function ProviderCard({ provider, config, credential, canEdit, onSave, onTest, onDisconnect, extraContent }) {
  const [expanded, setExpanded] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [showValues, setShowValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [disconnecting, setDisconnecting] = useState(false);

  const status = credential?.status || 'disconnected';
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.disconnected;
  const StatusIcon = statusCfg.icon;

  const handleConnect = () => {
    // Pre-fill with existing credentials (masked)
    const prefill = {};
    config.fields.forEach(f => { prefill[f.key] = ''; });
    setFormValues(prefill);
    setExpanded(true);
    setTestResult(null);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(formValues);
    setSaving(false);
    setTestResult({ success: false, message: 'Credentials saved. Click "Test Connection" to verify.' });
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await onTest(formValues);
    setTestResult(result);
    setTesting(false);
    if (result.success) setExpanded(false);
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect this provider? Active agents using it will stop working.')) return;
    setDisconnecting(true);
    await onDisconnect();
    setDisconnecting(false);
    setExpanded(false);
    setFormValues({});
    setTestResult(null);
  };

  return (
    <Card className={`border ${status === 'connected' ? 'border-success/20' : status === 'error' ? 'border-destructive/20' : 'border-border'}`}>
      <CardContent className="p-4">
        {/* Header row */}
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
            <PlugZap className={`w-5 h-5 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{config.name}</span>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusCfg.color}`}>
                <StatusIcon className="w-2.5 h-2.5 mr-1" />
                {statusCfg.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
            {credential?.last_tested_at && (
              <p className="text-[10px] text-muted-foreground mt-1">
                Last tested {formatDistanceToNow(new Date(credential.last_tested_at), { addSuffix: true })}
              </p>
            )}
            {status === 'error' && credential?.last_error && (
              <p className="text-[10px] text-destructive mt-1">{credential.last_error}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {status === 'connected' && canEdit && (
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/5"
                onClick={handleDisconnect} disabled={disconnecting}>
                {disconnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unplug className="w-3 h-3" />}
                Disconnect
              </Button>
            )}
            {canEdit && (
              <Button size="sm" variant={status === 'connected' ? 'outline' : 'default'}
                className={`h-7 text-xs gap-1 ${status !== 'connected' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
                onClick={expanded ? () => setExpanded(false) : handleConnect}>
                {status === 'connected' ? 'Edit Credentials' : 'Connect'}
              </Button>
            )}
            <a href={config.docsUrl} target="_blank" rel="noopener noreferrer">
              <Button size="icon" variant="ghost" className="h-7 w-7">
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </a>
          </div>
        </div>

        {/* Credential form */}
        {expanded && canEdit && (
          <div className="mt-4 space-y-3 border-t border-border pt-4">
            <p className="text-xs font-semibold text-muted-foreground">Enter your {config.name} credentials</p>
            {config.fields.map(field => (
              <div key={field.key}>
                <Label className="text-xs mb-1 block">{field.label}</Label>
                <div className="relative">
                  <Input
                    type={field.type === 'password' && !showValues[field.key] ? 'password' : 'text'}
                    value={formValues[field.key] || ''}
                    onChange={e => setFormValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="h-8 text-xs font-mono pr-8"
                  />
                  {field.type === 'password' && (
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowValues(prev => ({ ...prev, [field.key]: !prev[field.key] }))}>
                      {showValues[field.key] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
                {field.help && <p className="text-[10px] text-muted-foreground mt-0.5">{field.help}</p>}
              </div>
            ))}

            {testResult && (
              <div className={`p-2.5 rounded-lg text-xs border ${testResult.success ? 'bg-success/5 border-success/20 text-success' : 'bg-muted border-border text-muted-foreground'}`}>
                {testResult.message}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setExpanded(false)}>Cancel</Button>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-3 h-3 animate-spin" />} Save
              </Button>
              <Button size="sm" className="h-7 text-xs gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleTest} disabled={testing || Object.values(formValues).every(v => !v)}>
                {testing ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                Test Connection
              </Button>
            </div>
          </div>
        )}

        {/* Extra content (e.g., A2P warning) */}
        {extraContent && status === 'connected' && (
          <div className="mt-3 border-t border-border pt-3">{extraContent}</div>
        )}

        {/* Connected metadata */}
        {status === 'connected' && credential?.metadata && Object.keys(credential.metadata).length > 0 && (
          <div className="mt-3 border-t border-border pt-3 flex flex-wrap gap-3">
            {Object.entries(credential.metadata).map(([k, v]) => (
              <div key={k} className="text-xs">
                <span className="text-muted-foreground">{k.replace(/_/g, ' ')}: </span>
                <span className="font-medium">{String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}