import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import Logo from '@/components/shared/Logo';
import { ArrowRight, ArrowLeft, Building2, Briefcase, Check, Loader2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const verticals = [
  { value: 'personal_injury', label: 'Personal Injury', desc: 'Auto accidents, slip & fall, medical malpractice' },
  { value: 'mass_tort', label: 'Mass Tort', desc: 'Product liability, environmental, pharmaceutical' },
  { value: 'workers_comp', label: 'Workers Comp', desc: 'Workplace injuries and occupational diseases' },
  { value: 'multi_vertical', label: 'Multi-Vertical', desc: 'Multiple practice areas' },
  { value: 'other', label: 'Other', desc: 'Custom practice area' },
];

const plans = [
   { value: 'starter', label: 'Starter', price: '$297/mo', desc: '500 SMS · 200 voice mins · 2 agents' },
   { value: 'professional', label: 'Professional', price: '$597/mo', desc: '2,500 SMS · 1,500 voice mins · 10 agents', popular: true },
   { value: 'agency', label: 'Agency', price: '$997/mo', desc: '10,000 SMS · 7,500 voice mins · Unlimited agents' },
 ];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [orgName, setOrgName] = useState('');
  const [vertical, setVertical] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadUser = async () => {
      const me = await base44.auth.me();
      setUser(me);
      // Check if user already has org
      try {
        const memberships = await base44.entities.OrganizationMember.filter({ 
          user_email: me.email, 
          status: 'active' 
        });
        if (memberships && memberships.length > 0) {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Failed to check memberships:', error);
      }
    };
    loadUser();
  }, [navigate]);

  const createOrganization = async () => {
    setLoading(true);
    const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);

    try {
      // Check if user already has an org (idempotency)
      const existingMemberships = await base44.entities.OrganizationMember.filter({
        user_email: user.email,
        status: 'active',
      });
      
      let org;
      if (existingMemberships.length > 0) {
        org = await base44.entities.Organization.filter({
          id: existingMemberships[0].organization_id,
        });
        if (org.length) {
          org = org[0];
        } else {
          throw new Error('Organization not found');
        }
      } else {
        // Create new organization
        org = await base44.entities.Organization.create({
          name: orgName,
          slug,
          vertical,
          subscription_status: 'trialing',
          plan: selectedPlan,
          plan_interval: 'monthly',
          trial_ends_at: trialEnd.toISOString(),
          onboarding_completed: true,
        });

        // Add user as member
        await base44.entities.OrganizationMember.create({
          organization_id: org.id,
          user_email: user.email,
          user_name: user.full_name,
          role: 'owner',
          status: 'active',
          joined_at: new Date().toISOString(),
        });
      }

      // Store org in localStorage (source of truth)
      localStorage.setItem('intakepilot-current-org', org.id);

      // Attempt Stripe checkout (non-blocking)
      try {
        const { stripeCheckout } = await import('@/functions/stripeCheckout');
        const checkoutRes = await stripeCheckout({
          plan: selectedPlan,
          interval: 'monthly',
          organization_id: org.id,
        });

        if (checkoutRes.data?.checkout_url) {
          window.location.href = checkoutRes.data.checkout_url;
          return;
        }
      } catch (stripeError) {
        console.error('Stripe checkout error:', stripeError);
      }

      // Proceed to dashboard (Stripe optional)
      toast({
        title: 'Trial activated!',
        description: 'You can add payment details later in Settings → Billing.',
      });
      setStep(3);
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({ 
        title: 'Error setting up your workspace', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const stepContent = [
    // Step 0: Welcome
    <motion.div key="welcome" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <Zap className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Welcome to IntakePilot</h2>
      <p className="text-muted-foreground mb-6">Let's set up your workspace in 3 quick steps.</p>
      <div className="space-y-3">
        <Label htmlFor="orgName" className="text-left block">Organization Name</Label>
        <Input
          id="orgName"
          value={orgName}
          onChange={e => setOrgName(e.target.value)}
          placeholder="e.g., Mitchell & Associates"
          className="h-11"
        />
      </div>
      <Button
        onClick={() => { if (orgName.trim()) setStep(1); else toast({ title: 'Please enter your organization name', variant: 'destructive' }); }}
        className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 h-11"
      >
        Continue <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </motion.div>,

    // Step 1: Vertical
    <motion.div key="vertical" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h2 className="text-2xl font-bold mb-1">What's your practice area?</h2>
      <p className="text-muted-foreground mb-6 text-sm">This helps us customize your workspace.</p>
      <div className="space-y-2">
        {verticals.map(v => (
          <button
            key={v.value}
            onClick={() => setVertical(v.value)}
            className={`w-full p-3 rounded-lg border text-left transition-all ${
              vertical === v.value
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/30'
            }`}
          >
            <div className="font-medium text-sm">{v.label}</div>
            <div className="text-xs text-muted-foreground">{v.desc}</div>
          </button>
        ))}
      </div>
      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={() => setStep(0)} className="flex-1">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        <Button
          onClick={() => { if (vertical) setStep(2); else toast({ title: 'Please select a practice area', variant: 'destructive' }); }}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Continue <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </motion.div>,

    // Step 2: Plan
     <motion.div key="plan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
       <h2 className="text-2xl font-bold mb-1">Choose your plan</h2>
       <p className="text-muted-foreground mb-6 text-sm">14-day free trial. Card required upfront but won't be charged until trial ends.</p>
      <div className="space-y-2">
        {plans.map(p => (
          <button
            key={p.value}
            onClick={() => setSelectedPlan(p.value)}
            className={`w-full p-4 rounded-lg border text-left transition-all relative ${
              selectedPlan === p.value
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/30'
            }`}
          >
            {p.popular && (
              <span className="absolute -top-2 right-3 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Popular
              </span>
            )}
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-sm">{p.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5 font-mono">{p.desc}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm">{p.price}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        <Button
          onClick={createOrganization}
          disabled={loading}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Start Trial <ArrowRight className="ml-2 w-4 h-4" /></>}
        </Button>
      </div>
    </motion.div>,

    // Step 3: Success
    <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
      <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
        <Check className="w-8 h-8 text-success" />
      </div>
      <h2 className="text-2xl font-bold mb-2">You're all set!</h2>
      <p className="text-muted-foreground mb-6">Your workspace is ready. Let's get you started.</p>
      <Button onClick={() => navigate('/dashboard')} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11">
        Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </motion.div>,
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1 mb-8 justify-center">
          {[0, 1, 2, 3].map(s => (
            <div key={s} className={`h-1 rounded-full transition-all ${s <= step ? 'bg-primary w-10' : 'bg-border w-6'}`} />
          ))}
        </div>

        <div className="p-6 rounded-xl border border-border bg-card">
          <AnimatePresence mode="wait">
            {stepContent[step]}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}