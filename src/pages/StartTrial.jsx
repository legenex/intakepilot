import React from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import Logo from '@/components/shared/Logo';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const benefits = [
  '14-day free trial — no credit card required',
  'Full access to all features',
  'Set up your first AI agent in minutes',
  'Cancel anytime',
];

export default function StartTrial() {
  const handleSignUp = () => {
    base44.auth.redirectToLogin('/onboarding');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold">Start Your Free Trial</h1>
          <p className="text-sm text-muted-foreground mt-1">Get started with IntakePilot in minutes</p>
        </div>

        <div className="p-6 rounded-xl border border-border bg-card space-y-5">
          <div className="space-y-2">
            {benefits.map(b => (
              <div key={b} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-success flex-shrink-0" />
                <span className="text-muted-foreground">{b}</span>
              </div>
            ))}
          </div>

          <Button onClick={handleSignUp} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11">
            Create Account
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/sign-in" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By creating an account, you agree to our{' '}
          <Link to="/terms" className="underline">Terms</Link> and{' '}
          <Link to="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}