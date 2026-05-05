import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function DemoRequestModal({ open, onOpenChange }) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    await base44.entities.SupportTicket.create({
      customer_email: email,
      customer_name: 'Demo Request',
      organization_id: 'public',
      subject: 'New Demo Request',
      message: `A demo was requested from the marketing site.\n\nEmail: ${email}`,
      status: 'open',
    });
    toast({ title: "Demo request submitted! We'll be in touch soon." });
    setEmail('');
    onOpenChange(false);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request a Live Demo</DialogTitle>
          <DialogDescription>
            Schedule a personalized walkthrough with our team
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="demo-email" className="text-sm">
              Work Email
            </Label>
            <Input
              id="demo-email"
              type="email"
              placeholder="your@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-9 text-sm"
            />
          </div>

          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground">
              Our team will reach out within 24 hours to schedule your demo.
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading || !email.trim()}
            >
              {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Request Demo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}