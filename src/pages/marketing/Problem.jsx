import React from 'react';
import { Link } from 'react-router-dom';
import { useReveal } from '@/hooks/useReveal';

const PROBLEMS = [
  {
    num: '01',
    color: 'var(--accent-amber)',
    title: 'Speed-to-lead is a fairy tale.',
    lead: 'The 5-minute rule is industry gospel. Here\'s what actually happens in practice.',
    body: 'The average PI firm responds to a web form lead in 4 hours and 12 minutes. That\'s not a typo. By the time your intake coordinator finishes lunch, replies to three emails, and opens the CRM, your lead has already filled out a form at two other firms. Most calls placed after 6pm get a voicemail — returned the next morning at 9am. The customer who was ready to sign yesterday is now comparison-shopping. Speed-to-lead isn\'t a nice-to-have. It\'s the single most important variable in legal intake conversion. And the industry is catastrophically bad at it.',
    stat: { num: '47%', label: 'of qualified leads sign elsewhere within 24 hours of an unanswered first contact' },
    why: 'Building 24/7 intake means infrastructure costs. Most platforms sell software, not coverage. They leave the speed problem to you to solve with humans.',
    solution: 'AI Voice Agents',
    solutionHref: '/features#voice',
  },
  {
    num: '02',
    color: 'var(--accent-primary)',
    title: 'Disqualification is treated as permanent.',
    lead: 'A lead tagged DQ on day one is never called again. That\'s a financial decision masquerading as a process.',
    body: 'A lead disqualified in week one — wrong state, wrong vertical, treatment hasn\'t started — is never called again. Most platforms tag the lead "DQ" and move on forever. But three months later, the customer\'s situation changes. Treatment started. They crossed state lines. The statute-of-limitations window opened. They\'re now a $1,200 retainer — and nobody knows, because nobody looked. The industry has collectively decided that a failed first qualification attempt means the lead is worthless forever. That is a very expensive assumption that has never been validated.',
    stat: { num: '62%', label: 'of disqualified leads would have qualified with a different question, asked at a different time' },
    why: 'Reactivation requires storing leads forever, building cadence engines, and running cost-per-recovery math. None of that demos well in a 20-minute sales call. So nobody builds it.',
    solution: 'Reactivation Engine',
    solutionHref: '/features#reactivation',
  },
  {
    num: '03',
    color: 'var(--accent-amber)',
    title: 'Returned and no-contact leads are written off.',
    lead: 'Buyers reject 18–30% of the leads agencies send them. Most agencies eat the loss. The customer who wanted help never hears from anyone again.',
    body: '"No contact, wrong number, duplicate, vertical mismatch." The buyer sends the lead back, the agency issues a credit, and the lead sits in a rejection CSV that nobody touches again. But that customer filled out a form because they needed help. They had an accident, a workplace injury, a medical event. They wanted representation. The lead was returned because the first buyer didn\'t fit — not because the customer changed their mind. Every returned lead that gets written off is a person who needed a lawyer and got a ghosted CRM record instead.',
    stat: { num: '$340K', label: 'average annual revenue lost to unworked returned leads at a 5-attorney firm' },
    why: 'Returned-lead workflows require buyer feedback integration. That requires an opinion about what good leads look like. That requires expertise. Most platforms don\'t have it — and don\'t want the liability of defining it.',
    solution: 'Buyer Routing',
    solutionHref: '/features#webhooks',
  },
  {
    num: '04',
    color: 'var(--accent-primary)',
    title: 'Compliance is treated as a checkbox.',
    lead: 'TCPA class actions in the lead-gen vertical are increasing year over year. Most platforms\' compliance answer is: "You\'re responsible." That\'s true legally and useless operationally.',
    body: 'The legal lead-gen industry is one of the most litigated verticals in TCPA enforcement. A single bad call — wrong consent capture, outbound to a DNC registrant, calling in a two-party consent state without disclosure — can trigger a class action with seven-figure exposure. Most platforms respond to this reality with a Terms of Service clause that says compliance is your problem. The right answer is infrastructure: auto-prepended recording disclosure, DNC scrubbing at scale, A2P 10DLC tracking per campaign, frequency caps, and an audit log on every single interaction. Not a checkbox. Architecture.',
    stat: { num: '$1.2M', label: 'average TCPA class action settlement in the legal lead-gen vertical (last 24 months)' },
    why: 'Compliance done right is expensive engineering work that generates no MRR. So most platforms hand-wave it in the sales deck and let customers discover the gap when they get served.',
    solution: 'Compliance Toolkit',
    solutionHref: '/features#compliance',
  },
  {
    num: '05',
    color: 'var(--accent-amber)',
    title: 'Operators can\'t see margin per lead source.',
    lead: 'Without cost-per-lead in the dashboard, you can\'t fire the bad sources or double down on the good ones. You\'re guessing.',
    body: 'Which Meta campaign is actually profitable after you subtract call center cost, rejection rate, and buyer payout? You don\'t know. Which buyer is paying below market for your PVQLs? You don\'t know. Which vertical has the best margin after compliance overhead? You don\'t know. Most legal intake platforms have a SQL database and a vanity dashboard. They were never built to be a system of record for profit. So operators run the P&L in a spreadsheet, manually, quarterly, and make decisions based on vibes six weeks after the data was real.',
    stat: { num: '31%', label: 'of agency P&L is invisible to the operator at any given time' },
    why: 'Real margin reporting requires BigQuery (or equivalent) integration, a defined cost model, and the discipline to sync everything. Most platforms have none of that. They sell the headline metric: leads delivered.',
    solution: 'BigQuery Sync',
    solutionHref: '/features#bigquery',
  },
];

export default function Problem() {
  useReveal();

  return (
    <div className="marketing-root">
      {/* Hero */}
      <section className="site-section" style={{ paddingBottom: '3rem' }}>
        <div className="site-container-narrow">
          <div className="reveal" style={{ textAlign: 'center' }}>
            <div className="section-eyebrow section-eyebrow-amber" style={{ justifyContent: 'center' }}>THE LEGAL INTAKE INDUSTRY</div>
            <h1 className="site-h1" style={{ marginBottom: '1.25rem' }}>The legal intake industry is broken in five specific ways.</h1>
            <p className="site-lead" style={{ margin: '0 auto 2rem' }}>
              Most legal lead-gen platforms tell you what they do. We're going to tell you what's wrong with the industry — and then show you how we fix it.
            </p>
          </div>
        </div>
      </section>

      {/* Problems */}
      {PROBLEMS.map((p, idx) => (
        <section key={p.num} className="site-section" style={{ paddingTop: '3rem', paddingBottom: '3rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div className="site-container-narrow">
            <div className="reveal">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.18em', color: p.color, marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                PROBLEM {p.num}
              </div>
              <h2 className="site-h2" style={{ marginBottom: '1rem', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>{p.title}</h2>
              <p style={{ fontSize: '1.0625rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>{p.lead}</p>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '2rem' }}>{p.body}</p>
            </div>

            {/* Stat callout */}
            <div className="reveal stat-card stat-card-amber" data-delay="1" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.25rem', flexWrap: 'wrap' }}>
                <span className="stat-number stat-number-amber" style={{ fontSize: 'clamp(2rem, 6vw, 3rem)' }}>{p.stat.num}</span>
                <span className="stat-label" style={{ margin: 0, maxWidth: 480 }}>{p.stat.label}</span>
              </div>
            </div>

            {/* Why most platforms ignore */}
            <div className="reveal" data-delay="2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem', padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                WHY MOST PLATFORMS IGNORE THIS
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-dim)', lineHeight: 1.6, margin: 0 }}>{p.why}</p>
            </div>

            <div className="reveal" data-delay="3">
              <a href={p.solutionHref} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: p.color, fontSize: '0.9375rem', fontWeight: 600, textDecoration: 'none' }}>
                How IntakePilot solves this: {p.solution} →
              </a>
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="site-section" style={{ textAlign: 'center', background: 'var(--bg-card-2)' }}>
        <div className="site-container">
          <div className="reveal">
            <div className="section-eyebrow section-eyebrow-amber" style={{ justifyContent: 'center' }}>THE FIX</div>
            <h2 className="site-h2" style={{ marginBottom: '1rem' }}>We built IntakePilot to solve all five.</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.0625rem', marginBottom: '2.5rem' }}>
              Start a free trial. See how the platform handles each failure mode — live, on your own leads.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/signup" className="btn btn-primary">Start Free Trial</Link>
              <Link to="/contact" className="btn btn-secondary">Talk to Founder</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}