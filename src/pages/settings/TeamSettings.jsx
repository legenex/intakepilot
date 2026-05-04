import React, { useState, useEffect } from 'react';
import { useOrg } from '@/lib/OrgContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { UserPlus, MoreVertical, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function TeamSettings() {
  const { currentOrg } = useOrg();
  const { toast } = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('operator');
  const [inviting, setInviting] = useState(false);

  const loadMembers = async () => {
    if (!currentOrg) return;
    const data = await base44.entities.OrganizationMember.filter({ organization_id: currentOrg.id });
    setMembers(data.filter(m => m.status !== 'removed'));
    setLoading(false);
  };

  useEffect(() => { loadMembers(); }, [currentOrg]);

  const handleInvite = async () => {
    if (!inviteEmail) { toast({ title: 'Please enter an email', variant: 'destructive' }); return; }
    setInviting(true);
    
    const user = await base44.auth.me();
    await base44.entities.OrganizationMember.create({
      organization_id: currentOrg.id,
      user_email: inviteEmail,
      role: inviteRole,
      invited_by: user.email,
      invited_at: new Date().toISOString(),
      status: 'pending',
    });

    // Invite via Base44
    await base44.users.inviteUser(inviteEmail, 'user');
    
    toast({ title: `Invite sent to ${inviteEmail}` });
    setInviteEmail('');
    setInviting(false);
    loadMembers();
  };

  const handleChangeRole = async (member, newRole) => {
    await base44.entities.OrganizationMember.update(member.id, { role: newRole });
    toast({ title: `Role updated to ${newRole}` });
    loadMembers();
  };

  const handleRemove = async (member) => {
    await base44.entities.OrganizationMember.update(member.id, { status: 'removed' });
    toast({ title: 'Member removed' });
    loadMembers();
  };

  const roleBadgeClass = {
    owner: 'bg-primary/10 text-primary',
    admin: 'bg-accent/10 text-accent',
    operator: 'bg-warning/10 text-warning',
    viewer: 'bg-muted text-muted-foreground',
  };

  if (!currentOrg) return null;

  return (
    <div className="space-y-6">
      {/* Invite */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invite Team Member</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="colleague@firm.com"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="flex-1"
            />
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="operator">Operator</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleInvite} disabled={inviting} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {inviting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
              Invite
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Members list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-1">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                      {(member.user_name || member.user_email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{member.user_name || member.user_email}</div>
                      <div className="text-xs text-muted-foreground">{member.user_email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${roleBadgeClass[member.role] || ''}`}>
                      {member.role}
                    </Badge>
                    {member.status === 'pending' && (
                      <Badge variant="outline" className="text-xs">Pending</Badge>
                    )}
                    {member.role !== 'owner' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreVertical className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleChangeRole(member, 'admin')}>Make Admin</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleChangeRole(member, 'operator')}>Make Operator</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleChangeRole(member, 'viewer')}>Make Viewer</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRemove(member)} className="text-destructive">Remove</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}