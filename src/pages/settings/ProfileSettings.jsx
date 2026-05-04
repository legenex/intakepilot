import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useTheme } from '@/lib/ThemeProvider';
import { Loader2 } from 'lucide-react';

export default function ProfileSettings() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    localStorage.setItem('intakepilot-theme', theme);
    toast({ title: 'Theme preference saved' });
    setSaving(false);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input value={user.full_name || ''} disabled className="mt-1 opacity-70" />
            <p className="text-xs text-muted-foreground mt-1">Name is managed through your account settings.</p>
          </div>
          <div>
            <Label>Email</Label>
            <Input value={user.email || ''} disabled className="mt-1 opacity-70" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="mt-1 w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Save Preferences
      </Button>
    </div>
  );
}