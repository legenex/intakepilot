import React from 'react';

export default function TCPACompliance() {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold mb-2">TCPA Compliance</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: May 2026</p>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <div className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-lg font-semibold text-foreground mb-3">Our Commitment to TCPA Compliance</h2>
            <p>IntakePilot is built with TCPA compliance at its core. We provide tools and features that help our customers maintain compliance with the Telephone Consumer Protection Act and related regulations.</p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-lg font-semibold text-foreground mb-3">Consent Management</h2>
            <p>Our platform captures and stores express written consent before any automated communications. All consent records include timestamp, source, language presented, and IP address.</p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-lg font-semibold text-foreground mb-3">DNC List Management</h2>
            <p>IntakePilot maintains internal Do Not Call lists and provides tools for importing and checking against the National DNC Registry. Opt-out requests are processed immediately.</p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-lg font-semibold text-foreground mb-3">Audit Trail</h2>
            <p>Every communication — SMS, voice, and email — is logged with complete metadata for compliance audits. Records are retained for the legally required minimum period.</p>
          </div>
        </div>
      </div>
    </section>
  );
}