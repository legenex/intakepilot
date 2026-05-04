import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Building2, Users, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import CTASection from '@/components/marketing/CTASection';

const useCases = {
  'personal-injury-firms': {
    icon: Building2,
    title: 'Personal Injury Firms',
    subtitle: 'Convert more cases with AI-powered intake',
    workflows: [
      { title: 'DQ Lead Reactivation', desc: 'Automatically re-engage disqualified leads with SMS drip campaigns. Our AI finds cases that were wrongly rejected or have changed circumstances.' },
      { title: 'No-Contact Recovery', desc: 'Reach prospects who never answered. Multi-channel outreach via voice and SMS converts 40-60% of no-contacts into qualified leads.' },
      { title: 'Retainer Signing', desc: 'AI agents walk qualified leads through the retainer process, collect signatures, and confirm engagement — 24/7, no staff required.' },
      { title: 'Document Collection', desc: 'Automatically request and collect accident photos, police reports, and medical records via secure SMS links.' },
    ],
  },
  'legal-lead-gen-agencies': {
    icon: Users,
    title: 'Legal Lead-Gen Agencies',
    subtitle: 'Deliver higher-quality leads to your clients',
    workflows: [
      { title: 'Raw Lead Qualification', desc: 'Process thousands of inbound leads with AI voice agents. Qualify for case type, jurisdiction, statute of limitations, and liability.' },
      { title: 'PVQL Generation', desc: 'Every lead gets a live phone verification call. Deliver Phone Verified Qualified Leads that command premium pricing.' },
      { title: 'Multi-Client Routing', desc: 'Route qualified leads to the right law firm based on case type, geography, and client capacity — in real-time.' },
      { title: 'Performance Reporting', desc: 'Give clients transparent dashboards showing lead quality, conversion rates, and ROI by source.' },
    ],
  },
  'aggregators': {
    icon: Globe,
    title: 'Lead Aggregators',
    subtitle: 'Scale your operation without scaling headcount',
    workflows: [
      { title: 'High-Volume Processing', desc: 'Handle 10,000+ leads per day with AI agents that never sleep, never call in sick, and never have a bad day.' },
      { title: 'Quality Scoring', desc: 'AI-powered lead scoring based on case details, contact history, and conversion probability.' },
      { title: 'Compliance at Scale', desc: 'Automatic TCPA consent tracking, DNC management, and audit logs for every interaction across all sources.' },
      { title: 'Revenue Optimization', desc: 'Dynamic pricing and routing that maximizes revenue per lead based on real-time demand and quality signals.' },
    ],
  },
};

const useCaseList = [
  { slug: 'personal-injury-firms', ...useCases['personal-injury-firms'] },
  { slug: 'legal-lead-gen-agencies', ...useCases['legal-lead-gen-agencies'] },
  { slug: 'aggregators', ...useCases['aggregators'] },
];

function UseCaseIndex() {
  return (
    <div>
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="text-3xl sm:text-5xl font-bold">Built for Your Business</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              See how IntakePilot transforms intake for your specific use case.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {useCaseList.map((uc, i) => (
              <motion.div
                key={uc.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/use-cases/${uc.slug}`} className="block group">
                  <div className="p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all h-full">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <uc.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{uc.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{uc.subtitle}</p>
                    <span className="text-sm text-primary flex items-center gap-1">
                      Learn more <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <CTASection />
    </div>
  );
}

function UseCaseDetail() {
  const { slug } = useParams();
  const uc = useCases[slug];

  if (!uc) return <div className="py-20 text-center text-muted-foreground">Use case not found.</div>;

  return (
    <div>
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link to="/use-cases" className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block">
            ← All Use Cases
          </Link>
          <div className="mb-12">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <uc.icon className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold">{uc.title}</h1>
            <p className="mt-3 text-lg text-muted-foreground">{uc.subtitle}</p>
          </div>

          <div className="space-y-6">
            {uc.workflows.map((w, i) => (
              <motion.div
                key={w.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-xl border border-border bg-card"
              >
                <h3 className="font-semibold mb-2">{w.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{w.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <CTASection />
    </div>
  );
}

export { UseCaseIndex, UseCaseDetail };
export default UseCaseIndex;