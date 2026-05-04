import React, { useState, useEffect } from 'react';
import { useOrg } from '@/lib/OrgContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const timezones = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Phoenix', 'Pacific/Honolulu', 'America/Anchorage',
];

export default function OrganizationSettings() {
  const { currentOrg, refreshOrgs } = useOrg();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', slug: '', vertical: '', timezone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentOrg) {
      setForm({
        name: currentOrg.name || '',
        slug: currentOrg.slug || '',
        vertical: currentOrg.vertical || '',
        timezone: currentOrg.timezone || 'America/New_York',
      });
    }
  }, [currentOrg]);

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Organization.update(currentOrg.id, form);
    await refreshOrgs();
    toast({ title: 'Organization updated' });
    setSaving(false);
  };

  if (!currentOrg) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Organization Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Organization Name</Label>
          <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="mt-1" />
        </div>
        <div>
          <Label>Slug</Label>
          <Input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="mt-1 font-mono text-sm" />
        </div>
        <div>
          <Label>Practice Area</Label>
          <Select value={form.vertical} onValueChange={v => setForm({...form, vertical: v})}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="personal_injury">Personal Injury</SelectItem>
              <SelectItem value="mass_tort">Mass Tort</SelectItem>
              <SelectItem value="workers_comp">Workers Comp</SelectItem>
              <SelectItem value="multi_vertical">Multi-Vertical</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Timezone</Label>
          <Select value={form.timezone} onValueChange={v => setForm({...form, timezone: v})}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {timezones.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}