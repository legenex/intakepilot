import React from 'react';

const firms = [
  'Morgan & Morgan', 'The Levin Firm', 'Cellino Law', 'Florin|Roebig', 'Sokolove Law', 'Ben Crump Law',
];

export default function TrustBand() {
  return (
    <section className="py-10 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <p className="text-center text-xs text-muted-foreground uppercase tracking-widest mb-6">
          Trusted by leading firms and agencies
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {firms.map(firm => (
            <span key={firm} className="text-sm font-semibold text-muted-foreground/50 hover:text-muted-foreground transition-colors">
              {firm}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}