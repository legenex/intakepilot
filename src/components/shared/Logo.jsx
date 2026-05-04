import React from 'react';
import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Logo({ className = '', linkTo = '/' }) {
  return (
    <Link to={linkTo} className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="absolute inset-0 rounded-lg bg-primary/20 blur-sm" />
      </div>
      <span className="font-inter font-bold text-lg tracking-tight">
        Intake<span className="text-primary">Pilot</span>
        <span className="text-primary text-xs">.ai</span>
      </span>
    </Link>
  );
}