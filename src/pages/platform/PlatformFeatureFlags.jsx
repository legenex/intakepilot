import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function PlatformFeatureFlags() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    enabled_globally: false,
    rollout_percentage: 0,
  });

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    setLoading(true);
    try {
      let list = await base44.entities.FeatureFlag.list('-created_at', 50);
      
      // Seed initial flags if empty
      if (list.length === 0) {
        const seedFlags = [
          { name: 'workflow_canvas_v2', description: 'Visual workflow builder canvas — coming in next major release', enabled_globally: false, targeted_plans: [] },
          { name: 'bigquery_sync', description: 'Two-way BigQuery data sync', enabled_globally: false, targeted_plans: [] },
          { name: 'warm_transfer_v2', description: 'Enhanced warm transfer with mid-call buyer match', enabled_globally: false, targeted_plans: [] },
          { name: 'ai_prompt_enhancer', description: 'AI-powered agent prompt improvement using past transcripts', enabled_globally: false, targeted_plans: ['professional', 'agency'] },
        ];
        
        for (const flag of seedFlags) {
          await base44.entities.FeatureFlag.create({
            ...flag,
            targeted_orgs: [],
            rollout_percentage: 0,
          });
        }
        
        list = await base44.entities.FeatureFlag.list('-created_at', 50);
      }
      
      setFlags(list);
    } catch (error) {
      console.error('Flags load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFlag = async () => {
    if (!formData.name.trim()) {
      alert('Flag name required');
      return;
    }

    const user = await base44.auth.me();
    await base44.entities.FeatureFlag.create({
      ...formData,
      targeted_orgs: [],
      targeted_plans: [],
      created_by: user.id,
      usage_count_7d: 0,
    });

    setShowCreate(false);
    setFormData({ name: '', description: '', enabled_globally: false, rollout_percentage: 0 });
    loadFlags();
  };

  const toggleGlobal = async (id, current) => {
    await base44.entities.FeatureFlag.update(id, { enabled_globally: !current });
    loadFlags();
  };

  const deleteFlag = async (id) => {
    if (confirm('Delete this flag?')) {
      await base44.entities.FeatureFlag.delete(id);
      loadFlags();
    }
  };

  if (loading) return <div className="p-6 space-y-4">{[1,2].map(i => <Skeleton key={i} className="h-16" />)}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Feature Flags</h1>
          <p className="text-muted-foreground text-sm mt-1">Control feature rollout and targeting</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-1.5">
          <Plus className="w-4 h-4" /> New Flag
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">New Feature Flag</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-semibold block mb-1">Flag Name</label>
              <Input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., workflow_canvas_v2"
                className="h-8 text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Description</label>
              <Input
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="What is this flag for?"
                className="h-8 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="global"
                checked={formData.enabled_globally}
                onChange={e => setFormData({ ...formData, enabled_globally: e.target.checked })}
                className="rounded border-border"
              />
              <label htmlFor="global" className="text-xs cursor-pointer">Enable globally for all orgs</label>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Rollout % (0-100)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.rollout_percentage}
                onChange={e => setFormData({ ...formData, rollout_percentage: Number(e.target.value) })}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">{formData.rollout_percentage}% of orgs</p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button size="sm" onClick={createFlag}>Create</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Flags list */}
      <div className="space-y-2">
        {flags.map(flag => (
          <Card key={flag.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-sm">{flag.name}</p>
                <p className="text-xs text-muted-foreground">{flag.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  {flag.enabled_globally && (
                    <Badge className="text-[10px] bg-primary/10 text-primary py-0">Global</Badge>
                  )}
                  {flag.rollout_percentage > 0 && (
                    <Badge variant="outline" className="text-[10px] py-0">{flag.rollout_percentage}% rollout</Badge>
                  )}
                  <p className="text-[10px] text-muted-foreground">Modified {format(new Date(flag.last_modified_at || flag.created_at), 'MMM d')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleGlobal(flag.id, flag.enabled_globally)}
                  className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${
                    flag.enabled_globally ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-background transition-transform ${
                      flag.enabled_globally ? 'translate-x-4.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteFlag(flag.id)}
                  className="text-destructive h-8 w-8"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}