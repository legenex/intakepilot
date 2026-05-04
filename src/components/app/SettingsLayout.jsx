import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Building2, Users, CreditCard, Palette, User } from 'lucide-react';

const tabs = [
  { label: 'Organization', href: '/settings/organization', icon: Building2 },
  { label: 'Team', href: '/settings/team', icon: Users },
  { label: 'Billing', href: '/settings/billing', icon: CreditCard },
  { label: 'Branding', href: '/settings/branding', icon: Palette },
  { label: 'Profile', href: '/settings/profile', icon: User },
];

export default function SettingsLayout() {
  const location = useLocation();

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Tab nav */}
      <div className="flex overflow-x-auto border-b border-border mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
        {tabs.map(tab => {
          const isActive = location.pathname === tab.href;
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      <Outlet />
    </div>
  );
}