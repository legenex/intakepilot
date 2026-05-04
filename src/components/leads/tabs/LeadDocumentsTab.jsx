import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Upload, Trash2, Download, FileText } from 'lucide-react';
import { logActivity } from '@/hooks/useLeads';

export default function LeadDocumentsTab({ lead, orgId, canEdit, onRefresh }) {
  const { toast } = useToast();
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('other');

  useEffect(() => {
    base44.entities.Document.filter({ lead_id: lead.id, organization_id: orgId }, '-created_date').then(setDocs);
  }, [lead.id, orgId]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const doc = await base44.entities.Document.create({
      organization_id: orgId, lead_id: lead.id,
      file_url, file_name: file.name, mime_type: file.type, size_bytes: file.size,
      type: docType, uploaded_via: 'manual',
    });
    await logActivity({ organization_id: orgId, lead_id: lead.id, type: 'document_uploaded', payload: { file_name: file.name, type: docType, summary: `Uploaded ${file.name}` }, actor_label: 'User' });
    setDocs(d => [doc, ...d]);
    toast({ title: 'Document uploaded' });
    setUploading(false);
  };

  const deleteDoc = async (id) => {
    await base44.entities.Document.delete(id);
    setDocs(d => d.filter(x => x.id !== id));
    toast({ title: 'Deleted' });
  };

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex gap-2 items-center">
          <Select value={docType} onValueChange={setDocType}>
            <SelectTrigger className="h-8 text-xs w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['retainer','id_front','id_back','medical_record','other'].map(t => (
                <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label htmlFor="doc-upload">
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" asChild disabled={uploading}>
              <span><Upload className="w-3.5 h-3.5" />{uploading ? 'Uploading...' : 'Upload'}</span>
            </Button>
          </label>
          <input id="doc-upload" type="file" className="hidden" onChange={handleUpload} />
        </div>
      )}

      {docs.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
          <p className="text-sm text-muted-foreground">No documents uploaded</p>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map(d => (
            <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30">
              <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{d.file_name}</p>
                <p className="text-[10px] text-muted-foreground">{d.type?.replace(/_/g,' ')} · {d.size_bytes ? `${Math.round(d.size_bytes/1024)}KB` : ''}</p>
              </div>
              <div className="flex gap-1">
                <a href={d.file_url} target="_blank" rel="noopener noreferrer">
                  <Button size="icon" variant="ghost" className="h-7 w-7"><Download className="w-3.5 h-3.5" /></Button>
                </a>
                {canEdit && (
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteDoc(d.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}