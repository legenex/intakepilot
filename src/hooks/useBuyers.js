import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useOrg } from '@/lib/OrgContext';

export function useBuyers() {
  const { currentOrg } = useOrg();
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!currentOrg) return;
    setLoading(true);
    const results = await base44.entities.Buyer.filter({ organization_id: currentOrg.id }, 'name');
    setBuyers(results);
    setLoading(false);
  }, [currentOrg]);

  useEffect(() => { fetch(); }, [fetch]);
  return { buyers, loading, refetch: fetch, setBuyers };
}

export function useEligibleBuyers(lead) {
  const { buyers } = useBuyers();
  if (!lead) return [];
  return buyers.filter(b => {
    if (!b.active) return false;
    if (b.current_day_count >= b.daily_cap) return false;
    if (b.verticals?.length && !b.verticals.includes(lead.vertical)) return false;
    if (b.states?.length && lead.state && !b.states.includes(lead.state)) return false;
    return true;
  }).sort((a, b) => (b.price_per_pvql || 0) - (a.price_per_pvql || 0));
}