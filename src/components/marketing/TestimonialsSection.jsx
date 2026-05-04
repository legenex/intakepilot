import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: "IntakePilot turned our dead leads pile into a revenue stream. We're signing retainers from leads we'd written off months ago.",
    name: 'Sarah Mitchell',
    title: 'Intake Director, Mitchell & Associates',
    initials: 'SM',
  },
  {
    quote: "The AI voice agent qualified 340 leads in our first week — our human team was doing 80. It's not even close.",
    name: 'James Rodriguez',
    title: 'CEO, LegalLeads Pro',
    initials: 'JR',
  },
  {
    quote: "We went from 12% contact rate to 67% using SMS reactivation. The ROI paid for the platform in the first 3 days.",
    name: 'Karen Chen',
    title: 'Operations VP, Pacific Injury Group',
    initials: 'KC',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold">Trusted by Leading Firms</h2>
          <p className="mt-3 text-muted-foreground">See what our customers have to say</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-xl border border-border bg-card"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-5">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}