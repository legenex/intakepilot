import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { isSuperAdmin } from '@/lib/superAdmin';
import { useOrg } from '@/lib/OrgContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import PlatformSidebar from './PlatformSidebar';
import PlatformTopBar from './PlatformTopBar';
import PageNotFound from '@/lib/PageNotFound';

export default function PlatformLayout() {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const { currentOrg } = useOrg();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        const isAdmin = await isSuperAdmin(user);
        setIsAuthorized(isAdmin);
      } catch (err) {
        console.error('Auth check failed:', err);
        setIsAuthorized(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthorized === null) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) {
    return <PageNotFound />;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Platform header */}
      <div className="bg-indigo-600/10 border-b border-indigo-200/20 px-6 py-2 flex items-center justify-between h-10">
        <p className="text-[10px] font-semibold text-indigo-700 uppercase tracking-widest">Platform Admin Mode</p>
        {currentOrg && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-indigo-700 hover:bg-indigo-500/10 text-xs h-7 gap-1"
          >
            <ArrowLeft className="w-3 h-3" /> Back to {currentOrg.name}
          </Button>
        )}
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        <PlatformSidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}