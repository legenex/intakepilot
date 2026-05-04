import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Menu, X, Search, AlertTriangle, Loader2 } from 'lucide-react';
import { useOrg } from '@/lib/OrgContext';
import { Skeleton } from '@/components/ui/skeleton';
import CommandPalette from '@/components/app/CommandPalette';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';

export default function AppLayout() {
   const [mobileOpen, setMobileOpen] = useState(false);
   const [commandOpen, setCommandOpen] = useState(false);
   const [portalLoading, setPortalLoading] = useState(false);
   const { loading, currentOrg } = useOrg();
   const subStatus = useSubscriptionStatus();
   const navigate = useNavigate();

  // Listen for ⌘K
  React.useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen">
        <div className="w-60 border-r border-border p-4 space-y-4 hidden lg:block">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-full" />
          <div className="space-y-2 mt-6">
            {[1,2,3].map(i => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
        </div>
        <div className="flex-1 p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative w-60 h-full">
            <AppSidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
       <div className="flex-1 flex flex-col min-w-0">
         {/* Subscription status banners */}
         {subStatus.isPastDue && (
           <div className="bg-destructive/5 border-b border-destructive/20 px-4 py-2.5 flex items-center justify-between">
             <div className="flex items-center gap-2">
               <AlertTriangle className="w-4 h-4 text-destructive" />
               <p className="text-sm font-medium text-destructive">Payment failed. Update your payment method to keep your account active.</p>
             </div>
             <Button
               size="sm"
               variant="outline"
               onClick={async () => {
                 setPortalLoading(true);
                 try {
                   const { stripePortal } = await import('@/functions/stripePortal');
                   const res = await stripePortal({ organization_id: currentOrg.id });
                   if (res.data?.portal_url) window.open(res.data.portal_url, '_blank');
                 } catch (err) {
                   console.error('Failed to open portal:', err);
                 } finally {
                   setPortalLoading(false);
                 }
               }}
               disabled={portalLoading}
               className="h-8 text-xs"
             >
               {portalLoading && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
               Update Payment
             </Button>
           </div>
         )}
         {subStatus.isTrialing && subStatus.daysUntilTrialEnd !== null && subStatus.daysUntilTrialEnd <= 3 && (
           <div className="bg-warning/5 border-b border-warning/20 px-4 py-2.5">
             <p className="text-sm text-warning">
               Your trial ends in <span className="font-semibold">{subStatus.daysUntilTrialEnd} days</span>. Add a payment method to continue after trial.
             </p>
           </div>
         )}

         {/* Top bar */}
         <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-background flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <button
              onClick={() => setCommandOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/50 text-muted-foreground text-sm hover:bg-muted transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search...</span>
              <kbd className="text-[10px] font-mono bg-background border border-border rounded px-1.5 py-0.5 ml-4">⌘K</kbd>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}