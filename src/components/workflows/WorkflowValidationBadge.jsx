import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function WorkflowValidationBadge({ issues }) {
  if (issues.length === 0) {
    return (
      <div className="flex items-center gap-1 text-xs text-success">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Valid</span>
      </div>
    );
  }

  const isError = issues.length > 0;
  const Icon = isError ? XCircle : AlertTriangle;
  const color = isError ? 'text-destructive' : 'text-warning';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`flex items-center gap-1 text-xs ${color} cursor-default`}>
          <Icon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{issues.length} issue{issues.length > 1 ? 's' : ''}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[280px]">
        <ul className="space-y-0.5">
          {issues.map((issue, i) => (
            <li key={i} className="text-xs">• {issue}</li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}