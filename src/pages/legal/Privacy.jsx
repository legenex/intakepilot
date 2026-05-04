import React from 'react';

export default function Privacy() {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 prose prose-sm dark:prose-invert">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-6">Last updated: May 2026</p>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <div className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly, such as your name, email, company name, and payment information when you create an account or contact us. We also automatically collect usage data, including IP addresses, browser type, and interaction data.</p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-lg font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
            <p>We use collected information to provide, maintain, and improve our services; process transactions; send service notifications; respond to support requests; and comply with legal obligations.</p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Data Security</h2>
            <p>We implement industry-standard security measures including encryption at rest and in transit, regular security audits, and access controls to protect your data.</p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Contact</h2>
            <p>For privacy-related inquiries, contact us at privacy@intakepilot.ai.</p>
          </div>
        </div>
      </div>
    </section>
  );
}