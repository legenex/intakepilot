import React from 'react';
import { Outlet } from 'react-router-dom';
import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';

export default function MarketingLayout() {
  return (
    <div className="marketing-root">
      <MarketingNav />
      <main>
        <Outlet />
      </main>
      <MarketingFooter />
    </div>
  );
}