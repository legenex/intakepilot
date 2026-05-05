import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useOrg } from '@/lib/OrgContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Workflow, Plus, Play, Clock, ArrowRight, Loader2,
  MoreHorizontal, Pencil, Copy, Trash2, Activity,
  CheckCircle2, XCircle, PauseCircle, Power, Search,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { validateWorkflow } from '@/lib/workflowNodeSchemas';

const STATUS_COLORS = {
  draft:  'bg-muted text-muted-foreground',
  active: 'bg-success/10 text-success',
  paused: 'bg-warning/10 text-warning',
};

function ValidationIcon({ nodes = [], edges = [] }) {
  const issues = validateWorkflow(nodes, edges);
  if (nodes.length === 0) return null;
  return issues.length === 0
    ? <CheckCircle2 className="w-3.5 h-3.5 text-success" title="Valid" />
    : <XCircle className="w-3.5 h-3.5 text-destructive" title={issues[0]} />;
}

export default function WorkflowsList() {
  const navigate = useNavigate();
  const { currentOrg } = useOrg();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!currentOrg) return;
    loadWorkflows();
  }, [currentOrg]);

  const loadWorkflows = async () => {
    setLoading(true);
    const data = await base44.entities.Workflow.filter(
      { organization_id: currentOrg.id }, '-created_date', 50
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

  const handleDuplicate = async (wf) => {
    const user = await base44.auth.me();
    const copy = await base44.entities.Workflow.create({
      organization_id: currentOrg.id,
      name: `${wf.name} (copy)`,
      status: 'draft',
      nodes: wf.nodes || [],
      edges: wf.edges || [],
      trigger_config: wf.trigger_config || {},
      created_by: user?.email,
    });
    setWorkflows(ws => [copy, ...ws]);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await base44.entities.Workflow.delete(deleteTarget.id);
    setWorkflows(ws => ws.filter(w => w.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleToggleStatus = async (wf) => {
    const issues = validateWorkflow(wf.nodes || [], wf.edges || []);
    const newStatus = wf.status === 'active' ? 'paused' : 'active';
    if (newStatus === 'active' && issues.length > 0) return;
    await base44.entities.Workflow.update(wf.id, { status: newStatus });
    setWorkflows(ws => ws.map(w => w.id === wf.id ? { ...w, status: newStatus } : w));
  };

  const filtered = workflows.filter(wf => {
    const matchSearch = !search || wf.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || wf.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
        <Button onClick={() => { setNewName(''); setShowModal(true); }} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          New Workflow
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-muted/20">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search workflows…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <div className="flex gap-1">
          {['all','draft','active','paused'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Workflow className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-base mb-1">
              {workflows.length === 0 ? 'No workflows yet' : 'No results'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-5">
              {workflows.length === 0
                ? 'Create your first workflow to automate your lead intake.'
                : 'Try a different search or filter.'}
            </p>
            {workflows.length === 0 && (
              <Button onClick={() => { setNewName(''); setShowModal(true); }} size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" />
                New Workflow
              </Button>
            )}
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
                {filtered.map((wf, i) => {
                  const issues = validateWorkflow(wf.nodes || [], wf.edges || []);
                  const canActivate = issues.length === 0;
                  return (
                    <tr
                      key={wf.id}
                      className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/5'}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ValidationIcon nodes={wf.nodes} edges={wf.edges} />
                          <div className="font-medium">{wf.name}</div>
                        </div>
                        {wf.description && (
                          <div className="text-xs text-muted-foreground mt-0.5 ml-6">{wf.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[wf.status] || STATUS_COLORS.draft}`}>
                            {wf.status === 'active' && <Play className="w-2.5 h-2.5" />}
                            {wf.status}
                          </span>
                          <button
                            onClick={() => handleToggleStatus(wf)}
                            className={`text-muted-foreground hover:text-foreground transition-colors ${wf.status !== 'active' && !canActivate ? 'opacity-30 cursor-not-allowed' : ''}`}
                            disabled={wf.status !== 'active' && !canActivate}
                            title={wf.status === 'active' ? 'Pause' : canActivate ? 'Activate' : 'Fix validation issues first'}
                          >
                            {wf.status === 'active'
                              ? <PauseCircle className="w-4 h-4" />
                              : <Power className="w-4 h-4" />
                            }
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {wf.run_count ?? 0}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {wf.last_run_at ? (
                          <span className="flex items-center gap-1 text-xs">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(wf.last_run_at), { addSuffix: true })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50 text-xs">Never</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-xs h-7"
                            onClick={() => navigate(`/workflows/${wf.id}`)}
                          >
                            <Pencil className="w-3 h-3" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-xs h-7"
                            onClick={() => navigate(`/workflows/${wf.id}/runs`)}
                          >
                            <Activity className="w-3 h-3" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDuplicate(wf)}>
                                <Copy className="w-3.5 h-3.5 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/workflows/${wf.id}/runs`)}>
                                <Activity className="w-3.5 h-3.5 mr-2" />
                                View Runs
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteTarget(wf)}
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.name}" will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}