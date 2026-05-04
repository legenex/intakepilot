import React, { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PlatformSidebar from './PlatformSidebar';
import PlatformTopBar from './PlatformTopBar';

export default function PlatformLayout() {
  const [authorized, setAuthorized] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    checkSuperAdmin();
  }, []);

  const checkSuperAdmin = async () => {
    try {
      const user = await base44.auth.me();
      if (!user) {
        setAuthorized(false);
        return;
      }

      const users = await base44.asServiceRole.entities.User.filter({ id: user.id });
      if (users.length && users[0].super_admin) {
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setAuthorized(false);
    }
  };

  if (authorized === null) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Indigo platform banner */}
      <div className="h-1 bg-indigo-500" />

      {/* Platform mode indicator */}
      <div className="px-4 py-1.5 bg-indigo-500/10 border-b border-indigo-500/20 flex items-center justify-between text-xs font-semibold text-indigo-600">
        <span>PLATFORM ADMIN MODE</span>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="text-indigo-600 hover:text-indigo-700 underline"
        >
          Exit Platform
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <PlatformSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <PlatformTopBar />
          <main className="flex-1 overflow-auto bg-background">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}