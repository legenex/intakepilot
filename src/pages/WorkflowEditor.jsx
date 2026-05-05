import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, Save, Play, GitBranch, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const STATUS_COLORS = {
  draft: 'bg-muted text-muted-foreground',
  active: 'bg-success/10 text-success border border-success/20',
  paused: 'bg-warning/10 text-warning border border-warning/20',
};

export default function WorkflowEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    loadWorkflow();
  }, [id]);

  const loadWorkflow = async () => {
    setLoading(true);
    const wf = await base44.entities.Workflow.get(id);
    setWorkflow(wf);
    setNodes(wf.nodes || []);
    setEdges(wf.edges || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p className="text-muted-foreground">Workflow not found.</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/workflows')}>
          Back to Workflows
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/workflows')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h1 className="font-semibold text-sm truncate">{workflow.name}</h1>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[workflow.status] || STATUS_COLORS.draft}`}>
              {workflow.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button variant="outline" size="sm" disabled className="gap-1.5 opacity-50">
                    <Play className="w-3.5 h-3.5" />
                    Test Run
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>Coming in B3</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button size="sm" disabled className="gap-1.5 opacity-50">
                    <Save className="w-3.5 h-3.5" />
                    Save
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>Coming in B2</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Main editor area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel — node library placeholder */}
          <div className="w-[280px] shrink-0 border-r border-border bg-card/50 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
              <GitBranch className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Node library</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Coming in B2</p>
          </div>

          {/* Canvas */}
          <div className="flex-1 relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={() => {}}
              onEdgesChange={() => {}}
              fitView
              proOptions={{ hideAttribution: true }}
            >
              <Background variant="dots" gap={20} size={1} color="hsl(var(--muted-foreground) / 0.2)" />
              <Controls />
              <MiniMap
                style={{ background: 'hsl(var(--card))' }}
                maskColor="hsl(var(--muted) / 0.6)"
              />
            </ReactFlow>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}