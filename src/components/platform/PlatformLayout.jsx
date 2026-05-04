import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { isSuperAdmin } from '@/lib/superAdmin';
import PlatformSidebar from './PlatformSidebar';
import PlatformTopBar from './PlatformTopBar';
import PageNotFound from '@/lib/PageNotFound';

export default function PlatformLayout() {
  const [isAuthorized, setIsAuthorized] = useState(null);

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
    <div className="flex h-screen bg-background">
      <PlatformSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}