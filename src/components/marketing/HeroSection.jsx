import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import DemoRequestModal from './DemoRequestModal';
import AIMindmap from './AIMindmap';

export default function HeroSection() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0A0E1A] via-[#0A0E1A] to-[#1A2233]/20">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8 sm:pt-16 sm:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            AI INTAKE PLATFORM
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            AI Across the Entire{' '}
            <span className="text-primary">Lead Lifecycle</span>
          </h1>

          <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Re-engage dead leads. Convert raw forms. Capture retainers. The AI works on every lead state, not just new ones.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/signup">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2" onClick={() => setDemoOpen(true)}>
              Talk to Founder
            </Button>
          </div>

          <DemoRequestModal open={demoOpen} onOpenChange={setDemoOpen} />

          <p className="mt-3 text-xs text-muted-foreground">
            14-day free trial · No credit card required · Cancel anytime
          </p>
        </motion.div>

        {/* AIMindmap Visualization */}
        <AIMindmap />
      </div>
    </section>
  );
}