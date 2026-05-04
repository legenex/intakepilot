import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Building2, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react';

export default function PlatformOrganizationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(searchParams.get('mode') === 'edit');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [original, setOriginal] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadOrg();
  }, [id]);

  const loadOrg = async () => {
    try {
      const result = await base44.asServiceRole.entities.Organization.filter({ id });
      if (result.length) {
        setOrg(result[0]);
        setFormData(result[0]);
        setOriginal(result[0]);
      }
    } catch (err) {
      console.error('Failed to load org:', err);
      toast({ title: 'Failed to load organization', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editMode) return;
    setSaving(true);
    try {
      const changes = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] !== original[key]) {
          changes[key] = formData[key];
        }
      });

      if (Object.keys(changes).length === 0) {
        toast({ title: 'No changes to save' });
        setEditMode(false);
        setSaving(false);
        return;
      }

      await base44.asServiceRole.entities.Organization.update(id, changes);
      
      // Log audit
      await base44.functions.invoke('logSuperAdminAction', {
        action_type: 'edit_org',
        target_id: id,
        before_state: original,
        after_state: formData,
        reason: 'Organization settings updated',
      });

      setOriginal(formData);
      setEditMode(false);
      await loadOrg();
      toast({ title: 'Organization updated' });
    } catch (err) {
      toast({ title: 'Failed to save', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(original);
    setEditMode(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Type the organization name to confirm soft delete:')) return;
    setSaving(true);
    try {
      await base44.asServiceRole.entities.Organization.update(id, {
        soft_delete_at: new Date().toISOString(),
      });
      await base44.functions.invoke('logSuperAdminAction', {
        action_type: 'org_deleted',
        target_id: id,
        reason: 'Organization soft-deleted',
      });
      toast({ title: 'Organization marked for deletion' });
      navigate('/platform/organizations');
    } catch (err) {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleToggleDisable = async () => {
    setSaving(true);
    try {
      const newDisabled = !org.status_disabled;
      await base44.asServiceRole.entities.Organization.update(id, {
        status_disabled: newDisabled,
        disabled_at: newDisabled ? new Date().toISOString() : null,
      });
      await base44.functions.invoke('logSuperAdminAction', {
        action_type: 'org_' + (newDisabled ? 'disabled' : 'enabled'),
        target_id: id,
        reason: `Organization ${newDisabled ? 'disabled' : 'enabled'}`,
      });
      await loadOrg();
      toast({ title: newDisabled ? 'Organization disabled' : 'Organization enabled' });
    } catch (err) {
      toast({ title: 'Failed to update', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6"><Skeleton className="h-64 rounded-lg" /></div>;
  }

  if (!org) {
    return <div className="p-6 text-muted-foreground">Organization not found</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{org.name}</h1>
              {org.soft_delete_at && (
                <Badge className="bg-destructive/20 text-destructive">Pending Deletion</Badge>
              )}
              {org.status_disabled && <Badge className="bg-muted text-muted-foreground">Disabled</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{org.slug}</p>
            <div className="flex gap-2 mt-2">
              <Badge>{org.plan}</Badge>
              <Badge variant={org.subscription_status === 'active' ? 'default' : 'secondary'}>
                {org.subscription_status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-shrink-0">
          {editMode ? (
            <>
              <Button size="sm" onClick={handleCancel} variant="outline" disabled={saving}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                Save
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant={org.status_disabled ? 'outline' : 'secondary'}
                onClick={handleToggleDisable}
                disabled={saving}
              >
                {org.status_disabled ? 'Enable' : 'Disable'}
              </Button>
              {!org.soft_delete_at && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={saving}
                >
                  Delete
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="p-4 bg-destructive/5 border border-destructive/30 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-sm">Soft Delete Organization?</p>
            <p className="text-xs text-muted-foreground mt-1">
              The organization will be marked for deletion. You have 7 days to restore it before permanent deletion.
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="destructive" onClick={handleDelete} disabled={saving}>
                {saving && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                Confirm Delete
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="calls">Calls</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Organization Settings</CardTitle>
            </CardHeader>
            <CardContent className={`space-y-4 ${editMode ? 'bg-muted/30' : ''}`}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Organization Name</Label>
                  {editMode ? (
                    <Input
                      className="mt-1"
                      value={formData.name || ''}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  ) : (
                    <p className="mt-1 font-semibold">{org.name}</p>
                  )}
                </div>

                <div>
                  <Label className="text-xs">Slug</Label>
                  {editMode ? (
                    <Input
                      className="mt-1"
                      value={formData.slug || ''}
                      onChange={e => setFormData({ ...formData, slug: e.target.value })}
                    />
                  ) : (
                    <p className="mt-1 font-semibold">{org.slug}</p>
                  )}
                </div>

                <div>
                  <Label className="text-xs">Vertical</Label>
                  {editMode ? (
                    <Select value={formData.vertical || ''} onValueChange={v => setFormData({ ...formData, vertical: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal_injury">Personal Injury</SelectItem>
                        <SelectItem value="mass_tort">Mass Tort</SelectItem>
                        <SelectItem value="workers_comp">Workers Comp</SelectItem>
                        <SelectItem value="multi_vertical">Multi-Vertical</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-1 font-semibold capitalize">{org.vertical}</p>
                  )}
                </div>

                <div>
                  <Label className="text-xs">Plan</Label>
                  {editMode ? (
                    <Select value={formData.plan || ''} onValueChange={v => setFormData({ ...formData, plan: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="starter">Starter</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="agency">Agency</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-1 font-semibold capitalize">{org.plan}</p>
                  )}
                </div>

                <div>
                  <Label className="text-xs">Plan Interval</Label>
                  {editMode ? (
                    <Select value={formData.plan_interval || ''} onValueChange={v => setFormData({ ...formData, plan_interval: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="annual">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-1 font-semibold capitalize">{org.plan_interval}</p>
                  )}
                </div>

                <div>
                  <Label className="text-xs">Subscription Status</Label>
                  {editMode ? (
                    <Select value={formData.subscription_status || ''} onValueChange={v => setFormData({ ...formData, subscription_status: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trialing">Trialing</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="past_due">Past Due</SelectItem>
                        <SelectItem value="canceled">Canceled</SelectItem>
                        <SelectItem value="unpaid">Unpaid</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-1 font-semibold capitalize">{org.subscription_status}</p>
                  )}
                </div>

                <div>
                  <Label className="text-xs">Trial Ends At</Label>
                  {editMode ? (
                    <Input
                      className="mt-1"
                      type="datetime-local"
                      value={formData.trial_ends_at ? new Date(formData.trial_ends_at).toISOString().slice(0, 16) : ''}
                      onChange={e => setFormData({ ...formData, trial_ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    />
                  ) : (
                    <p className="mt-1 font-semibold">{formData.trial_ends_at ? new Date(formData.trial_ends_at).toLocaleDateString() : '—'}</p>
                  )}
                </div>

                <div>
                  <Label className="text-xs">Internal Comped</Label>
                  {editMode ? (
                    <Select value={(formData.internal_comped ? 'true' : 'false')} onValueChange={v => setFormData({ ...formData, internal_comped: v === 'true' })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">No</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-1 font-semibold">{org.internal_comped ? 'Yes' : 'No'}</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-xs">Internal Notes</Label>
                {editMode ? (
                  <textarea
                    className="mt-1 w-full p-2 border rounded-md text-sm"
                    rows="4"
                    value={formData.internal_notes || ''}
                    onChange={e => setFormData({ ...formData, internal_notes: e.target.value })}
                  />
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">{org.internal_notes || '—'}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {['members', 'billing', 'activity', 'leads', 'calls', 'compliance', 'notes'].map(tab => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                {tab.charAt(0).toUpperCase() + tab.slice(1)} details coming soon
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}