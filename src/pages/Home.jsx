import React from 'react';
import HeroSection from '@/components/marketing/HeroSection';
import PipelineSection from '@/components/marketing/PipelineSection';
import FeaturesGrid from '@/components/marketing/FeaturesGrid';
import TrustBand from '@/components/marketing/TrustBand';
import TestimonialsSection from '@/components/marketing/TestimonialsSection';
import CTASection from '@/components/marketing/CTASection';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <PipelineSection />
      <FeaturesGrid />
      <TrustBand />
      <TestimonialsSection />
      
      {/* Pricing teaser */}
      <section className="py-16 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">Simple, Transparent Pricing</h2>
          <p className="mt-3 text-muted-foreground">Plans starting at $297/mo. 14-day free trial included.</p>
          <Link to="/pricing" className="mt-6 inline-block">
            <Button variant="outline" className="gap-2">
              View Plans <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <CTASection />
    </div>
  );
}