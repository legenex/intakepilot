import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import { Send, CheckCircle } from 'lucide-react';

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    await base44.entities.SupportTicket.create({
      name: form.name,
      email: form.email,
      company: form.company,
      message: form.message,
      subject: 'Contact form submission',
      status: 'open',
    });
    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-success" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Message Sent</h2>
          <p className="text-muted-foreground">We'll get back to you within 24 hours.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold">Get in Touch</h1>
          <p className="mt-3 text-muted-foreground">Have questions? We'd love to hear from you.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-xl border border-border bg-card">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input id="name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your name" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@company.com" className="mt-1" />
            </div>
          </div>
          <div>
            <Label htmlFor="company">Company</Label>
            <Input id="company" value={form.company} onChange={e => setForm({...form, company: e.target.value})} placeholder="Your company" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea id="message" value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="How can we help?" rows={5} className="mt-1" />
          </div>
          <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {submitting ? 'Sending...' : <>Send Message <Send className="ml-2 w-4 h-4" /></>}
          </Button>
        </form>
      </div>
    </section>
  );
}