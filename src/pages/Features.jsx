import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MessageSquare, GitBranch, Camera, PhoneForwarded, Webhook, Database, Shield, BarChart3, Globe, Lock, FileText } from 'lucide-react';
import CTASection from '@/components/marketing/CTASection';

const categories = [
  {
    title: 'Voice AI',
    features: [
      { icon: Mic, title: 'Conversational AI Agents', desc: 'Natural-sounding voice agents that qualify leads, collect case details, and pre-sign retainers — all on autopilot.' },
      { icon: PhoneForwarded, title: 'Warm Transfers', desc: 'Seamlessly transfer qualified leads to live attorneys at the perfect moment in the conversation.' },
    ],
  },
  {
    title: 'SMS Automation',
    features: [
      { icon: MessageSquare, title: 'Drip Campaigns', desc: 'Multi-step SMS sequences that re-engage dead leads, no-contacts, and disqualified prospects.' },
      { icon: Camera, title: 'Document Capture', desc: 'Collect photos, IDs, and medical records via secure SMS links with automatic OCR.' },
    ],
  },
  {
    title: 'Lead Management',
    features: [
      { icon: GitBranch, title: 'Visual Workflow Builder', desc: 'Design complex intake flows with a drag-and-drop canvas. No engineering required.' },
      { icon: BarChart3, title: 'Pipeline Analytics', desc: 'Real-time dashboards showing conversion rates, agent performance, and revenue attribution.' },
    ],
  },
  {
    title: 'Compliance',
    features: [
      { icon: Shield, title: 'TCPA Tracking', desc: 'Automatic consent capture, DNC list management, and complete audit trails for every interaction.' },
      { icon: Lock, title: 'Data Security', desc: 'SOC 2 compliant infrastructure with encryption at rest and in transit. HIPAA-ready.' },
    ],
  },
  {
    title: 'Integrations',
    features: [
      { icon: Webhook, title: 'Webhook Routing', desc: 'Push data to any CRM, dialer, or case management system with real-time webhooks.' },
      { icon: Database, title: 'BigQuery Sync', desc: 'Stream all intake data to BigQuery for custom reporting and advanced analytics.' },
    ],
  },
  {
    title: 'Analytics',
    features: [
      { icon: Globe, title: 'Source Attribution', desc: 'Track which lead sources produce the highest-converting PVQLs and retainers.' },
      { icon: FileText, title: 'Custom Reports', desc: 'Build custom reports and schedule automated delivery to stakeholders.' },
    ],
  },
];

export default function Features() {
  return (
    <div>
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="text-3xl sm:text-5xl font-bold">Built for Legal Intake at Scale</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Every feature designed to convert more leads into signed retainers, faster.
            </p>
          </div>

          <div className="space-y-20">
            {categories.map((cat, ci) => (
              <div key={cat.title}>
                <h3 className="text-lg font-semibold text-primary mb-6">{cat.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cat.features.map((f, fi) => (
                    <motion.div
                      key={f.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: fi * 0.1 }}
                      viewport={{ once: true }}
                      className="p-6 rounded-xl border border-border bg-card hover:border-primary/30 transition-all"
                    >
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <f.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">{f.title}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                        </div>
                      </div>
                      <div className="mt-4 h-32 rounded-lg bg-muted/50 border border-border flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Screenshot placeholder</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Integration logos */}
          <div className="mt-20 text-center">
            <h3 className="text-lg font-semibold mb-6">Integrates With Your Stack</h3>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {['Salesforce', 'HubSpot', 'Clio', 'Litify', 'Filevine', 'LeadDocket', 'Zapier', 'BigQuery'].map(name => (
                <div key={name} className="px-4 py-2 rounded-lg border border-border bg-card text-sm text-muted-foreground">
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <CTASection />
    </div>
  );
}