import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import {
  ReactFlow, Background, Controls, MiniMap,
  addEdge, useNodesState, useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  ArrowLeft, Save, Play, AlignVerticalSpaceAround,
  Loader2, ChevronDown, History, Power, PauseCircle,
} from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import NodePalette from '@/components/workflows/NodePalette';
import CustomNode from '@/components/workflows/CustomNode';
import NodeConfigPanel from '@/components/workflows/NodeConfigPanel';
import WorkflowValidationBadge from '@/components/workflows/WorkflowValidationBadge';
import { validateWorkflow, getNodeSchema } from '@/lib/workflowNodeSchemas';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NODE_TYPES = { custom: CustomNode };

const DEFAULT_EDGE_STYLE = {
  stroke: 'hsl(var(--primary))',
  strokeWidth: 1.5,
};

function bfsLayout(nodes, edges) {
  if (nodes.length === 0) return nodes;

  const adj = {};
  for (const n of nodes) adj[n.id] = [];
  for (const e of edges) {
    if (adj[e.source]) adj[e.source].push(e.target);
  }

  const inDegree = {};
  for (const n of nodes) inDegree[n.id] = 0;
  for (const e of edges) inDegree[e.target] = (inDegree[e.target] || 0) + 1;

  const roots = nodes.filter(n => inDegree[n.id] === 0).map(n => n.id);
  if (roots.length === 0) roots.push(nodes[0].id);

  const level = {};
  const queue = [...roots];
  for (const r of roots) level[r] = 0;

  while (queue.length > 0) {
    const cur = queue.shift();
    for (const child of (adj[cur] || [])) {
      if (level[child] === undefined) {
        level[child] = (level[cur] || 0) + 1;
        queue.push(child);
      }
    }
  }

  const byLevel = {};
  for (const n of nodes) {
    const l = level[n.id] ?? 0;
    if (!byLevel[l]) byLevel[l] = [];
    byLevel[l].push(n.id);
  }

  const NODE_W = 240, NODE_H = 100, H_GAP = 40, V_GAP = 80;
  const positioned = {};
  for (const [lStr, ids] of Object.entries(byLevel)) {
    const l = Number(lStr);
    const count = ids.length;
    const totalW = count * NODE_W + (count - 1) * H_GAP;
    ids.forEach((id, i) => {
      positioned[id] = {
        x: -totalW / 2 + i * (NODE_W + H_GAP),
        y: l * (NODE_H + V_GAP),
      };
    });
  }

  return nodes.map(n => ({
    ...n,
    position: positioned[n.id] || n.position,
  }));
}

export default function WorkflowEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef(null);
  const [rfInstance, setRfInstance] = useState(null);

  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'unsaved' | 'saving'
  const [selectedNode, setSelectedNode] = useState(null);
  const [versions, setVersions] = useState([]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const validationIssues = useMemo(() => validateWorkflow(nodes, edges), [nodes, edges]);
  const isDirty = saveStatus === 'unsaved';

  // ── Load workflow on mount ──────────────────────────────────────
  useEffect(() => {
    loadWorkflow();
  }, [id]);

  const loadWorkflow = async () => {
    setLoading(true);
    const wf = await base44.entities.Workflow.get(id);
    setWorkflow(wf);
    const loadedNodes = (wf.nodes || []).map(n => ({
      ...n,
      type: 'custom',
      data: { ...n.data, nodeType: n.nodeType || n.type },
    }));
    setNodes(wf.nodes || []);
    setEdges(wf.edges || []);
    setLoading(false);
    // Load versions
    const vers = await base44.entities.WorkflowVersion.filter(
      { workflow_id: id }, '-created_date', 10
    );
    setVersions(vers);
  };

  // ── Auto-save every 5s on change ───────────────────────────────
  const autoSaveTimer = useRef(null);

  const markDirty = useCallback(() => {
    setSaveStatus('unsaved');
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      doSave(false);
    }, 5000);
  }, []);

  const handleNodesChange = useCallback((changes) => {
    onNodesChange(changes);
    setSaveStatus('unsaved');
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => doSave(false), 5000);
  }, [onNodesChange]);

  const handleEdgesChange = useCallback((changes) => {
    onEdgesChange(changes);
    setSaveStatus('unsaved');
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => doSave(false), 5000);
  }, [onEdgesChange]);

  // Use a ref to always have current nodes/edges inside the timeout
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { edgesRef.current = edges; }, [edges]);

  const doSave = useCallback(async (createVersion = false) => {
    if (!workflow) return;
    setSaveStatus('saving');
    const currentNodes = nodesRef.current;
    const currentEdges = edgesRef.current;
    await base44.entities.Workflow.update(id, {
      nodes: currentNodes,
      edges: currentEdges,
      version: createVersion ? (workflow.version || 1) + 1 : workflow.version,
    });
    if (createVersion) {
      const user = await base44.auth.me();
      const ver = await base44.entities.WorkflowVersion.create({
        workflow_id: id,
        version_number: (workflow.version || 1) + 1,
        nodes: currentNodes,
        edges: currentEdges,
        trigger_config: workflow.trigger_config || {},
        created_at: new Date().toISOString(),
        created_by: user?.email,
      });
      setVersions(v => [ver, ...v].slice(0, 10));
      setWorkflow(w => ({ ...w, version: (w.version || 1) + 1 }));
    }
    setSaveStatus('saved');
  }, [workflow, id]);

  // ── Edge connect ───────────────────────────────────────────────
  const onConnect = useCallback((params) => {
    setEdges(eds => addEdge({
      ...params,
      style: DEFAULT_EDGE_STYLE,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' },
    }, eds));
    setSaveStatus('unsaved');
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => doSave(false), 5000);
  }, [setEdges, doSave]);

  // ── Drag & drop from palette ────────────────────────────────────
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData('application/reactflow-type');
    if (!nodeType || !rfInstance) return;

    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = rfInstance.screenToFlowPosition({
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top,
    });

    const newNode = {
      id: `node_${Date.now()}`,
      type: 'custom',
      nodeType,
      position,
      data: { nodeType },
    };
    // Store actual type on node so CustomNode can read it
    newNode.data = { ...newNode.data };
    setNodes(nds => [...nds, { ...newNode, type: nodeType }]);
    markDirty();
  }, [rfInstance, setNodes, markDirty]);

  // ── Node type mapping for ReactFlow ────────────────────────────
  const nodeTypes = useMemo(() => {
    // Import NODE_SCHEMAS inline via the already-imported validateWorkflow module
    // All schema keys get mapped to CustomNode
    const allKeys = [
      'new_lead_created','lead_status_changed','lead_field_updated','time_elapsed',
      'inbound_sms','inbound_call','webhook_received','schedule','buyer_feedback',
      'if_field','if_tag','if_business_hours','if_buyer_cap','if_tcpa','branch',
      'update_field','add_tag','remove_tag','change_status','add_note','calc_pvql',
      'run_voice_agent','send_sms','send_email','send_doc_request',
      'find_buyer','deliver_buyer','wait_buyer_response',
      'send_webhook','http_request','sync_bigquery','append_sheet',
      'wait','loop','set_variable','end',
    ];
    const types = { custom: CustomNode };
    for (const key of allKeys) types[key] = CustomNode;
    return types;
  }, []);

  // ── Node selection ─────────────────────────────────────────────
  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // ── Delete key ─────────────────────────────────────────────────
  const onKeyDown = useCallback((e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNode) {
      setNodes(nds => nds.filter(n => n.id !== selectedNode.id));
      setEdges(eds => eds.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
      markDirty();
    }
  }, [selectedNode, setNodes, setEdges, markDirty]);

  // ── Node data update from config panel ─────────────────────────
  const handleNodeUpdate = useCallback((nodeId, newData) => {
    setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(prev => prev ? { ...prev, data: { ...prev.data, ...newData } } : prev);
    }
    markDirty();
  }, [setNodes, selectedNode, markDirty]);

  // ── Auto-layout ────────────────────────────────────────────────
  const handleAutoLayout = useCallback(() => {
    setNodes(nds => bfsLayout(nds, edgesRef.current));
    markDirty();
  }, [setNodes, markDirty]);

  // ── Status toggle ──────────────────────────────────────────────
  const handleToggleStatus = async () => {
    const newStatus = workflow.status === 'active' ? 'paused' : 'active';
    if (newStatus === 'active' && validationIssues.length > 0) return;
    await base44.entities.Workflow.update(id, { status: newStatus });
    setWorkflow(w => ({ ...w, status: newStatus }));
  };

  // ── Load a version ─────────────────────────────────────────────
  const loadVersion = (ver) => {
    setNodes(ver.nodes || []);
    setEdges(ver.edges || []);
    markDirty();
  };

  // ── Render ─────────────────────────────────────────────────────
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

  const STATUS_PILL = {
    draft:  'bg-muted text-muted-foreground',
    active: 'bg-success/10 text-success border border-success/20',
    paused: 'bg-warning/10 text-warning border border-warning/20',
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full overflow-hidden" onKeyDown={onKeyDown} tabIndex={-1}>

        {/* ── Top bar ──────────────────────────────────────────── */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card shrink-0 min-h-[52px]">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => navigate('/workflows')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h1 className="font-semibold text-sm truncate">{workflow.name}</h1>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_PILL[workflow.status] || STATUS_PILL.draft}`}>
              {workflow.status}
            </span>
            <span className="text-[10px] text-muted-foreground hidden md:inline">v{workflow.version}</span>
          </div>

          {/* Save status */}
          <div className="text-xs text-muted-foreground shrink-0 min-w-[52px] text-right">
            {saveStatus === 'saving' && <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />Saving</span>}
            {saveStatus === 'saved' && <span className="text-success/80">Saved</span>}
            {saveStatus === 'unsaved' && <span className="text-warning/80">Unsaved</span>}
          </div>

          {/* Validation */}
          <WorkflowValidationBadge issues={validationIssues} />

          {/* Version history */}
          {versions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs px-2">
                  <History className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">History</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {versions.map(ver => (
                  <DropdownMenuItem key={ver.id} onClick={() => loadVersion(ver)}>
                    <span className="text-xs">v{ver.version_number} — {new Date(ver.created_at).toLocaleString()}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Status toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-7 text-xs px-2"
                  onClick={handleToggleStatus}
                  disabled={workflow.status !== 'active' && validationIssues.length > 0}
                >
                  {workflow.status === 'active'
                    ? <><PauseCircle className="w-3.5 h-3.5" />Pause</>
                    : <><Power className="w-3.5 h-3.5" />Activate</>
                  }
                </Button>
              </span>
            </TooltipTrigger>
            {validationIssues.length > 0 && workflow.status !== 'active' && (
              <TooltipContent>Fix validation issues to activate</TooltipContent>
            )}
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button variant="outline" size="sm" disabled className="gap-1.5 h-7 text-xs px-2 opacity-50">
                  <Play className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Test Run</span>
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Coming in B3</TooltipContent>
          </Tooltip>

          <Button
            size="sm"
            className="gap-1.5 h-7 text-xs px-3"
            onClick={() => doSave(true)}
            disabled={saveStatus === 'saving'}
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Save</span>
          </Button>
        </div>

        {/* ── Main editor row ───────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left palette */}
          <div className="w-[260px] shrink-0 border-r border-border bg-card/50 overflow-hidden flex flex-col">
            <NodePalette />
          </div>

          {/* Canvas */}
          <div className="flex-1 relative" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onConnect={onConnect}
              onInit={setRfInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={{
                style: DEFAULT_EDGE_STYLE,
                type: 'smoothstep',
                markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' },
              }}
              fitView
              deleteKeyCode={null}
              proOptions={{ hideAttribution: true }}
            >
              <Background variant="dots" gap={20} size={1} color="hsl(var(--muted-foreground) / 0.2)" />
              <Controls />
              <MiniMap
                style={{ background: 'hsl(var(--card))' }}
                maskColor="hsl(var(--muted) / 0.6)"
              />
            </ReactFlow>

            {/* Auto-arrange button */}
            <div className="absolute top-3 right-3 z-10">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8 bg-card shadow" onClick={handleAutoLayout}>
                    <AlignVerticalSpaceAround className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Auto Arrange</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Right config panel */}
          {selectedNode && (
            <NodeConfigPanel
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
              onUpdate={handleNodeUpdate}
            />
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}