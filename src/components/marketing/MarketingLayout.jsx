import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNav from './PublicNav';
import Footer from './Footer';

export default function MarketingLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}