import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useOrg } from '@/lib/OrgContext';

export function useLeads({ filters = {}, sort = '-created_date', limit = 50, skip = 0 } = {}) {
  const { currentOrg } = useOrg();
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    if (!currentOrg) return;
    setLoading(true);
    const query = { organization_id: currentOrg.id, ...filters };
    // exclude soft-deleted by default
    if (!filters.include_deleted) query.deleted_at = null;
    delete query.include_deleted;
    const results = await base44.entities.Lead.filter(query, sort, limit, skip);
    setLeads(results);
    setTotal(results.length); // approximation
    setLoading(false);
  }, [currentOrg, JSON.stringify(filters), sort, limit, skip]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  return { leads, total, loading, refetch: fetchLeads, setLeads };
}

export function useLeadActivity(leadId, orgId) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!leadId || !orgId) return;
    const results = await base44.entities.LeadActivity.filter(
      { lead_id: leadId, organization_id: orgId },
      '-created_date', 50
    );
    setActivities(results);
    setLoading(false);
  }, [leadId, orgId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { activities, loading, refetch: fetch };
}

export async function logActivity({ organization_id, lead_id, type, payload, actor, actor_label }) {
  return base44.entities.LeadActivity.create({
    organization_id, lead_id, type,
    payload: payload || {},
    actor: actor || 'system',
    actor_label: actor_label || 'System',
  });
}