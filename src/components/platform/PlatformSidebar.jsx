import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, Clock, LogOut } from 'lucide-react';
import Logo from '@/components/shared/Logo';
import { base44 } from '@/api/base44Client';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/platform', icon: LayoutDashboard },
  { label: 'Organizations', href: '/platform/organizations', icon: Building2 },
  { label: 'Users', href: '/platform/users', icon: Users },
  { label: 'Impersonation', href: '/platform/impersonation', icon: Clock },
];

export default function PlatformSidebar({ collapsed }) {
  const location = useLocation();

  return (
    <div className={`h-full flex flex-col bg-sidebar border-r border-sidebar-border ${collapsed ? 'w-0 overflow-hidden' : 'w-60'} transition-all duration-200`}>
      <div className="p-4 border-b border-sidebar-border">
        <Logo linkTo="/platform" />
      </div>

      <nav className="flex-1 p-2 overflow-y-auto space-y-0.5">
        {NAV_ITEMS.map(item => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-500/20 text-indigo-600'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={() => base44.auth.logout('/dashboard')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Exit Admin
        </button>
      </div>
    </div>
  );
}