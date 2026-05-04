import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, Users, HelpCircle, LogOut, ChevronDown, Building2, Briefcase, BarChart3, Database } from 'lucide-react';
import Logo from '@/components/shared/Logo';
import { useOrg } from '@/lib/OrgContext';
import { base44 } from '@/api/base44Client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Leads', href: '/leads', icon: Users },
  { label: 'Buyers', href: '/buyers', icon: Briefcase },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Data Sources', href: '/integrations/data-sources', icon: Database },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function AppSidebar({ collapsed, onClose }) {
  const location = useLocation();
  const { currentOrg, orgs, switchOrg } = useOrg();

  return (
    <div className={`h-full flex flex-col bg-sidebar border-r border-sidebar-border ${collapsed ? 'w-0 overflow-hidden' : 'w-60'} transition-all duration-200`}>
      <div className="p-4 border-b border-sidebar-border">
        <Logo linkTo="/dashboard" />
      </div>

      {/* Org switcher */}
      <div className="p-3 border-b border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-sidebar-accent text-left transition-colors">
              <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">{currentOrg?.name || 'No Org'}</div>
                <div className="text-[10px] text-muted-foreground capitalize">{currentOrg?.plan || 'Free'} plan</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            {orgs.map(org => (
              <DropdownMenuItem key={org.id} onClick={() => { switchOrg(org); if (onClose) onClose(); }}>
                <Building2 className="w-3.5 h-3.5 mr-2" />
                <span className="truncate">{org.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
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
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border space-y-0.5">
        <Link to="/contact" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors">
          <HelpCircle className="w-4 h-4" />
          Support
        </Link>
        <button
          onClick={() => base44.auth.logout('/')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}