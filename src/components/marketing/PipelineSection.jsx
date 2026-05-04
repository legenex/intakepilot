import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, User, CheckCircle, Phone, FileSignature } from 'lucide-react';

const stages = [
  { label: 'RAW', sublabel: 'Inbound Lead', icon: User, color: 'text-muted-foreground' },
  { label: 'QUALIFIED', sublabel: 'Screened & Verified', icon: CheckCircle, color: 'text-warning' },
  { label: 'PVQL', sublabel: 'Phone Verified', icon: Phone, color: 'text-primary' },
  { label: 'RETAINER', sublabel: 'Signed & Retained', icon: FileSignature, color: 'text-success' },
];

export default function PipelineSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold">The IntakePilot Pipeline</h2>
          <p className="mt-3 text-muted-foreground">Every lead follows the same AI-driven path to conversion</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0">
          {stages.map((stage, i) => (
            <React.Fragment key={stage.label}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="flex flex-col items-center"
              >
                <div className={`w-16 h-16 rounded-xl border border-border bg-card flex items-center justify-center mb-3 ${stage.color}`}>
                  <stage.icon className="w-7 h-7" />
                </div>
                <span className="font-mono text-sm font-semibold tracking-wider">{stage.label}</span>
                <span className="text-xs text-muted-foreground mt-1">{stage.sublabel}</span>
              </motion.div>
              {i < stages.length - 1 && (
                <div className="hidden sm:flex items-center px-4">
                  <div className="w-12 h-px bg-gradient-to-r from-border to-primary/50" />
                  <ArrowRight className="w-4 h-4 text-primary/50 -ml-1" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}