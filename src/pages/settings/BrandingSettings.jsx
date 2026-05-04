import React, { useState, useEffect } from 'react';
import { useOrg } from '@/lib/OrgContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Upload, Loader2 } from 'lucide-react';

const brandColors = [
  '#22D3EE', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444',
  '#F59E0B', '#10B981', '#6366F1', '#14B8A6', '#F97316',
];

export default function BrandingSettings() {
  const { currentOrg, refreshOrgs } = useOrg();
  const { toast } = useToast();
  const [accentColor, setAccentColor] = useState('#22D3EE');
  const [logoUrl, setLogoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (currentOrg) {
      setAccentColor(currentOrg.accent_color || '#22D3EE');
      setLogoUrl(currentOrg.logo_url || '');
    }
  }, [currentOrg]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setLogoUrl(file_url);
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Organization.update(currentOrg.id, {
      accent_color: accentColor,
      logo_url: logoUrl,
    });
    await refreshOrgs();
    toast({ title: 'Branding updated' });
    setSaving(false);
  };

  if (!currentOrg) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Logo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Upload className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <Label htmlFor="logo-upload" className="cursor-pointer">
                <Button variant="outline" size="sm" asChild disabled={uploading}>
                  <span>{uploading ? 'Uploading...' : 'Upload Logo'}</span>
                </Button>
              </Label>
              <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              <p className="text-xs text-muted-foreground mt-1">Recommended: 256×256px PNG or SVG</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accent Color</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {brandColors.map(color => (
              <button
                key={color}
                onClick={() => setAccentColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  accentColor === color ? 'border-foreground scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg border border-border" style={{ backgroundColor: accentColor }} />
            <Input value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-32 font-mono text-sm" />
          </div>

          {/* Preview */}
          <div className="mt-6 p-4 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-2">Preview</p>
            <Button size="sm" style={{ backgroundColor: accentColor, color: '#0A0E1A' }}>
              Sample Button
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Save Branding
      </Button>
    </div>
  );
}