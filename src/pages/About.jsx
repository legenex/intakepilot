import React from 'react';
import { motion } from 'framer-motion';
import CTASection from '@/components/marketing/CTASection';

const team = [
  { name: 'Alex Chen', role: 'CEO & Co-Founder', initials: 'AC' },
  { name: 'Maria Santos', role: 'CTO & Co-Founder', initials: 'MS' },
  { name: 'David Park', role: 'VP of Engineering', initials: 'DP' },
  { name: 'Rachel Kim', role: 'Head of Product', initials: 'RK' },
];

export default function About() {
  return (
    <div>
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl sm:text-5xl font-bold">Our Mission</h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              We started IntakePilot because we saw the same problem everywhere in legal: 
              firms spending millions on lead generation, then losing 60-80% of those leads 
              to slow, inconsistent intake processes.
            </p>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Our founders spent years building AI systems for high-volume contact centers. 
              When we discovered the legal intake space, we realized the same technology 
              could transform how firms convert leads into clients — faster, more consistently, 
              and at a fraction of the cost.
            </p>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Today, IntakePilot helps personal injury firms and lead-gen agencies convert 
              more leads into signed retainers using AI voice agents, SMS automation, and 
              intelligent workflow design.
            </p>
          </motion.div>

          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Our Team</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {team.map((member, i) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-xl border border-border bg-card text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary font-semibold">
                    {member.initials}
                  </div>
                  <h4 className="font-semibold text-sm">{member.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{member.role}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <CTASection />
    </div>
  );
}