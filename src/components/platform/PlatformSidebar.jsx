import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, AlertTriangle, Users, MessageSquare, Shield, Zap,
  Database, BarChart3, Settings, Trash2, Key, LogOut, Building2
} from 'lucide-react';
import Logo from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/platform', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Customers',
    items: [
      { label: 'Organizations', href: '/platform/organizations', icon: Building2 },
      { label: 'Users', href: '/platform/users', icon: Users },
      { label: 'Impersonation', href: '/platform/impersonation', icon: Shield },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Billing', href: '/platform/billing', icon: BarChart3 },
      { label: 'Health', href: '/platform/health', icon: AlertTriangle },
      { label: 'Support', href: '/platform/support', icon: MessageSquare },
      { label: 'Audit Log', href: '/platform/audit-log', icon: Shield },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { label: 'Announcements', href: '/platform/announcements', icon: Zap },
      { label: 'Feature Flags', href: '/platform/feature-flags', icon: Settings },
      { label: 'Integrations', href: '/platform/integrations-overview', icon: Database },
      { label: 'Data Tools', href: '/platform/data-tools', icon: Database },
      { label: 'API Keys', href: '/platform/api-keys', icon: Key },
      { label: 'Workflows', href: '/platform/workflows', icon: Zap },
      { label: 'BigQuery', href: '/platform/bigquery', icon: Database },
    ],
  },
  {
    label: 'Advanced',
    items: [
      { label: 'Danger Zone', href: '/platform/danger-zone', icon: Trash2 },
    ],
  },
];

export default function PlatformSidebar() {
  const location = useLocation();

  return (
    <div className="w-60 h-screen flex flex-col bg-sidebar border-r border-sidebar-border overflow-hidden">
      <div className="p-4 border-b border-sidebar-border">
        <Logo linkTo="/platform" />
        <p className="text-[10px] font-semibold text-sidebar-primary mt-2">SUPER ADMIN</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-4">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            <p className="px-3 pb-1 text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider">{section.label}</p>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-primary'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-2 border-t border-sidebar-border">
        <Button
          onClick={() => base44.auth.logout('/')}
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground"
          size="sm"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}