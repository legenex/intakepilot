import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MessageSquare, GitBranch, Camera, PhoneForwarded, Webhook, Database, Shield } from 'lucide-react';

const features = [
  { icon: Mic, title: 'AI Voice Agents', desc: 'Conversational AI that qualifies and pre-signs leads with human-like phone calls.' },
  { icon: MessageSquare, title: 'SMS Reactivation', desc: 'Automated drip campaigns that re-engage dead leads and drive callbacks.' },
  { icon: GitBranch, title: 'Visual Workflow Builder', desc: 'Drag-and-drop intake flows — no code required, infinite customization.' },
  { icon: Camera, title: 'Document Capture', desc: 'Collect IDs, medical records, and accident photos via SMS links.' },
  { icon: PhoneForwarded, title: 'Warm Transfers', desc: 'Live-transfer qualified leads to attorneys at the perfect moment.' },
  { icon: Webhook, title: 'Webhook Routing', desc: 'Push qualified leads to your CRM, dialer, or case management system instantly.' },
  { icon: Database, title: 'BigQuery Sync', desc: 'Stream all intake data to BigQuery for custom reporting and attribution.' },
  { icon: Shield, title: 'Compliance Toolkit', desc: 'Built-in TCPA consent tracking, DNC lists, and audit logs.' },
];

export default function FeaturesGrid() {
  return (
    <section className="py-16 sm:py-20 bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold">Everything You Need to Convert Leads</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            A complete AI-powered intake platform built for personal injury firms and lead-gen agencies.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
              className="group p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}