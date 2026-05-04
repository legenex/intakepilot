import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { LayoutDashboard, Settings, Users, CreditCard, HelpCircle, Upload, UserPlus, BarChart3, Briefcase, Zap, Phone, MessageSquare, Shield, PlugZap } from 'lucide-react';

const commandGroups = [
  {
    label: 'Pipeline',
    commands: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
      { label: 'View Leads', icon: Users, href: '/leads' },
      { label: 'Import CSV', icon: Upload, href: '/leads/import' },
      { label: 'Buyers', icon: Briefcase, href: '/buyers' },
      { label: 'Analytics', icon: BarChart3, href: '/analytics' },
    ],
  },
  {
    label: 'AI Automation',
    commands: [
      { label: 'AI Agents', icon: Zap, href: '/agents' },
      { label: 'Create Agent', icon: Zap, href: '/agents/new' },
      { label: 'Call Center', icon: Phone, href: '/calls' },
      { label: 'Messages', icon: MessageSquare, href: '/messages' },
    ],
  },
  {
    label: 'Settings & Compliance',
    commands: [
      { label: 'Integrations', icon: PlugZap, href: '/integrations' },
      { label: 'Compliance Audit', icon: Shield, href: '/admin/compliance' },
      { label: 'Organization Settings', icon: Settings, href: '/settings/organization' },
      { label: 'Team Members', icon: UserPlus, href: '/settings/team' },
      { label: 'Billing', icon: CreditCard, href: '/settings/billing' },
      { label: 'Support', icon: HelpCircle, href: '/contact' },
    ],
  },
];

export default function CommandPalette({ open, onOpenChange }) {
  const navigate = useNavigate();

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search commands..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {commandGroups.map(group => (
          <CommandGroup key={group.label} heading={group.label}>
            {group.commands.map(cmd => (
              <CommandItem
                key={cmd.href}
                onSelect={() => { navigate(cmd.href); onOpenChange(false); }}
                className="cursor-pointer"
              >
                <cmd.icon className="w-4 h-4 mr-2" />
                {cmd.label}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}