import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { LayoutDashboard, Settings, Users, CreditCard, HelpCircle } from 'lucide-react';

const commands = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Organization Settings', icon: Settings, href: '/settings/organization' },
  { label: 'Team Members', icon: Users, href: '/settings/team' },
  { label: 'Billing', icon: CreditCard, href: '/settings/billing' },
  { label: 'Support', icon: HelpCircle, href: '/contact' },
];

export default function CommandPalette({ open, onOpenChange }) {
  const navigate = useNavigate();

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search commands..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {commands.map(cmd => (
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
      </CommandList>
    </CommandDialog>
  );
}