import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import PlatformSidebar from './PlatformSidebar';

export default function PlatformLayout() {
  const { user } = useAuth();

  // Check if user is super admin
  if (!user || user.super_admin !== true) {
    return <Navigate to="/" replace />;
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