import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pause, X } from 'lucide-react';
import { format } from 'date-fns';

export default function PlatformAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    type: 'banner',
    target_scope: 'all',
    severity: 'info',
    title: '',
    message_markdown: '',
    starts_at: new Date().toISOString().slice(0, 16),
    ends_at: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.Announcement.list('-created_date', 50);
      setAnnouncements(list);
    } catch (error) {
      console.error('Announcements load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAnnouncement = async () => {
    if (!formData.title.trim() || !formData.message_markdown.trim()) {
      alert('Title and message required');
      return;
    }

    const user = await base44.auth.me();
    await base44.entities.Announcement.create({
      ...formData,
      created_by: user.id,
      status: new Date(formData.starts_at) <= new Date() ? 'active' : 'scheduled',
      view_count: 0,
      dismissal_count: 0,
    });

    setShowCreate(false);
    setFormData({
      type: 'banner',
      target_scope: 'all',
      severity: 'info',
      title: '',
      message_markdown: '',
      starts_at: new Date().toISOString().slice(0, 16),
      ends_at: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    });
    loadAnnouncements();
  };

  const pauseAnnouncement = async (id) => {
    await base44.entities.Announcement.update(id, { status: 'ended' });
    loadAnnouncements();
  };

  if (loading) return <div className="p-6 space-y-4">{[1,2].map(i => <Skeleton key={i} className="h-32" />)}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-muted-foreground text-sm mt-1">Broadcast messages to users</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-1.5">
          <Plus className="w-4 h-4" /> Create
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">New Announcement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1">Type</label>
                <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">Banner</SelectItem>
                    <SelectItem value="modal">Modal</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Severity</label>
                <Select value={formData.severity} onValueChange={v => setFormData({ ...formData, severity: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Title</label>
              <Input
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Announcement title"
                className="h-8 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Message</label>
              <Textarea
                value={formData.message_markdown}
                onChange={e => setFormData({ ...formData, message_markdown: e.target.value })}
                placeholder="Markdown supported"
                className="h-20 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1">Starts</label>
                <input
                  type="datetime-local"
                  value={formData.starts_at}
                  onChange={e => setFormData({ ...formData, starts_at: e.target.value })}
                  className="h-8 w-full border border-input rounded px-2 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Ends</label>
                <input
                  type="datetime-local"
                  value={formData.ends_at}
                  onChange={e => setFormData({ ...formData, ends_at: e.target.value })}
                  className="h-8 w-full border border-input rounded px-2 text-xs"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button size="sm" onClick={createAnnouncement}>Create</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Announcements list */}
      <div className="space-y-2">
        {announcements.map(ann => (
          <Card key={ann.id}>
            <CardContent className="p-4 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm">{ann.title}</p>
                  <Badge variant="outline" className={`text-[10px] py-0 ${
                    ann.severity === 'critical' ? 'bg-destructive/10 text-destructive' :
                    ann.severity === 'warning' ? 'bg-warning/10 text-warning' :
                    'bg-info/10 text-info'
                  }`}>{ann.severity}</Badge>
                  <Badge variant="outline" className="text-[10px] py-0 capitalize">{ann.type}</Badge>
                  <Badge variant="outline" className="text-[10px] py-0 capitalize">{ann.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{ann.message_markdown.slice(0, 80)}...</p>
                <p className="text-[10px] text-muted-foreground">
                  {format(new Date(ann.starts_at), 'PPp')} to {format(new Date(ann.ends_at), 'PPp')}
                </p>
              </div>
              {ann.status === 'active' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => pauseAnnouncement(ann.id)}
                  className="text-xs h-8"
                >
                  <Pause className="w-3 h-3" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}