import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Shield, Loader2, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function PlatformDangerZone() {
  const { toast } = useToast();
  const [orgs, setOrgs] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [wipeConfirm, setWipeConfirm] = useState(false);
  const [wipeLoading, setWipeLoading] = useState(false);

  useEffect(() => {
    loadOrgs();
  }, []);

  const loadOrgs = async () => {
    const list = await base44.entities.Organization.list();
    setOrgs(list);
  };

  const softDeleteOrg = async () => {
    if (!selectedOrg || confirmText !== selectedOrg.name || reason.trim().length < 10) {
      toast({ title: 'Validation failed', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const softDeleteAt = new Date();
      softDeleteAt.setDate(softDeleteAt.getDate() + 7);

      await base44.entities.Organization.update(selectedOrg.id, {
        soft_delete_at: softDeleteAt.toISOString(),
      });

      // Log to audit
      const user = await base44.auth.me();
      await base44.entities.SuperAdminAuditLog.create({
        user_id: user.id,
        action_type: 'org_deleted',
        target_type: 'organization',
        target_id: selectedOrg.id,
        target_organization_id: selectedOrg.id,
        reason,
      });

      toast({ title: 'Organization marked for deletion. 7-day grace period active.' });
      setSelectedOrg(null);
      setConfirmText('');
      setReason('');
      loadOrgs();
    } finally {
      setLoading(false);
    }
  };

  const restoreOrg = async (orgId) => {
    await base44.entities.Organization.update(orgId, { soft_delete_at: null });
    
    const user = await base44.auth.me();
    await base44.entities.SuperAdminAuditLog.create({
      user_id: user.id,
      action_type: 'org_resumed',
      target_type: 'organization',
      target_id: orgId,
    });

    loadOrgs();
  };

  const handleWipeNonLegenex = async () => {
    setWipeLoading(true);
    try {
      const result = await base44.functions.invoke('wipeNonLegenexOrgs', {});
      const report = result.data;
      toast({
        title: 'Wipe complete',
        description: `Deleted ${report.deleted_orgs.length} organizations. Total records deleted: ${Object.values(report.deleted_records).reduce((a, b) => a + b, 0)}.`,
      });
      loadOrgs();
      setWipeConfirm(false);
    } catch (err) {
      toast({ title: 'Wipe failed', description: err.message, variant: 'destructive' });
    } finally {
      setWipeLoading(false);
    }
  };

  const pendingDeletion = orgs.filter(o => o.soft_delete_at);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-6 h-6 text-destructive" />
        <h1 className="text-2xl font-bold text-destructive">Danger Zone</h1>
      </div>

      {/* Pending deletions */}
      {pendingDeletion.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-destructive">Pending Deletion ({pendingDeletion.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingDeletion.map(org => (
              <div key={org.id} className="flex items-center justify-between p-2 rounded-lg bg-background border border-destructive/20">
                <div>
                  <p className="font-semibold text-sm">{org.name}</p>
                  <p className="text-xs text-muted-foreground">Will be hard-deleted on {new Date(org.soft_delete_at).toLocaleDateString()}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => restoreOrg(org.id)}
                  className="text-xs"
                >
                  Restore
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Hard delete org */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Hard Delete Organization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Select an organization to mark for deletion. The org will enter a 7-day grace period before permanent hard deletion.
          </p>
          <select
            value={selectedOrg?.id || ''}
            onChange={e => {
              const org = orgs.find(o => o.id === e.target.value);
              setSelectedOrg(org);
              setConfirmText('');
              setReason('');
            }}
            className="w-full h-9 px-3 border border-input rounded text-sm"
          >
            <option value="">— Select Organization —</option>
            {orgs.filter(o => !o.soft_delete_at).map(org => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>

          {selectedOrg && (
            <>
              <div>
                <label className="text-xs font-semibold block mb-1">Type organization name to confirm</label>
                <Input
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  placeholder={selectedOrg.name}
                  className="h-8 text-xs"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Must match exactly: "{selectedOrg.name}"</p>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Reason (min 10 chars)</label>
                <Textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Why is this org being deleted?"
                  className="h-20 text-xs"
                />
              </div>
              <Button
                variant="destructive"
                onClick={softDeleteOrg}
                disabled={loading || confirmText !== selectedOrg.name || reason.length < 10}
                className="w-full"
              >
                {loading ? 'Processing...' : 'Mark for Deletion (7-day grace)'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Wipe non-Legenex orgs */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Wipe Non-Legenex Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Permanently delete all organizations except Legenex. Consolidates all @legenex.com emails into the canonical Legenex organization. Use only for emergency cleanup.
          </p>
          <Button
            variant="destructive"
            onClick={() => setWipeConfirm(true)}
            disabled={wipeLoading}
            className="text-xs gap-2"
          >
            {wipeLoading && <Loader2 className="w-3 h-3 animate-spin" />}
            <Zap className="w-4 h-4" /> Wipe Non-Legenex
          </Button>
        </CardContent>
      </Card>

      {/* Reset analytics caches */}
      <Card className="border-warning/30">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Reset Platform Caches</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">Force recompute of MRR, ARR, and health scores. Useful after data migrations.</p>
          <Button variant="outline" className="text-xs">Reset Caches</Button>
        </CardContent>
      </Card>

      {/* Wipe confirmation */}
      <AlertDialog open={wipeConfirm} onOpenChange={setWipeConfirm}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogTitle>Delete all non-Legenex organizations?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 text-xs">
            <p>This will permanently hard-delete every organization except Legenex and all their associated leads, calls, messages, and other records.</p>
            <p className="font-semibold">All @legenex.com emails will be consolidated into the canonical Legenex organization (Agency plan).</p>
            <p className="text-destructive">This action cannot be undone.</p>
            <p>Type <span className="font-mono font-semibold">DELETE-ALL-EXCEPT-LEGENEX</span> to confirm:</p>
            <Input placeholder="DELETE-ALL-EXCEPT-LEGENEX" className="h-8 text-xs font-mono" disabled />
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel disabled={wipeLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWipeNonLegenex}
              disabled={wipeLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {wipeLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Wipe All
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}