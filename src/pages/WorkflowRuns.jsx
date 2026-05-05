import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Activity, Loader2 } from 'lucide-react';

export default function WorkflowRuns() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Workflow.filter({ id })
      .then(matches => {
        setWorkflow(matches && matches.length > 0 ? matches[0] : null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/workflows')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">
            {loading ? 'Run History' : workflow ? `${workflow.name} — Runs` : 'Run History'}
          </h1>
          <p className="text-xs text-muted-foreground">Execution history for this workflow</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        ) : (
          <div className="flex flex-col items-center text-center max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Activity className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-base mb-1">No runs yet</h3>
            <p className="text-sm text-muted-foreground">
              Workflows execute once activated and a trigger event occurs. Run history will appear here.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-5"
              onClick={() => navigate(`/workflows/${id}`)}
            >
              Back to Editor
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}