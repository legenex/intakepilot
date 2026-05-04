import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { base44 } from '@/api/base44Client';
import { useOrg } from '@/lib/OrgContext';
import { Badge } from '@/components/ui/badge';
import { STATUS_LABELS, STATUS_COLORS, KANBAN_COLUMNS, getLeadName, normalizePhone } from '@/lib/leadUtils';
import { logActivity } from '@/hooks/useLeads';
import { formatDistanceToNow } from 'date-fns';

function LeadCard({ lead, onClick, isDragging, selected, onToggleSelect }) {
  return (
    <div
      className={`bg-card border rounded-lg p-3 cursor-pointer hover:border-primary/30 transition-all text-left w-full
        ${isDragging ? 'shadow-lg border-primary/40 rotate-1' : 'border-border'}
        ${selected ? 'ring-1 ring-primary' : ''}
      `}
      onClick={() => onClick(lead.id)}
    >
      <div className="flex items-start justify-between gap-1 mb-1.5">
        <p className="text-xs font-semibold leading-tight truncate">{getLeadName(lead)}</p>
        <input
          type="checkbox"
          checked={selected}
          onClick={e => { e.stopPropagation(); onToggleSelect(lead.id); }}
          onChange={() => {}}
          className="mt-0.5 flex-shrink-0"
        />
      </div>
      <p className="text-[10px] text-muted-foreground font-mono mb-2">{lead.phone}</p>
      <div className="flex flex-wrap gap-1">
        {lead.vertical && (
          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-medium capitalize">
            {lead.vertical.replace('_', ' ')}
          </span>
        )}
        {lead.pvql_score && (
          <span className="text-[10px] bg-violet-500/10 text-violet-400 px-1.5 py-0.5 rounded font-mono font-semibold">
            {lead.pvql_score}/10
          </span>
        )}
        {lead.tags?.slice(0,1).map(t => (
          <span key={t} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">{t}</span>
        ))}
      </div>
      {lead.created_date && (
        <p className="text-[10px] text-muted-foreground mt-1.5">
          {formatDistanceToNow(new Date(lead.created_date), { addSuffix: true })}
        </p>
      )}
    </div>
  );
}

export default function LeadKanban({ leads, onLeadClick, selectedIds, onSelect, canEdit, onRefresh }) {
  const { currentOrg } = useOrg();
  const [draggingId, setDraggingId] = useState(null);

  const byStatus = {};
  KANBAN_COLUMNS.forEach(col => { byStatus[col] = []; });
  leads.forEach(l => {
    if (byStatus[l.status]) byStatus[l.status].push(l);
  });

  const onDragEnd = async (result) => {
    setDraggingId(null);
    if (!result.destination || !canEdit) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    const lead = leads.find(l => l.id === draggableId);
    if (!lead || lead.status === newStatus) return;

    const oldStatus = lead.status;
    await base44.entities.Lead.update(draggableId, { status: newStatus });
    await logActivity({
      organization_id: currentOrg.id,
      lead_id: draggableId,
      type: 'status_changed',
      payload: { from: oldStatus, to: newStatus, summary: `${getLeadName(lead)} → ${STATUS_LABELS[newStatus]}` },
      actor_label: 'User',
    });
    onRefresh();
  };

  const toggleSelect = (id) => {
    onSelect(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd} onDragStart={r => setDraggingId(r.draggableId)}>
      <div className="flex gap-0 h-full overflow-x-auto">
        {KANBAN_COLUMNS.map(col => (
          <div key={col} className="flex-shrink-0 w-52 flex flex-col border-r border-border/50 last:border-r-0">
            <div className="px-3 py-2 border-b border-border/50 flex items-center gap-2 bg-muted/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{STATUS_LABELS[col]}</span>
              <Badge variant="outline" className="ml-auto text-[10px] py-0">{byStatus[col].length}</Badge>
            </div>
            <Droppable droppableId={col}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 p-2 space-y-1.5 overflow-y-auto min-h-24 transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}
                >
                  {byStatus[col].map((lead, idx) => (
                    <Draggable key={lead.id} draggableId={lead.id} index={idx} isDragDisabled={!canEdit}>
                      {(prov, snap) => (
                        <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}>
                          <LeadCard
                            lead={lead}
                            onClick={onLeadClick}
                            isDragging={snap.isDragging}
                            selected={selectedIds.includes(lead.id)}
                            onToggleSelect={toggleSelect}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {byStatus[col].length === 0 && !snapshot.isDraggingOver && (
                    <p className="text-[10px] text-muted-foreground text-center py-4">No leads</p>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}