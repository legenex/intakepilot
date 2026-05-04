import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

const SCOPES = [
  'read_orgs',
  'read_users',
  'write_announcements',
  'write_feature_flags',
  'read_audit_log',
  'write_api_keys',
];

export default function PlatformApiKeys() {
  const { toast } = useToast();
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newSecret, setNewSecret] = useState(null);
  const [showSecret, setShowSecret] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    scopes: [],
    expires_at: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
  });

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.PlatformApiKey.list('-created_at', 50);
      setKeys(list);
    } catch (error) {
      console.error('Keys load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createKey = async () => {
    if (!formData.name.trim() || formData.scopes.length === 0) {
      toast({ title: 'Name and scopes required', variant: 'destructive' });
      return;
    }

    const user = await base44.auth.me();
    const secret = Math.random().toString(36).substring(2, 50) + Math.random().toString(36).substring(2, 50);
    const prefix = secret.substring(0, 8);

    // In production, hash the secret before storing
    await base44.entities.PlatformApiKey.create({
      name: formData.name,
      prefix,
      hashed_secret: 'hashed_' + secret, // Placeholder; in production use bcrypt
      scopes: formData.scopes,
      expires_at: new Date(formData.expires_at).toISOString(),
      created_by: user.id,
    });

    setNewSecret(secret);
    setFormData({ name: '', scopes: [], expires_at: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10) });
    loadKeys();
  };

  const revokeKey = async (id) => {
    if (confirm('Revoke this key?')) {
      await base44.entities.PlatformApiKey.update(id, { revoked_at: new Date().toISOString() });
      loadKeys();
    }
  };

  const toggleScope = (scope) => {
    setFormData({
      ...formData,
      scopes: formData.scopes.includes(scope)
        ? formData.scopes.filter(s => s !== scope)
        : [...formData.scopes, scope],
    });
  };

  if (loading) return <div className="p-6 space-y-4">{[1,2].map(i => <Skeleton key={i} className="h-16" />)}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-muted-foreground text-sm mt-1">Platform-level API authentication</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-1.5">
          <Plus className="w-4 h-4" /> Generate Key
        </Button>
      </div>

      {/* New secret display */}
      {newSecret && (
        <Card className="border-success/30 bg-success/5">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-success">Key Created</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">Save this secret now. You won't be able to see it again.</p>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-background border border-border font-mono text-xs">
              {showSecret ? newSecret : '••••••••' + newSecret.slice(8)}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSecret(!showSecret)}
                className="h-6 w-6"
              >
                {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(newSecret);
                  toast({ title: 'Copied to clipboard' });
                }}
                className="h-6 w-6"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <Button onClick={() => setNewSecret(null)} className="w-full">Done</Button>
          </CardContent>
        </Card>
      )}

      {/* Create form */}
      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Generate New API Key</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold block mb-1">Key Name</label>
              <Input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., BI Dashboard, Monitoring Tool"
                className="h-8 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-2">Scopes</label>
              <div className="space-y-1">
                {SCOPES.map(scope => (
                  <label key={scope} className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.scopes.includes(scope)}
                      onChange={() => toggleScope(scope)}
                      className="rounded border-border"
                    />
                    {scope}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Expires In</label>
              <input
                type="date"
                value={formData.expires_at}
                onChange={e => setFormData({ ...formData, expires_at: e.target.value })}
                className="h-8 w-full border border-input rounded px-2 text-xs"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button size="sm" onClick={createKey}>Generate</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keys list */}
      <div className="space-y-2">
        {keys.map(key => (
          <Card key={key.id} className={key.revoked_at ? 'opacity-50' : ''}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-sm">{key.name}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{key.prefix}...{key.prefix.substring(0, 2)}</code>
                  {key.scopes.map(scope => (
                    <Badge key={scope} variant="outline" className="text-[10px] py-0">{scope}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Created {format(new Date(key.created_at), 'MMM d, yyyy')} • Expires {format(new Date(key.expires_at), 'MMM d, yyyy')}
                </p>
                {key.last_used_at && (
                  <p className="text-xs text-muted-foreground">Last used {format(new Date(key.last_used_at), 'MMM d, yyyy')}</p>
                )}
              </div>
              {!key.revoked_at && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => revokeKey(key.id)}
                  className="text-destructive h-8 w-8"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
              {key.revoked_at && (
                <Badge className="bg-destructive/10 text-destructive border-0">Revoked</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}