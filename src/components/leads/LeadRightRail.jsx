import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Tag, X, Plus, Save } from 'lucide-react';
import { logActivity } from '@/hooks/useLeads';

export default function LeadRightRail({ lead, orgId, canEdit, onRefresh, userLabel }) {
  const { toast } = useToast();
  const [notes, setNotes] = useState(lead.internal_notes || '');
  const [notesSaving, setNotesSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const saveNotes = async () => {
    setNotesSaving(true);
    await base44.entities.Lead.update(lead.id, { internal_notes: notes });
    await logActivity({ organization_id: orgId, lead_id: lead.id, type: 'note_added', payload: { summary: 'Updated internal notes' }, actor_label: userLabel || 'User' });
    toast({ title: 'Notes saved' });
    setNotesSaving(false);
    onRefresh();
  };

  const addTag = async () => {
    const tag = tagInput.trim(); if (!tag) return;
    const tags = [...(lead.tags || [])];
    if (tags.includes(tag)) return;
    tags.push(tag);
    await base44.entities.Lead.update(lead.id, { tags });
    setTagInput('');
    onRefresh();
  };

  const removeTag = async (tag) => {
    const tags = (lead.tags || []).filter(t => t !== tag);
    await base44.entities.Lead.update(lead.id, { tags });
    onRefresh();
  };

  return (
    <div className="space-y-5">
      <div>
        <Label className="text-[10px] uppercase tracking-wide text-muted-foreground block mb-2 flex items-center gap-1">
          <Tag className="w-3 h-3" /> Tags
        </Label>
        <div className="flex flex-wrap gap-1 mb-2">
          {(lead.tags || []).map(tag => (
            <span key={tag} className="flex items-center gap-0.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
              {tag}
              {canEdit && <button onClick={() => removeTag(tag)} className="hover:text-destructive"><X className="w-2.5 h-2.5" /></button>}
            </span>
          ))}
        </div>
        {canEdit && (
          <div className="flex gap-1">
            <Input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTag()}
              placeholder="Add tag..."
              className="h-7 text-xs flex-1"
            />
            <Button size="icon" className="h-7 w-7" onClick={addTag}><Plus className="w-3 h-3" /></Button>
          </div>
        )}
      </div>

      <div>
        <Label className="text-[10px] uppercase tracking-wide text-muted-foreground block mb-2">Internal Notes</Label>
        {canEdit ? (
          <>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add internal notes..."
              className="text-xs min-h-24 resize-none"
            />
            <Button size="sm" className="mt-2 h-7 text-xs gap-1 w-full" onClick={saveNotes} disabled={notesSaving}>
              <Save className="w-3 h-3" />{notesSaving ? 'Saving...' : 'Save Notes'}
            </Button>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">{notes || 'No notes'}</p>
        )}
      </div>

      <div>
        <Label className="text-[10px] uppercase tracking-wide text-muted-foreground block mb-2">TCPA Consent</Label>
        <p className="text-xs">{lead.tcpa_consent_at ? new Date(lead.tcpa_consent_at).toLocaleString() : <span className="text-destructive/80">Not recorded</span>}</p>
        {lead.tcpa_consent_source && <p className="text-[10px] text-muted-foreground mt-0.5">{lead.tcpa_consent_source}</p>}
      </div>

      <div>
        <Label className="text-[10px] uppercase tracking-wide text-muted-foreground block mb-2">Contact Attempts</Label>
        <p className="text-xl font-bold font-mono">{lead.contact_attempts || 0}</p>
        {lead.last_contacted_at && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Last: {new Date(lead.last_contacted_at).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}