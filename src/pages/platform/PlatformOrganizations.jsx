import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical, Download, Zap, Eye, Edit, LogIn, Lock, Trash2, Loader2 } from 'lucide-react';

export default function PlatformOrganizations() {
  const { toast } = useToast();
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, org: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ name: '', reason: '' });
  const [hasRunAutoWipe, setHasRunAutoWipe] = useState(false);

  useEffect(() => {
    loadOrgs();
  }, []);

  const loadOrgs = async () => {
    try {
      const result = await base44.functions.invoke('getOrganizations', {});
      const orgsData = result.data || [];
      setOrgs(orgsData);

      // Auto-run wipe if duplicates detected and not yet run
      if (!hasRunAutoWipe && orgsData.length > 1) {
        await runAutoWipe();
        setHasRunAutoWipe(true);
      }
    } catch (err) {
      console.error('Failed to load orgs:', err);
    } finally {
      setLoading(false);
    }
  };

  const runAutoWipe = async () => {
    try {
      const result = await base44.functions.invoke('wipeNonLegenexOrgs', {});
      const report = result.data;
      if (report.deleted_orgs.length > 0) {
        toast({
          title: 'Cleanup complete',
          description: `Consolidated ${report.deleted_orgs.length} duplicate orgs into Legenex (Agency plan).`,
        });
        await loadOrgs();
      }
    } catch (err) {
      console.error('Auto-wipe error:', err);
    }
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Name', 'Slug', 'Plan', 'Status', 'Vertical', 'Created', 'Trial Ends'].join(','),
      ...orgs.map(org => [
        org.id,
        org.name,
        org.slug || '',
        org.plan,
        org.subscription_status,
        org.vertical || '',
        new Date(org.created_date).toLocaleDateString(),
        org.trial_ends_at ? new Date(org.trial_ends_at).toLocaleDateString() : '',
      ].map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `organizations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeduplicate = async () => {
    setActionLoading(true);
    try {
      const result = await base44.functions.invoke('deduplicateOrganizations', {});
      const report = result.data;
      toast({
        title: 'Deduplication complete',
        description: `Removed ${report.duplicates_removed} duplicate organizations.`,
      });
      await loadOrgs();
    } catch (err) {
      toast({ title: 'Deduplication failed', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm.name !== deleteModal.org.name) {
      toast({ title: 'Organization name does not match', variant: 'destructive' });
      return;
    }
    if (deleteConfirm.reason.length < 10) {
      toast({ title: 'Reason must be at least 10 characters', variant: 'destructive' });
      return;
    }

    setActionLoading(true);
    try {
      await base44.functions.invoke('deleteOrganization', {
        organization_id: deleteModal.org.id,
        reason: deleteConfirm.reason,
      });
      toast({ title: 'Organization deleted' });
      setDeleteModal({ open: false, org: null });
      setDeleteConfirm({ name: '', reason: '' });
      await loadOrgs();
    } catch (err) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleDisable = async (org) => {
    try {
      await base44.asServiceRole.entities.Organization.update(org.id, {
        status_disabled: !org.status_disabled,
      });
      toast({ title: org.status_disabled ? 'Organization enabled' : 'Organization disabled' });
      await loadOrgs();
    } catch (err) {
      toast({ title: 'Failed to update', variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="p-6 space-y-4"><Skeleton className="h-12 rounded" /><Skeleton className="h-64 rounded" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Organizations</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleDeduplicate} disabled={actionLoading} className="gap-2">
            {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <Zap className="w-4 h-4" /> Deduplicate
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Name</th>
                  <th className="px-6 py-3 text-left font-semibold">Plan</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-left font-semibold">Health</th>
                  <th className="px-6 py-3 text-left font-semibold">Created</th>
                  <th className="px-6 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orgs.map(org => (
                  <tr key={org.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{org.name}</p>
                        <p className="text-xs text-muted-foreground">{org.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="capitalize">{org.plan}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Badge
                          variant={org.subscription_status === 'active' ? 'default' : 'secondary'}
                          className="capitalize"
                        >
                          {org.subscription_status}
                        </Badge>
                        {org.status_disabled && <Badge className="bg-muted text-muted-foreground">Disabled</Badge>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-success to-success/50 flex items-center justify-center text-xs text-white">
                          {org.stats_cache?.health_score ? Math.round(org.stats_cache.health_score) : 0}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(org.created_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <a href={`/platform/organizations/${org.id}`} className="cursor-pointer">
                              <Eye className="w-4 h-4 mr-2" /> View Details
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={`/platform/organizations/${org.id}?mode=edit`} className="cursor-pointer">
                              <Edit className="w-4 h-4 mr-2" /> Edit
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleDisable(org)}>
                            <Lock className="w-4 h-4 mr-2" /> {org.status_disabled ? 'Enable' : 'Disable'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteModal({ open: true, org })}>
                            <Trash2 className="w-4 h-4 mr-2 text-destructive" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation modal */}
      <AlertDialog open={deleteModal.open} onOpenChange={open => setDeleteModal({ ...deleteModal, open })}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogTitle>Delete {deleteModal.org?.name}?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 text-xs">
            <p>This will permanently delete this organization and all associated records (leads, calls, messages, members, etc.). This cannot be undone.</p>
            <div>
              <label className="text-xs font-semibold">Type organization name to confirm:</label>
              <Input
                placeholder={deleteModal.org?.name}
                value={deleteConfirm.name}
                onChange={e => setDeleteConfirm({ ...deleteConfirm, name: e.target.value })}
                className="mt-1 h-8"
              />
            </div>
            <div>
              <label className="text-xs font-semibold">Reason (min 10 chars, required):</label>
              <textarea
                placeholder="Why are you deleting this organization?"
                value={deleteConfirm.reason}
                onChange={e => setDeleteConfirm({ ...deleteConfirm, reason: e.target.value })}
                className="mt-1 w-full p-2 border rounded text-xs h-20"
              />
            </div>
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={
                actionLoading ||
                deleteConfirm.name !== deleteModal.org?.name ||
                deleteConfirm.reason.length < 10
              }
              className="bg-destructive hover:bg-destructive/90"
            >
              {actionLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}