import React from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import Logo from '@/components/shared/Logo';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SignIn() {
  const handleLogin = () => {
    base44.auth.redirectToLogin('/dashboard');
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
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your IntakePilot account</p>
        </div>

        <div className="p-6 rounded-xl border border-border bg-card space-y-4">
          <Button onClick={handleLogin} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11">
            Sign In
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/start" className="text-primary hover:underline font-medium">Start free trial</Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing in, you agree to our{' '}
          <Link to="/terms" className="underline">Terms</Link> and{' '}
          <Link to="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}