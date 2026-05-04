import React from 'react';

export default function Terms() {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: May 2026</p>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <div className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using IntakePilot.ai, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, do not use the Service.</p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Service Description</h2>
            <p>IntakePilot provides AI-powered legal intake services including voice agents, SMS automation, and workflow management tools designed for legal professionals and lead generation agencies.</p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Account Responsibilities</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use.</p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Payment Terms</h2>
            <p>Subscription fees are billed in advance on a monthly or annual basis. Overage charges are billed at the end of each billing period. All fees are non-refundable unless otherwise stated.</p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card">
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Limitation of Liability</h2>
            <p>IntakePilot shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.</p>
          </div>
        </div>
      </div>
    </section>
  );
}