import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useOrg } from '@/lib/OrgContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Workflow, Plus, Play, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const STATUS_COLORS = {
  draft: 'bg-muted text-muted-foreground',
  active: 'bg-success/10 text-success',
  paused: 'bg-warning/10 text-warning',
};

export default function WorkflowsList() {
  const navigate = useNavigate();
  const { currentOrg } = useOrg();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!currentOrg) return;
    loadWorkflows();
  }, [currentOrg]);

  const loadWorkflows = async () => {
    setLoading(true);
    const data = await base44.entities.Workflow.filter(
      { organization_id: currentOrg.id },
      '-created_date',
      50
    );
    setWorkflows(data);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const user = await base44.auth.me();
    const wf = await base44.entities.Workflow.create({
      organization_id: currentOrg.id,
      name: newName.trim(),
      status: 'draft',
      created_by: user?.email,
    });
    setCreating(false);
    setShowModal(false);
    setNewName('');
    navigate(`/workflows/${wf.id}`);
  };

  const openModal = () => {
    setNewName('');
    setShowModal(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Workflow className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Workflows</h1>
            <p className="text-xs text-muted-foreground">Automate your lead intake pipeline</p>
          </div>
        </div>
        <Button onClick={openModal} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          New Workflow
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : workflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Workflow className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-base mb-1">No workflows yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-5">
              Create your first workflow to automate your lead intake.
            </p>
            <Button onClick={openModal} size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              New Workflow
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Runs</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Last Run</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {workflows.map((wf, i) => (
                  <tr
                    key={wf.id}
                    className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/5'}`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{wf.name}</div>
                      {wf.description && (
                        <div className="text-xs text-muted-foreground mt-0.5">{wf.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[wf.status] || STATUS_COLORS.draft}`}>
                        {wf.status === 'active' && <Play className="w-2.5 h-2.5" />}
                        {wf.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {wf.run_count ?? 0}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {wf.last_run_at ? (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(wf.last_run_at), { addSuffix: true })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">Never</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs"
                        onClick={() => navigate(`/workflows/${wf.id}`)}
                      >
                        Edit <ArrowRight className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Workflow Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New Workflow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="wf-name">Workflow Name</Label>
              <Input
                id="wf-name"
                placeholder="e.g. New Lead Intake"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowModal(false)} disabled={creating}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreate} disabled={!newName.trim() || creating}>
                {creating && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}