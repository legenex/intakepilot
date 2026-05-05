import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const OrgContext = createContext(null);

export function OrgProvider({ children }) {
  const [currentOrg, setCurrentOrg] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOrgs = async () => {
    try {
      let user;
      try { user = await base44.auth.me(); } catch (_) { user = null; }
      if (!user) { setLoading(false); return; }
      
      const memberships = await base44.entities.OrganizationMember.filter(
        { user_email: user.email, status: 'active' }
      );
      
      if (memberships.length === 0) {
        setLoading(false);
        return;
      }

      // Use filter() per org ID instead of get() — filter returns [] on miss, get() throws 404
      const orgIds = memberships.map(m => m.organization_id);
      const userOrgs = [];
      for (const orgId of orgIds) {
        try {
          const matches = await base44.entities.Organization.filter({ id: orgId });
          if (matches.length > 0 && !matches[0].soft_delete_at) {
            userOrgs.push(matches[0]);
          }
        } catch (err) {
          console.warn(`Could not fetch org ${orgId}:`, err?.message);
        }
      }
      
      setOrgs(userOrgs);
      
      const savedOrgId = localStorage.getItem('intakepilot-current-org');
      const savedOrg = userOrgs.find(o => o.id === savedOrgId);
      const activeOrg = savedOrg || userOrgs[0];
      
      setCurrentOrg(activeOrg);
      const activeMembership = memberships.find(m => m.organization_id === activeOrg?.id);
      setMembership(activeMembership);
    } catch (e) {
      console.error('Failed to load orgs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrgs(); }, []);

  const switchOrg = (org) => {
    setCurrentOrg(org);
    localStorage.setItem('intakepilot-current-org', org.id);
  };

  const refreshOrgs = () => loadOrgs();

  return (
    <OrgContext.Provider value={{ currentOrg, orgs, membership, loading, switchOrg, refreshOrgs }}>
      {children}
    </OrgContext.Provider>
  );
}

export const useOrg = () => useContext(OrgContext);