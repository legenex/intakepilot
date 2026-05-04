import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, Settings } from 'lucide-react';

export default function PlatformTopBar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  return (
    <div className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
      <div className="text-sm text-muted-foreground">
        {user && `Logged in as ${user.email}`}
      </div>
      <div className="flex items-center gap-3">
        <button className="text-muted-foreground hover:text-foreground">
          <Bell className="w-4 h-4" />
        </button>
        <button className="text-muted-foreground hover:text-foreground">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}